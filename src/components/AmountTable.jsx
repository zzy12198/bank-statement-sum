import { Ban, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatCurrency, getTypeLabel } from '../utils/amountParser.js';

const TYPE_OPTIONS = [
  { value: 'income', label: '收入' },
  { value: 'expense', label: '支出' },
  { value: 'uncategorized', label: '未分类' }
];

const emptyDraft = {
  imageId: 'manual',
  rawText: '',
  amount: '',
  type: 'uncategorized'
};

export default function AmountTable({
  records,
  images,
  filterImageId,
  onFilterChange,
  onToggleIncluded,
  onUpdateRecord,
  onDeleteRecord,
  onAddRecord,
  onCancelImageAmounts
}) {
  const [draft, setDraft] = useState(emptyDraft);

  const filteredRecords = useMemo(() => {
    if (filterImageId === 'all') {
      return records;
    }
    return records.filter((record) => record.imageId === filterImageId);
  }, [filterImageId, records]);

  const handleAdd = (event) => {
    event.preventDefault();
    const amount = Number(draft.amount);

    if (!Number.isFinite(amount) || amount === 0) {
      return;
    }

    onAddRecord({
      ...draft,
      amount: Math.abs(amount),
      type: amount < 0 ? 'expense' : draft.type
    });
    setDraft(emptyDraft);
  };

  return (
    <section className="panel p-4 sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">明细编辑</h2>
          <p className="mt-1 text-sm text-slate-500">可修改金额、调整类型、取消计入或删除误识别记录。</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            className="input"
            value={filterImageId}
            onChange={(event) => onFilterChange(event.target.value)}
            aria-label="按图片筛选"
          >
            <option value="all">全部图片</option>
            <option value="manual">手动新增</option>
            {images.map((image) => (
              <option key={image.id} value={image.id}>
                {image.label}
              </option>
            ))}
          </select>
          {filterImageId !== 'all' && (
            <button
              className="btn-secondary"
              type="button"
              onClick={() => onCancelImageAmounts(filterImageId)}
              disabled={!records.some((record) => record.imageId === filterImageId)}
            >
              <Ban className="h-4 w-4" aria-hidden="true" />
              取消此来源金额
            </button>
          )}
        </div>
      </div>

      <form className="mt-4 grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[1fr_2fr_1fr_1fr_auto]" onSubmit={handleAdd}>
        <select
          className="input"
          value={draft.imageId}
          onChange={(event) => setDraft((current) => ({ ...current, imageId: event.target.value }))}
          aria-label="新增金额来源"
        >
          <option value="manual">手动新增</option>
          {images.map((image) => (
            <option key={image.id} value={image.id}>
              {image.label}
            </option>
          ))}
        </select>
        <input
          className="input"
          value={draft.rawText}
          onChange={(event) => setDraft((current) => ({ ...current, rawText: event.target.value }))}
          placeholder="原始文本或备注"
        />
        <input
          className="input"
          value={draft.amount}
          onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))}
          inputMode="decimal"
          placeholder="金额"
        />
        <select
          className="input"
          value={draft.type}
          onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
          aria-label="新增金额类型"
        >
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="btn-primary" type="submit">
          <Plus className="h-4 w-4" aria-hidden="true" />
          新增
        </button>
      </form>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-3 pr-3 font-semibold">来源图片</th>
              <th className="px-3 py-3 font-semibold">原始识别文本</th>
              <th className="px-3 py-3 font-semibold">金额</th>
              <th className="px-3 py-3 font-semibold">类型</th>
              <th className="px-3 py-3 font-semibold">是否计入总和</th>
              <th className="py-3 pl-3 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td className="py-8 text-center text-slate-500" colSpan={6}>
                  暂无金额记录
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.id} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-3 font-semibold text-slate-800">{record.sourceImageLabel}</td>
                  <td className="px-3 py-3">
                    <textarea
                      className="input min-h-12 w-full resize-y"
                      value={record.rawText}
                      onChange={(event) => onUpdateRecord(record.id, { rawText: event.target.value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className="input w-32"
                      value={record.amount}
                      inputMode="decimal"
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        onUpdateRecord(record.id, {
                          amount: Number.isFinite(value) ? Math.abs(value) : 0,
                          type: value < 0 ? 'expense' : record.type
                        });
                      }}
                    />
                    <p className="mt-1 text-xs text-slate-500">{formatCurrency(record.amount)}</p>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      className="input"
                      value={record.type}
                      onChange={(event) => onUpdateRecord(record.id, { type: event.target.value })}
                      aria-label={`${record.sourceImageLabel} 类型`}
                    >
                      {TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-500">{getTypeLabel(record.type)}</p>
                  </td>
                  <td className="px-3 py-3">
                    <label className="inline-flex items-center gap-2 text-slate-700">
                      <input
                        className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                        type="checkbox"
                        checked={record.included}
                        onChange={(event) => onToggleIncluded(record.id, event.target.checked)}
                      />
                      计入
                    </label>
                  </td>
                  <td className="py-3 pl-3">
                    <button className="btn-danger" type="button" onClick={() => onDeleteRecord(record.id)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
