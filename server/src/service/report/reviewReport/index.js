const app = require('../../../app');
const { isAdminUser } = require('../../../utils/bUtils');
const { getLoginUser } = require('../../user/userService');
const MyError = require('../../../exception');
const { FORBIDDEN_ERROR_CODE } = require('../../../exception/errorCode');
const { ADD_USER_SCORE_REASON } = require('../../../constant');

const db = app.database();
const addUserScore = require('../../userScore/addUserScore/index').main;

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
  const currentUser = await getLoginUser(context);
  // 仅管理员可操作
  if (!isAdminUser(currentUser)) {
    throw new MyError(FORBIDDEN_ERROR_CODE, '禁止访问');
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
      const res = await addUserScore(
        {
          userId,
          score: ADD_USER_SCORE_REASON.REPORT_PASS.score,
          reason: ADD_USER_SCORE_REASON.REPORT_PASS.value,
        },
        context,
      );
      if (!res) {
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
