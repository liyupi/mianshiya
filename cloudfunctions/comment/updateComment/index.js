const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const xss = require('xss');
const cheerio = require('cheerio');

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
  let { content, priority = -1 } = comment;
  if (!content && priority < 0) {
    return false;
  }
  // 如果要修改内容
  if (content) {
    // 如果不包含任何文本
    if (!cheerio.load(content).text().trim()) {
      return false;
    }
    // 防止 XSS 攻击
    content = xss(content);
  }

  // 获取当前登录用户
  const { userInfo } = app.auth().getEndUserInfo();
  if (!userInfo || !userInfo.customUserId) {
    return false;
  }
  const currentUser = await db
    .collection('user')
    .where({
      unionId: userInfo.customUserId,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);
  if (!currentUser || !currentUser._id) {
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
  if (originComment.userId !== currentUser._id && !currentUser.authority.includes('admin')) {
    return false;
  }
  const updateData = {};
  if (content) {
    updateData.content = content;
  }
  if (priority >= 0) {
    updateData.priority = priority;
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
