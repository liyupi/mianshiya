const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');
const db = app.database();
const _ = db.command;

/**
 * 创建举报
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 */
exports.main = async (event, context) => {
  const {
    reportedUserId,
    reportResourceId,
    reportType = -1,
    reportReason = -1,
    reportDetail,
  } = event;
  // 参数校验
  if ((!reportResourceId && !reportedUserId) || reportType < 0 || reportReason < 0) {
    return false;
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  // 同一用户每天只能进行 20 个举报
  const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const condition = {
    userId: currentUser._id,
    isDelete: false,
    _createTime: _.gte(yesterday),
  };
  const count = await db.collection('report').where(condition).count();
  if (count >= 20) {
    console.error(`addReport count limit, userId = ${currentUser._id}`);
    return false;
  }

  // 封装数据
  const data = {
    reporterId: currentUser._id,
    reportedUserId,
    reportResourceId,
    reportReason,
    reportType,
    reportDetail,
    reviewStatus: 0,
    _createTime: new Date(),
    _updateTime: new Date(),
    isDelete: false,
  };

  // 插入数据
  return await db
    .collection('report')
    .add(data)
    .then((res) => {
      console.log('addReport succeed', res);
      return res.id;
    })
    .catch((e) => {
      console.error('addReport error', e);
      return false;
    });
};
