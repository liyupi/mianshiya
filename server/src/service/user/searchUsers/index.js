const { isAdminUser } = require('../../../utils/bUtils');

const app = require('../../../app');
const { getLoginUser } = require('../userService');
const { FORBIDDEN_ERROR_CODE } = require('../../../exception/errorCode');
const MyError = require('../../../exception');
const db = app.database();

/**
 * 搜索用户（支持分页，仅管理员可见）
 * @param event
 * @param context
 * @return {Promise<{total: number, data: []}|null|{total: *, data: *}>}
 */
exports.main = async (event, context) => {
  const { pageSize = 10, pageNum = 1, orderKey = '_createTime' } = event;
  const emptyResult = {
    total: 0,
    data: [],
  };

  const currentUser = await getLoginUser(context);
  if (!isAdminUser(currentUser)) {
    throw new MyError(FORBIDDEN_ERROR_CODE, '禁止访问');
  }

  // 查询条件
  const condition = {
    _id: event._id,
    nickName: event.nickName,
    authority: event.authority,
    isDelete: false,
  };

  // 查询总数
  const total = await db
    .collection('user')
    .where(condition)
    .count()
    .then((res) => {
      return res.total;
    });

  if (!total) {
    return emptyResult;
  }

  // 查询
  const list = await db
    .collection('user')
    .where(condition)
    .skip((pageNum - 1) * pageSize)
    .orderBy(orderKey, 'desc')
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
