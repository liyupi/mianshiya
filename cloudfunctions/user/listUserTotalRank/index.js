const cloud = require("@cloudbase/node-sdk");

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();

/**
 * 获取用户积分总排行
 * @param event
 * @param context
 * @return {Promise<boolean|number>}
 */
exports.main = async (event, context) => {
  const {pageSize = 10, pageNum = 1} = event;

  return await db.collection("user")
    .field({
      _id: true,
      nickName: true,
      avatarUrl: true,
      score: true,
    })
    .where({
      isDelete: false,
    })
    .orderBy('score', 'desc')
    .skip((pageNum - 1) * pageSize)
    .limit(pageSize)
    .get()
    .then(({data}) => data);
};
