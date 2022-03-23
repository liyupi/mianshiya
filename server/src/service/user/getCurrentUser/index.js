const { getLoginUser } = require('../userService');

/**
 * 获取当前登录用户信息
 * @param event
 * @param context
 * @return {Promise<boolean|number>}
 */
exports.main = async (event, context) => {
  try {
    const currentUser = await getLoginUser(context);
    return {
      code: 200,
      data: currentUser,
      message: 'ok',
    };
  } catch (e) {
    return null;
  }
};
