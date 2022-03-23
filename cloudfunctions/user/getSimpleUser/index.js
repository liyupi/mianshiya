const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();

/**
 * 获取公开可见的简略用户信息
 * @param event
 */
exports.main = async (event) => {
  const { userId } = event;
  if (!userId) {
    return null;
  }

  return await db
    .collection('user')
    .field({
      _id: true,
      nickName: true,
      avatarUrl: true,
      score: true,
      title: true,
      gender: true,
      coin: true,
      profile: true,
    })
    .where({
      _id: userId,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);
};
