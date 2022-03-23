const app = require('../../../app');

const db = app.database();
const xss = require('xss');
const cheerio = require('cheerio');
const { isValidUser, isAdminUser } = require('../../../utils/bUtils');

/**
 * 更新评论
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 */
exports.main = async (event, context) => {
  const { commentId, comment } = event;
  if (!commentId || !comment) {
    return;
  }
  let { content } = comment;
  if (!content) {
    return false;
  }
  // 如果要修改内容
  if (content) {
    // 校验文本字数
    const trimTextContent = cheerio.load(content).text().trim();
    if (trimTextContent.length < 1 || trimTextContent.length > 50000) {
      return false;
    }
    // 防止 XSS 攻击
    content = xss(content);
  }

  // 获取当前登录用户
  const { userInfo } = context.session;
  if (!userInfo?._id) {
    return false;
  }
  const currentUser = await db
    .collection('user')
    .where({
      _id: userInfo._id,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);
  if (!isValidUser(currentUser)) {
    return false;
  }

  // 仅评论所有者和管理员可更新
  const originComment = await db
    .collection('comment')
    .where({
      _id: commentId,
      isDelete: false,
    })
    .get()
    .then(({ data }) => data[0]);
  if (!originComment) {
    return false;
  }
  if (originComment.userId !== currentUser._id && !isAdminUser(currentUser)) {
    return false;
  }
  const updateData = {};
  if (content) {
    updateData.content = content;
  }
  return await updateComment(db, commentId, updateData);
};

/**
 * 更新问题
 * @param transaction
 * @param commentId
 * @param comment
 * @return {Promise<T | void>}
 */
function updateComment(transaction, commentId, comment) {
  return transaction
    .collection('comment')
    .doc(commentId)
    .update({
      ...comment,
      _updateTime: new Date(),
    });
}
