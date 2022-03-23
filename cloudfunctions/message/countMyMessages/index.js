const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();

/**
 * 获取当前用户收到的消息数
 * @param event
 * @return {Promise<*|number>}
 */
exports.main = async (event) => {
  const { type, status } = event;

  // 获取当前用户
  const { userInfo } = app.auth().getEndUserInfo();
  if (!userInfo || !userInfo.customUserId) {
    return 0;
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
    return 0;
  }

  const condition = {
    toUserId: currentUser._id,
    isDelete: false,
  };
  if (status > -1) {
    condition.status = status;
  }
  if (type > -1) {
    condition.type = type;
  }

  // 查询总数
  return await db
    .collection('message')
    .where(condition)
    .count()
    .then((res) => {
      return res.total;
    });
};
