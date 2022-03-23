/**
 * 举报类型信息映射
 */
export const REPORT_TYPE_MAP = {
  0: {
    text: '题目',
  },
  1: {
    text: '用户',
  },
  2: {
    text: '回答',
  },
  3: {
    text: '试卷',
  },
  4: {
    text: '回复',
  },
};

export const REPORT_TYPE_ENUM = {
  QUESTION: 0,
  USER: 1,
  COMMENT: 2,
  PAPER: 3,
  REPLY: 4,
};

export const REPORT_REASON_ENUM = {
  CONTENT_SAME: 0,
  CONTENT_ERROR: 1,
  CONTENT_NOT_SUITABLE: 2,
  BAD_DRAINAGE: 3,
  CONTENT_EXPIRED: 4,
  OTHERS: 100,
};

/**
 * 举报原因信息映射
 */
export const REPORT_REASON_MAP = {
  0: {
    text: '内容重复',
  },
  1: {
    text: '内容错误',
  },
  2: {
    text: '内容非法',
  },
  3: {
    text: '涉嫌引流',
  },
  4: {
    text: '内容过期',
  },
  100: {
    text: '其他',
  },
};

/**
 * 举报类型映射
 */
export const REPORT_REASON_OPTIONS = Object.keys(REPORT_REASON_MAP).map((key) => {
  return { label: REPORT_REASON_MAP[key].text, value: parseInt(key) };
});
