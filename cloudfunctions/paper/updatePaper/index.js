const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();

/**
 * 更新试卷
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 */
exports.main = async (event, context) => {
  const { paperId, paper } = event;
  if (!paperId || !paper) {
    return;
  }
  const { name, tags } = paper;
  if (!name || !tags || tags.length < 1) {
    return false;
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

  // 仅题目所有者和管理员可更新
  const originPaper = await db
    .collection('paper')
    .where({
      _id: paperId,
      isDelete: false,
    })
    .get()
    .then(({ data }) => data[0]);
  if (!originPaper) {
    return false;
  }
  if (originPaper.userId !== currentUser._id && !currentUser.authority.includes('admin')) {
    return false;
  }

  return db
    .collection('paper')
    .doc(paperId)
    .update({
      ...paper,
      _updateTime: new Date(),
    });
};
