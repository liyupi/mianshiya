const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');
const { isAdminUser } = require('../../../utils/bUtils');
const { validTags } = require('../../tag/tagService');

const db = app.database();

/**
 * 更新试卷
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 */
exports.main = async (event, context) => {
  const { paperId, paper } = event;
  if (!paperId || !paper) {
    return;
  }
  let { name, tags, ownership, priority, questions, detail } = paper;
  // 校验标题
  if (name) {
    name = name.trim();
    if (name.length < 1 || name.length > 100) {
      return false;
    }
  }
  if (tags !== undefined && (tags.length < 1 || !validTags(tags))) {
    return false;
  }
  if (ownership !== undefined && (ownership < 0 || ownership > 1)) {
    return false;
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  // 仅题目所有者和管理员可更新
  const originPaper = await db
    .collection('paper')
    .where({
      _id: paperId,
      isDelete: false,
    })
    .get()
    .then(({ data }) => data[0]);
  if (!originPaper) {
    return false;
  }
  if (originPaper.userId !== currentUser._id && !isAdminUser(currentUser)) {
    return false;
  }

  // 允许更新的字段
  const updateData = {
    name,
    detail,
    tags,
    ownership,
    questions,
  };
  // 仅管理员可更新优先级
  if (priority !== undefined && isAdminUser(currentUser)) {
    updateData.priority = priority;
  }

  return db
    .collection('paper')
    .doc(paperId)
    .update({
      ...updateData,
      _updateTime: new Date(),
    });
};
