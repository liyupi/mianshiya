/**
 * 注销
 * @param event
 * @param context
 */
exports.main = async (event, context) => {
  // 清除登录态
  context.session.userInfo = undefined;
  return true;
};
