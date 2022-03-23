const app = require('../../../app');
const { isAdminUser } = require('../../../utils/bUtils');
const { getLoginUser } = require('../../user/userService');
const { validTags } = require('../../tag/tagService');
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
  // 校验标签列表
  if (!tags || tags.length < 1 || !validTags(tags)) {
    return false;
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

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
  if (originMeetQuestion.userId !== currentUser._id && !isAdminUser(currentUser)) {
    return false;
  }
  const updateData = {
    tags,
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
