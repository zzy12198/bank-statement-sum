import { Calculator, CircleDollarSign, ListChecks, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/amountParser.js';

const cards = [
  {
    key: 'totalIncome',
    label: '总收入',
    tone: 'text-emerald-700 bg-emerald-50',
    icon: TrendingUp
  },
  {
    key: 'totalExpense',
    label: '总支出',
    tone: 'text-rose-700 bg-rose-50',
    icon: TrendingDown
  },
  {
    key: 'netAmount',
    label: '净额',
    tone: 'text-teal-700 bg-teal-50',
    icon: Wallet
  },
  {
    key: 'totalUncategorized',
    label: '未分类金额',
    tone: 'text-amber-700 bg-amber-50',
    icon: CircleDollarSign
  },
  {
    key: 'totalAmount',
    label: '总金额',
    tone: 'text-slate-700 bg-slate-100',
    icon: Calculator
  }
];

export default function SummaryCard({ summary }) {
  return (
    <section className="panel p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <ListChecks className="h-5 w-5 text-teal-700" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-slate-950">金额汇总</h2>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">{card.label}</p>
                <span className={`rounded-md p-2 ${card.tone}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 break-words text-2xl font-bold text-slate-950">
                {formatCurrency(summary[card.key])}
              </p>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-slate-500">
        当前计入统计的金额条数：<span className="font-semibold text-slate-800">{summary.includedCount}</span>
      </p>
    </section>
  );
}
