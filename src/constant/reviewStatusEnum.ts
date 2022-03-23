export default {
  REVIEWING: 0,
  PASS: 1,
  REJECT: 2,
};

/**
 * 审核状态信息映射
 */
export const reviewStatusInfoMap = {
  0: {
    text: '审核中',
    color: 'blue',
  },
  1: {
    text: '已发布',
    color: 'green',
  },
  2: {
    text: '拒绝',
    color: 'red',
  },
};

/**
 * 审核状态信息映射
 */
export const REVIEW_STATUS_MAP = {
  0: '审核中',
  1: '已发布',
  2: '拒绝',
};
