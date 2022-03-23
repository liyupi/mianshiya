const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const collection = db.collection('searchHistory');

/**
 * 创建用户搜索记录
 *
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 * @author liyupi
 */
exports.main = async (event, context) => {
  const { content } = event;
  // 请求参数校验，长度最多 40
  if (!content || content.length > 40) {
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

  const userId = currentUser ? currentUser._id : undefined;

  return await collection
    .add({
      content,
      userId,
      _createTime: new Date(),
      _updateTime: new Date(),
    })
    .then((res) => {
      console.log('addSearchHistory succeed', res);
      return true;
    })
    .catch((e) => {
      console.error('addSearchHistory error', e);
      return false;
    });
};
