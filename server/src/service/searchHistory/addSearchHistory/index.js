const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');
const db = app.database();
const collection = db.collection('searchHistory');

/**
 * 创建用户搜索记录（不登录无法搜索）
 *
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 * @author liyupi
 */
exports.main = async (event, context) => {
  let { content = '' } = event;
  content = content.trim();
  // 请求参数校验
  if (content.length < 1 || content.length > 40) {
    return false;
  }
  // 获取当前登录用户
  const currentUser = await getLoginUser(context);
  return await collection
    .add({
      content,
      userId: currentUser._id,
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
