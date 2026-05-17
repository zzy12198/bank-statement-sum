export const AMOUNT_TYPES = {
  income: '收入',
  expense: '支出',
  uncategorized: '未分类'
};

const INCOME_KEYWORDS = [
  '收入',
  '入账',
  '收款',
  '转入',
  '贷方',
  '工资',
  '退款',
  '到账',
  '存入',
  '充值',
  '结息'
];

const EXPENSE_KEYWORDS = [
  '支出',
  '付款',
  '消费',
  '转出',
  '借方',
  '扣款',
  '提现',
  '还款',
  '支付',
  '费用',
  '手续费',
  '缴费'
];

const MONEY_PATTERN = /(?:[¥￥]\s*)?([+-]?\s*(?:\d{1,3}(?:,\d{3})+|\d+)(?:[.,]\d{1,2})?)(?![\d,.])/g;

export function createId(prefix = 'record') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function normalizeAmount(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  const normalized = String(value)
    .replace(/[¥￥,\s]/g, '')
    .replace('＋', '+')
    .replace('－', '-')
    .replace(/。/g, '.');

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function hasAnyKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function detectType(context, numericText) {
  const cleanNumber = numericText.replace(/\s/g, '');

  if (cleanNumber.startsWith('-')) {
    return 'expense';
  }

  if (cleanNumber.startsWith('+')) {
    return 'income';
  }

  const hasIncome = hasAnyKeyword(context, INCOME_KEYWORDS);
  const hasExpense = hasAnyKeyword(context, EXPENSE_KEYWORDS);

  if (hasIncome && !hasExpense) {
    return 'income';
  }

  if (hasExpense && !hasIncome) {
    return 'expense';
  }

  return 'uncategorized';
}

function shouldKeepCandidate(rawMatch, numericText, context) {
  const hasCurrency = /[¥￥]/.test(rawMatch);
  const hasSign = /^[¥￥\s]*[+-]/.test(rawMatch);
  const hasComma = numericText.includes(',');
  const hasDecimal = /[.,]\d{1,2}$/.test(numericText.trim());
  // 裸整数很容易是日期、流水号或余额编号，因此第一版只保留金额特征更明确的候选。
  return hasCurrency || hasSign || hasComma || hasDecimal;
}

function isDateOrTimeFragment(line, startIndex, rawMatch) {
  const before = line[startIndex - 1] || '';
  const after = line[startIndex + rawMatch.length] || '';
  const startsWithSign = /^[¥￥\s]*[+-]/.test(rawMatch);

  if (startsWithSign && /\d/.test(before)) {
    return true;
  }

  if (/[-/.年月日时分]/.test(before) || /[-/.年月日时分]/.test(after)) {
    return true;
  }

  if (before === ':' && /\d/.test(line[startIndex - 2] || '')) {
    return true;
  }

  if (after === ':' && /\d/.test(line[startIndex + rawMatch.length + 1] || '')) {
    return true;
  }

  return false;
}

export function parseAmounts(text, imageMeta = {}) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const records = [];

  lines.forEach((line) => {
    const compactLine = line.replace(/\s+/g, ' ');
    let match;

    while ((match = MONEY_PATTERN.exec(compactLine)) !== null) {
      const rawMatch = match[0].trim();
      const numericText = match[1].trim();

      if (isDateOrTimeFragment(compactLine, match.index, match[0])) {
        continue;
      }

      if (!shouldKeepCandidate(rawMatch, numericText, compactLine)) {
        continue;
      }

      const parsedAmount = normalizeAmount(numericText);

      if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
        continue;
      }

      records.push({
        id: createId(),
        imageId: imageMeta.imageId || imageMeta.id || 'unknown-image',
        imageName: imageMeta.imageName || imageMeta.name || '未知图片',
        sourceImageLabel:
          imageMeta.sourceImageLabel || imageMeta.label || imageMeta.imageLabel || '未知来源',
        rawText: compactLine,
        amount: Math.abs(parsedAmount),
        type: detectType(compactLine, numericText),
        included: true,
        createdAt: new Date().toISOString()
      });
    }
  });

  return records;
}

export function calculateSummary(records) {
  const includedRecords = records.filter((record) => record.included);

  return includedRecords.reduce(
    (summary, record) => {
      const amount = Math.abs(Number(record.amount) || 0);

      if (record.type === 'income') {
        summary.totalIncome += amount;
      } else if (record.type === 'expense') {
        summary.totalExpense += amount;
      } else {
        summary.totalUncategorized += amount;
      }

      summary.totalAmount += amount;
      summary.includedCount += 1;
      summary.netAmount = summary.totalIncome - summary.totalExpense;
      return summary;
    },
    {
      totalIncome: 0,
      totalExpense: 0,
      totalUncategorized: 0,
      netAmount: 0,
      totalAmount: 0,
      includedCount: 0
    }
  );
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0);
}

export function getTypeLabel(type) {
  return AMOUNT_TYPES[type] || AMOUNT_TYPES.uncategorized;
}
