const FORBIDDEN_CODE = 403;

/**
 * 网站域名
 * @type {string}
 */
const WEB_HOST = 'https://www.mianshiya.com';

/**
 * 对象存储域名
 * @type {string}
 */
const COS_HOST = 'https://xxx.mianshiya.com';

/**
 * 添加用户积分
 */
const ADD_USER_SCORE_REASON = {
  DAILY_LOGIN: {
    value: 0,
    score: 1,
  },
  ADD_QUESTION: {
    value: 1,
    score: 5,
  },
  GOOD_ANSWER: {
    value: 2,
    score: 3,
  },
  REPORT_PASS: {
    value: 3,
    score: 2,
  },
  STANDARD_ANSWER: {
    value: 4,
    score: 5,
  },
};

/**
 * 查询简略用户信息需要的字段
 * @type {{score: boolean, avatarUrl: boolean, nickName: boolean, authority: boolean, _id: boolean}}
 */
const SIMPLE_USER_FIELDS = {
  _id: true,
  nickName: true,
  avatarUrl: true,
  score: true,
  authority: true,
  profile: true,
};

/**
 * 永封 IP
 * @type {string[]}
 */
const BLACK_IP_LIST = [
  '111.202.85.21',
  '114.117.161.191',
  '82.156.28.118',
];

module.exports = {
  FORBIDDEN_CODE,
  BLACK_IP_LIST,
  ADD_USER_SCORE_REASON,
  SIMPLE_USER_FIELDS,
  WEB_HOST,
  COS_HOST,
};
