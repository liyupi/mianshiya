const cheerio = require('cheerio');
const xss = require('xss');
const { WEB_HOST } = require('../constant');

/**
 * 检查用户是否合法
 * @param user
 */
const isValidUser = (user) => {
  if (!user?._id) {
    return false;
  }
  // 被删除或封禁
  if (user.isDelete || user.authority === 'ban') {
    console.log(`isValidUser invalid user = ${JSON.stringify(user)} `);
    return false;
  }
  return true;
};

/**
 * 是否为管理员
 * @param user
 * @returns {boolean}
 */
const isAdminUser = (user) => {
  if (!user?._id || !user.authority) {
    return false;
  }
  return user.authority.includes('admin');
};

/**
 * 获取题目的显示标题
 * @param question
 */
const getQuestionTitle = (question) => {
  if (!question) {
    return '';
  }
  // 有标题直接用标题
  if (question.name) {
    return xss(question.name);
  }
  // 没标题，用描述代替
  return cheerio.load(question.detail).text().trim();
};

/**
 * 获取题目详情页链接
 * @param question
 * @param full 是否为完整链接
 * @returns {string}
 */
const getQuestionDetailLink = (question, full = false) => {
  if (!question) {
    return '';
  }
  return `${full ? WEB_HOST : ''}/qd/${question._id}`;
};

/**
 * 获取题目回答详情页链接
 * @param questionId
 * @param commentId
 * @param full 是否为完整链接
 * @returns {string}
 */
const getQuestionCommentDetailLink = (questionId, commentId, full = false) => {
  if (!questionId || !commentId) {
    return '';
  }
  return `${full ? WEB_HOST : ''}/qd/${questionId}/c/${commentId}`;
};

module.exports = {
  isValidUser,
  isAdminUser,
  getQuestionTitle,
  getQuestionDetailLink,
  getQuestionCommentDetailLink,
};
