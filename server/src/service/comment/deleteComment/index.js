const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');
const { isAdminUser } = require('../../../utils/bUtils');

const db = app.database();
const _ = db.command;

/**
 * 删除评论
 *
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 * @author liyupi
 */
exports.main = async (event, context) => {
  const { commentId } = event;
  if (!commentId) {
    return false;
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  // 仅评论所有者和管理员可操作
  const originComment = await db
    .collection('comment')
    .where({
      _id: commentId,
      isDelete: false,
    })
    .get()
    .then(({ data }) => data[0]);
  if (!originComment) {
    return false;
  }

  // 仅创建者或管理员可删除
  if (originComment.userId !== currentUser._id && !isAdminUser(currentUser)) {
    return false;
  }

  const transaction = await db.startTransaction();
  try {
    const res = await transaction.collection('comment').doc(commentId).update({
      isDelete: true,
      _updateTime: new Date(),
    });
    if (res.updated > 0) {
      // 题目评论数 -1
      await updateQuestionCommentNum(transaction, originComment.questionId, -1);
    }
    await transaction.commit();
    return true;
  } catch (e) {
    console.error('deleteComment error', e);
    await transaction.rollback();
    return false;
  }
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
