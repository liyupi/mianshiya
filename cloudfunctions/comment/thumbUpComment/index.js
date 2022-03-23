const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
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
    return 0;
  }

  // 获取登录用户信息
  const { userInfo } = app.auth().getEndUserInfo();
  if (!userInfo || !userInfo.customUserId) {
    return 0;
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
    return 0;
  }

  let res;
  const transaction = await db.startTransaction();
  const thumbCommentIds = currentUser.thumbCommentIds || [];
  try {
    let index = thumbCommentIds.indexOf(commentId);
    // 取消点赞
    if (index > -1) {
      await updateCommentThumbNum(transaction, commentId, -1);
      thumbCommentIds.splice(index, 1);
      await updateUserThumbCommentIds(transaction, currentUser._id, thumbCommentIds);
      res = -1;
    } else {
      // 点赞
      await updateCommentThumbNum(transaction, commentId, 1);
      await updateUserThumbCommentIds(transaction, currentUser._id, [
        ...thumbCommentIds,
        commentId,
      ]);
      res = 1;
    }
    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
    res = 0;
  }
  return res;
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
