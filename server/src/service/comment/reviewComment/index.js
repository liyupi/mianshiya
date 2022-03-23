const { updateQuestionCommentNum } = require('../../../dao/questionDao');
const { isAdminUser } = require('../../../utils/bUtils');
const { getLoginUser } = require('../../user/userService');
const MyError = require('../../../exception');
const { FORBIDDEN_ERROR_CODE } = require('../../../exception/errorCode');

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

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);
  // 仅管理员可操作
  if (!isAdminUser(currentUser)) {
    throw new MyError(FORBIDDEN_ERROR_CODE, '禁止访问');
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
