const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();

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

  // 获取当前用户
  const { userInfo } = app.auth().getEndUserInfo();
  if (!userInfo || !userInfo.customUserId) {
    return false;
  }

  const currentUser = await db
    .collection('user')
    .where({
      unionId: userInfo.customUserId,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);

  if (!currentUser || !currentUser._id) {
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
