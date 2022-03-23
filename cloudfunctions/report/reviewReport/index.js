const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();

/**
 * 举报成功增加的积分
 *
 * @type {number}
 */
const ADD_SCORE = 2;

/**
 * 审核举报
 * @param event
 * @param context
 * @return {Promise<boolean>}
 */
exports.main = async (event, context) => {
  const { reportId, reviewStatus, reviewMessage } = event;
  console.log(`参数, reportId = ${reportId}, reviewStatus = ${reviewStatus}`);
  if (!reportId || reviewStatus < 0 || reviewStatus > 2) {
    console.log('参数错误！');
    return false;
  }

  // 获取当前登录用户
  const { userInfo } = app.auth().getEndUserInfo();
  if (!userInfo || !userInfo.customUserId) {
    console.log('用户登录状态错误！');
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
  // 仅管理员可审核
  if (!currentUser || !currentUser._id || !currentUser.authority.includes('admin')) {
    console.log('用户权限错误！');
    return false;
  }

  const transaction = await db.startTransaction();

  try {
    const report = await transaction
      .collection('report')
      .doc(reportId)
      .get()
      .then(({ data }) => data);
    if (!report || report.reviewStatus === reviewStatus) {
      console.log('举报信息状态错误！');
      return false;
    }

    // 审核
    await transaction.collection('report').doc(reportId).update({
      reviewerId: currentUser._id,
      reviewStatus,
      reviewMessage,
      _updateTime: new Date(),
      reviewTime: new Date(),
    });

    // 举报成功的用户奖励积分
    const userId = report.reporterId;
    if (reviewStatus === 1 && userId) {
      const res = await app
        .callFunction({
          name: 'addUserScore',
          data: {
            userId,
            score: ADD_SCORE,
            reason: 3,
          },
        })
        .then((res) => res.result);
      if (res < 0) {
        throw new Error('addUserScore error');
      }
    }
    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
    console.error('未知错误！', e);
    return false;
  }
  return true;
};
