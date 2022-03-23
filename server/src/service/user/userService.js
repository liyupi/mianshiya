const { isValidUser } = require('../../utils/bUtils');
const MyError = require('../../exception');

const app = require('../../app');
const { NO_AUTH_ERROR_CODE, FORBIDDEN_ERROR_CODE } = require('../../exception/errorCode');
const db = app.database();

/**
 * 获取当前登录用户
 * @param context
 * @returns {Promise<Database.IGetRes>}
 */
async function getLoginUser(context) {
  // 获取当前登录用户
  const { userInfo } = context.session;
  if (!userInfo?._id) {
    throw new MyError(NO_AUTH_ERROR_CODE, '未登录');
  }
  const currentUser = await db
    .collection('user')
    .where({
      _id: userInfo._id,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);
  // 检查用户是否合法
  if (!isValidUser(currentUser)) {
    throw new MyError(FORBIDDEN_ERROR_CODE, '禁止访问');
  }
  return currentUser;
}

module.exports = {
  getLoginUser,
};
