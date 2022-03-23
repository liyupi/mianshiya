const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();

/**
 * 更新遇到题目
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 */
exports.main = async (event, context) => {
  const { meetQuestionId, meetQuestion } = event;
  if (!meetQuestionId || !meetQuestion) {
    return;
  }
  const { tags } = meetQuestion;
  if (!tags && tags.length < 1) {
    return false;
  }

  // 获取当前登录用户
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

  // 仅遇到题目所有者和管理员可更新
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
  if (originMeetQuestion.userId !== currentUser._id && !currentUser.authority.includes('admin')) {
    return false;
  }
  const updateData = {
    tags
  };
  return await updateMeetQuestion(db, meetQuestionId, updateData);
};

/**
 * 更新问题
 * @param transaction
 * @param meetQuestionId
 * @param meetQuestion
 * @return {Promise<T | void>}
 */
function updateMeetQuestion(transaction, meetQuestionId, meetQuestion) {
  return transaction
    .collection('meetQuestion')
    .doc(meetQuestionId)
    .update({
      ...meetQuestion,
      _updateTime: new Date(),
    });
}
