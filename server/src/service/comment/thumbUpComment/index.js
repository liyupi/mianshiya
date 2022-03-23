const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');

const db = app.database();
const _ = db.command;

/**
 * 点赞回答（取消点赞）
 * @param event
 * @param context
 * @return {Promise<number>} 点赞数变化
 */
exports.main = async (event, context) => {
  const { commentId } = event;
  if (!commentId) {
    return {
      code: 400,
      data: 0,
    };
  }
  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  let count;
  const transaction = await db.startTransaction();
  const thumbCommentIds = currentUser.thumbCommentIds || [];
  try {
    let index = thumbCommentIds.indexOf(commentId);
    // 取消点赞
    if (index > -1) {
      await updateCommentThumbNum(transaction, commentId, -1);
      thumbCommentIds.splice(index, 1);
      await updateUserThumbCommentIds(transaction, currentUser._id, thumbCommentIds);
      count = -1;
    } else {
      // 点赞
      await updateCommentThumbNum(transaction, commentId, 1);
      await updateUserThumbCommentIds(transaction, currentUser._id, [
        ...thumbCommentIds,
        commentId,
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
 * 更新回答点赞数
 * @param transaction
 * @param commentId
 * @param num
 * @return {Promise<cloudbase.database.SetRes>}
 */
function updateCommentThumbNum(transaction, commentId, num) {
  return transaction
    .collection('comment')
    .doc(commentId)
    .update({
      thumbNum: _.inc(num),
      _updateTime: new Date(),
    });
}

/**
 * 更新用户的点赞列表
 * @param transaction
 * @param userId
 * @param commentIds
 * @return {Promise<cloudbase.database.SetRes>}
 */
function updateUserThumbCommentIds(transaction, userId, commentIds) {
  return transaction.collection('user').doc(userId).update({
    thumbCommentIds: commentIds,
    _updateTime: new Date(),
  });
}
