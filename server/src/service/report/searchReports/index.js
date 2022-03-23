const { isAdminUser } = require('../../../utils/bUtils');

const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');
const MyError = require('../../../exception');
const { FORBIDDEN_ERROR_CODE } = require('../../../exception/errorCode');
const db = app.database();

/**
 * 搜索举报（支持分页，仅管理员可见）
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
  // 获取当前登录用户
  const currentUser = await getLoginUser(context);
  // 仅管理员可操作
  if (!isAdminUser(currentUser)) {
    throw new MyError(FORBIDDEN_ERROR_CODE, '禁止访问');
  }

  // 查询条件
  const condition = {
    isDelete: false,
    reviewStatus: event.reviewStatus,
    reportType: event.reportType,
    reportReason: event.reportReason,
    reporterId: event.reporterId,
    reportResourcesId: event.reportResourcesId,
    reviewerId: event.reviewerId,
    reportedUserId: event.reportedUserId,
  };

  // 查询总数
  const total = await db
    .collection('report')
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
    .collection('report')
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
