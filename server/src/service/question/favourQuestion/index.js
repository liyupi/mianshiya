const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');

const db = app.database();
const _ = db.command;

/**
 * 收藏题目（取消收藏）
 * @param event
 * @param context
 * @return {Promise<number>} 收藏数变化
 */
exports.main = async (event, context) => {
  const { questionId } = event;
  if (!questionId) {
    return {
      code: 400,
      data: 0,
    };
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  let count;
  const transaction = await db.startTransaction();
  try {
    let index = currentUser.favourQuestionIds.indexOf(questionId);
    // 取消收藏
    if (index > -1) {
      await updateQuestionFavourNum(transaction, questionId, -1);
      currentUser.favourQuestionIds.splice(index, 1);
      await updateUserFavourQuestionIds(
        transaction,
        currentUser._id,
        currentUser.favourQuestionIds,
      );
      count = -1;
    } else {
      // 收藏
      await updateQuestionFavourNum(transaction, questionId, 1);
      await updateUserFavourQuestionIds(transaction, currentUser._id, [
        ...currentUser.favourQuestionIds,
        questionId,
      ]);
      count = 1;
    }
    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
    count = 0;
  }
  return {
    code: 200,
    data: count,
  };
};

/**
 * 更新题目收藏数
 * @param transaction
 * @param questionId
 * @param num
 * @return {Promise<cloudbase.database.SetRes>}
 */
function updateQuestionFavourNum(transaction, questionId, num) {
  return transaction
    .collection('question')
    .doc(questionId)
    .update({
      favourNum: _.inc(num),
      _updateTime: new Date(),
    });
}

/**
 * 更新用户的收藏列表
 * @param transaction
 * @param userId
 * @param questionIds
 * @return {Promise<cloudbase.database.SetRes>}
 */
function updateUserFavourQuestionIds(transaction, userId, questionIds) {
  return transaction.collection('user').doc(userId).update({
    favourQuestionIds: questionIds,
    _updateTime: new Date(),
  });
}
