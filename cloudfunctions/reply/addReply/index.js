const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const xss = require('xss');

/**
 * 创建回复
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 */
exports.main = async (event, context) => {
  let { content, questionId, commentId, replyId, replyUserId } = event;
  if (!content || !questionId || !commentId) {
    return false;
  }
  if (content.length > 600) {
    return false;
  }
  // 防止 XSS 攻击
  content = xss(content);

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

  return await db
    .collection('reply')
    .add({
      userId: currentUser._id,
      questionId,
      content,
      commentId,
      replyId,
      replyUserId,
      _createTime: new Date(),
      _updateTime: new Date(),
      isDelete: false,
    })
    .then((res) => {
      console.log('addReply succeed', res);
      return res.id;
    })
    .catch((e) => {
      console.error('addReply error', e);
      return false;
    });
};
