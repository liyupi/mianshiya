const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();

/**
 * 删除题目
 *
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 * @author wenjingyuer
 */
exports.main = async (event, context) => {
  const { paperId } = event;
  if (!paperId) {
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

  // 仅题目所有者和管理员可操作
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

  return db.collection('paper').doc(paperId).update({
    isDelete: true,
    _updateTime: new Date(),
  });
};
