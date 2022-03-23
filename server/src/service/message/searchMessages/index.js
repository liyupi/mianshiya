const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');
const db = app.database();

/**
 * 搜索当前用户收到的消息（支持分页）
 * @param event
 * @param context
 * @return {Promise<{total: number, data: []}|null|{total: *, data: *}>}
 */
exports.main = async (event, context) => {
  const { type, status, pageSize = 10, pageNum = 1 } = event;

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

  if (!total) {
    return {
      total: 0,
      data: [],
    };
  }

  // 查询消息
  const list = await db
    .collection('message')
    .where(condition)
    .skip((pageNum - 1) * pageSize)
    .orderBy('_createTime', 'desc')
    .limit(pageSize)
    .get()
    .then((res) => {
      return res.data;
    });

  return {
    total,
    data: list,
  };
};
