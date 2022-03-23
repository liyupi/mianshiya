const app = require('../../../app');
const { isAdminUser } = require('../../../utils/bUtils');
const { getLoginUser } = require('../../user/userService');

const db = app.database();
const _ = db.command;

/**
 * 删除遇到题目
 *
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 * @author liyupi
 */
exports.main = async (event, context) => {
  const { meetQuestionId } = event;
  if (!meetQuestionId) {
    return false;
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  // 仅遇到题目所有者和管理员可操作
  const originMeetQuestion = await db
    .collection('meetQuestion')
    .where({
      _id: meetQuestionId,
      isDelete: false,
    })
    .get()
    .then(({ data }) => data[0]);
  if (!originMeetQuestion) {
    return false;
  }

  // 仅创建者或管理员可删除
  if (originMeetQuestion.userId !== currentUser._id && !isAdminUser(currentUser)) {
    return false;
  }

  const transaction = await db.startTransaction();
  try {
    const res = await transaction.collection('meetQuestion').doc(meetQuestionId).update({
      isDelete: true,
      _updateTime: new Date(),
    });
    if (res.updated > 0) {
      // 题目遇到题目数 -1
      await updateQuestionMeetQuestionNum(transaction, originMeetQuestion.questionId, -1);
    }
    await transaction.commit();
    return true;
  } catch (e) {
    console.error('deleteMeetQuestion error', e);
    await transaction.rollback();
    return false;
  }
};

/**
 * 更新题目遇到题目数
 * @param transaction
 * @param questionId
 * @param num
 * @return {*}
 */
function updateQuestionMeetQuestionNum(transaction, questionId, num) {
  return transaction
    .collection('question')
    .doc(questionId)
    .update({
      meetNum: _.inc(num),
      _updateTime: new Date(),
    });
}
