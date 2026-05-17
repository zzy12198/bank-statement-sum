import { Copy, Download, FileBarChart } from 'lucide-react';
import { useState } from 'react';
import { buildSummaryText, downloadCSV } from '../utils/csvExport.js';

export default function ExportButtons({ records, summary }) {
  const [report, setReport] = useState('');
  const [copied, setCopied] = useState(false);

  const summaryText = buildSummaryText(summary, records);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="panel p-4 sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">导出结果</h2>
          <p className="mt-1 text-sm text-slate-500">可导出 CSV、复制汇总结果，也可生成简单报表。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-primary"
            type="button"
            onClick={() => downloadCSV(records)}
            disabled={records.length === 0}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            导出 CSV
          </button>
          <button className="btn-secondary" type="button" onClick={handleCopy} disabled={records.length === 0}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            {copied ? '已复制' : '复制汇总'}
          </button>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => setReport(summaryText)}
            disabled={records.length === 0}
          >
            <FileBarChart className="h-4 w-4" aria-hidden="true" />
            生成报表
          </button>
        </div>
      </div>
      {report && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-700">
            {report}
          </pre>
        </div>
      )}
    </section>
  );
}
