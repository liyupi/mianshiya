const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const xss = require('xss');
const cheerio = require('cheerio');

/**
 * 更新题目
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 */
exports.main = async (event, context) => {
  const { questionId, question } = event;
  if (!questionId || !question) {
    return;
  }
  
  let { name, detail, tags, difficulty, type, params, reference } = question;
  if (name !== undefined && (name.length < 1 || name.length > 100)) {
    return false;
  }

  if (detail !== undefined) {
    // 如果不包含任何文本
    if (!cheerio.load(detail).text().trim()) {
      return false;
    }
    detail = xss(detail);
  }
  if (tags !== undefined && tags.length < 1) {
    return false;
  }
  if (difficulty !== undefined && difficulty < 0) {
    return false;
  }
  if (type !== undefined && type < 0) {
    return false;
  }
  if (reference !== undefined) {
    // 如果不包含任何文本
    if (!cheerio.load(reference).text().trim()) {
      return false;
    }
    reference = xss(reference);
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

  // 是否允许操作
  let canOp = false;
  // 管理员可操作
  if (currentUser.authority && currentUser.authority.includes('admin')) {
    canOp = true;
  }
  // 如果是题目的创建者，可操作
  if (originQuestion.userId === currentUser._id) {
    canOp = true;
  }
  // 有对应标签权限，也可操作
  let extraAuthorityTags = [];
  if (currentUser.extraAuthority && currentUser.extraAuthority.tags) {
    extraAuthorityTags = currentUser.extraAuthority.tags;
  }
  // 是否有交集
  if (originQuestion.tags.filter((tag) => extraAuthorityTags.includes(tag)).length > 0) {
    canOp = true;
  }
  if (!canOp) {
    return false;
  }

  // 允许更新的注释
  const updateData = {
    name,
    detail,
    tags,
    difficulty,
    type,
    params,
    reference,
  };

  return await updateQuestion(db, questionId, updateData);
};

/**
 * 更新问题
 * @param transaction
 * @param questionId
 * @param updateData 允许更新的字段
 * @return {Promise<T | void>}
 */
function updateQuestion(transaction, questionId, updateData) {
  return transaction
    .collection('question')
    .doc(questionId)
    .update({
      ...updateData,
      _updateTime: new Date(),
    });
}
