const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();

/**
 * 删除题目
 *
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 * @author liyupi
 */
exports.main = async (event, context) => {
  const { questionId } = event;
  if (!questionId) {
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

  // 原题目
  const originQuestion = await db
    .collection('question')
    .where({
      _id: questionId,
      isDelete: false,
    })
    .get()
    .then(({ data }) => data[0]);
  if (!originQuestion) {
    return false;
  }

  // 是否允许删除
  let canDelete = false;
  // 管理员可删除
  if (currentUser.authority && currentUser.authority.includes('admin')) {
    canDelete = true;
  }
  // 如果是题目的创建者，并且题目不属于已发布状态，可删除
  if (originQuestion.userId === currentUser._id && originQuestion.reviewStatus !== 1) {
    canDelete = true;
  }

  // 有对应标签权限，也可删除
  let extraAuthorityTags = [];
  if (currentUser.extraAuthority && currentUser.extraAuthority.tags) {
    extraAuthorityTags = currentUser.extraAuthority.tags;
  }
  // 是否有交集
  if (originQuestion.tags.filter((tag) => extraAuthorityTags.includes(tag)).length > 0) {
    canDelete = true;
  }

  if (!canDelete) {
    return false;
  }

  return db.collection('question').doc(questionId).update({
    isDelete: true,
    _updateTime: new Date(),
  });
};
