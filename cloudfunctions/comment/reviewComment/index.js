const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const _ = db.command;

/**
 * 增加的积分
 */
const ADD_SCORE = 1;

/**
 * 审核回答
 * @param event
 * @param context
 * @return {Promise<boolean>}
 */
exports.main = async (event, context) => {
  const { commentId, reviewStatus, reviewMessage } = event;
  if (!commentId || reviewStatus < 0 || reviewStatus > 2) {
    return false;
  }

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
  if (!currentUser || !currentUser._id || !currentUser.authority.includes('admin')) {
    return false;
  }

  const transaction = await db.startTransaction();
  try {
    const comment = await transaction
      .collection('comment')
      .doc(commentId)
      .get()
      .then(({ data }) => data);
    // 无需更改状态
    if (!comment || comment.reviewStatus === reviewStatus || !comment.userId) {
      return false;
    }

    const questionId = comment.questionId;
    const question = await transaction
      .collection('question')
      .doc(questionId)
      .get()
      .then(({ data }) => data);
    if (!question) {
      return false;
    }

    // 审核
    await transaction.collection('comment').doc(commentId).update({
      reviewerId: currentUser._id,
      reviewStatus,
      reviewMessage,
      _updateTime: new Date(),
      reviewTime: new Date(),
    });

    // 其他状态转通过
    if (comment.reviewStatus !== 1 && reviewStatus === 1) {
      // 题目评论数 + 1
      await updateQuestionCommentNum(transaction, questionId, 1);
      const userId = comment.userId;
      const res1 = await app
        .callFunction({
          name: 'addUserScore',
          data: {
            userId,
            score: ADD_SCORE,
            reason: 2,
          },
        })
        .then((tmpRes) => tmpRes.result);
      if (res1 < 0) {
        throw new Error('addUserScore error');
      }
    } else if (comment.reviewStatus === 1) {
      // 通过改为其他状态
      // 题目评论数 -1
      await updateQuestionCommentNum(transaction, questionId, -1);
    }
    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
    return false;
  }
  return true;
};

/**
 * 更新题目回答数
 * @param transaction
 * @param questionId
 * @param num
 * @return {*}
 */
function updateQuestionCommentNum(transaction, questionId, num) {
  return transaction
    .collection('question')
    .doc(questionId)
    .update({
      commentNum: _.inc(num),
      _updateTime: new Date(),
    });
}
