import { formatCurrency, getTypeLabel } from './amountParser.js';

function escapeCSV(value) {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function recordsToCSV(records) {
  const header = ['来源图片', '图片名称', '原始识别文本', '金额', '类型', '是否计入总和'];
  const rows = records.map((record) => [
    record.sourceImageLabel,
    record.imageName,
    record.rawText,
    Number(record.amount || 0).toFixed(2),
    getTypeLabel(record.type),
    record.included ? '是' : '否'
  ]);

  return [header, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\n');
}

export function downloadCSV(records, filename = '银行流水金额汇总.csv') {
  const csv = `\ufeff${recordsToCSV(records)}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function buildSummaryText(summary, records) {
  const counted = records.filter((record) => record.included);

  return [
    '银行流水图片金额汇总',
    `总收入：${formatCurrency(summary.totalIncome)}`,
    `总支出：${formatCurrency(summary.totalExpense)}`,
    `未分类金额总和：${formatCurrency(summary.totalUncategorized)}`,
    `净额：${formatCurrency(summary.netAmount)}`,
    `总金额：${formatCurrency(summary.totalAmount)}`,
    `计入统计的金额条数：${summary.includedCount}`,
    `识别金额总条数：${records.length}`,
    '',
    '明细：',
    ...counted.map(
      (record, index) =>
        `${index + 1}. ${record.sourceImageLabel} | ${getTypeLabel(record.type)} | ${formatCurrency(
          record.amount
        )} | ${record.rawText}`
    ),
    '',
    '提示：OCR 识别结果可能存在误差，请自行核对银行流水原图。'
  ].join('\n');
}
