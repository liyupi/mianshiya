const { isAdminUser } = require('../../../utils/bUtils');
const app = require('../../../app');
const {getLoginUser} = require("../userService");
const MyError = require("../../../exception");
const {FORBIDDEN_ERROR_CODE} = require("../../../exception/errorCode");
const db = app.database();

/**
 * 封号 / 解封用户
 * @param event
 * @param context
 * @author liyupi
 */
exports.main = async (event, context) => {
  const { userId } = event;
  if (!userId) {
    return false;
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);
  // 仅管理员可操作
  if (!isAdminUser(currentUser)) {
    throw new MyError(FORBIDDEN_ERROR_CODE, '禁止访问');
  }

  const user = await db
    .collection('user')
    .where({
      _id: userId,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);
  if (!user) {
    return false;
  }

  const updateData = {
    authority: user.authority?.includes('ban') ? 'user' : 'ban',
    _updateTime: new Date(),
  };

  // 更新
  const result = await db.collection('user').doc(user._id).update(updateData);
  console.log(`updateUser data = ${JSON.stringify(updateData)}`);
  return {
    code: 200,
    data: result,
  };
};
