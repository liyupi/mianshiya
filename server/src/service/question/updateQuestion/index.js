const app = require('../../../app');

const db = app.database();
const xss = require('xss');
const cheerio = require('cheerio');
const { getLoginUser } = require('../../user/userService');
const { isAdminUser } = require('../../../utils/bUtils');
const { validTags } = require('../../tag/tagService');

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

  let { name, detail, tags, difficulty, type, params, reference, priority } = question;
  // 校验标题
  if (name) {
    name = name.trim();
    if (name.length < 1 || name.length > 100) {
      return false;
    }
  }

  if (detail !== undefined) {
    // 如果不包含任何文本
    if (!cheerio.load(detail).text().trim()) {
      return false;
    }
    detail = xss(detail);
  }
  // 校验标签列表
  if (tags !== undefined && (tags.length < 1 || !validTags(tags))) {
    return false;
  }
  if (difficulty !== undefined && difficulty < 0) {
    return false;
  }
  if (type !== undefined && type < 0) {
    return false;
  }
  if (reference !== undefined) {
    reference = xss(reference);
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

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
  if (isAdminUser(currentUser)) {
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

  // 允许更新的字段
  const updateData = {
    name,
    detail,
    tags,
    difficulty,
    type,
    params,
    reference,
  };
  // 仅管理员可更新优先级
  if (priority !== undefined && isAdminUser(currentUser)) {
    updateData.priority = priority;
  }

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
