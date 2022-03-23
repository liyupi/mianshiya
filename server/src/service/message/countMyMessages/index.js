const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');

const db = app.database();

/**
 * 获取当前用户收到的消息数
 * @param event
 * @param context
 * @return {Promise<*|number>}
 */
exports.main = async (event, context) => {
  const { type, status } = event;

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

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
  const total = await db
    .collection('message')
    .where(condition)
    .count()
    .then((res) => {
      return res.total;
    });
  return {
    code: 200,
    data: total,
  };
};
