const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();

/**
 * 获取当前登录用户信息
 * @param event
 * @param context
 * @return {Promise<boolean|number>}
 */
exports.main = async (event, context) => {
  // 获取当前登录用户
  const { userInfo } = app.auth().getEndUserInfo();
  const notLoginResult = {
    code: 401,
    data: null,
    message: '未登录',
  };
  if (!userInfo || !userInfo.customUserId) {
    return notLoginResult;
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

  db.collection('user').doc(currentUser._id).update({
    lastLoginTime: new Date(),
  });

  if (!currentUser || !currentUser._id) {
    return notLoginResult;
  }

  return {
    code: 200,
    data: currentUser,
    message: 'ok',
  };
};
