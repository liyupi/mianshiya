const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');
const { validTags } = require('../../tag/tagService');

const db = app.database();
const _ = db.command;

/**
 * 创建试卷
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 */
exports.main = async (event, context) => {
  let { name, tags, detail, ownership, questions } = event;
  // 校验标题
  if (!name) {
    return false;
  }
  name = name.trim();
  if (name.length < 1 || name.length > 100) {
    return false;
  }
  // 校验标签列表
  if (!tags || tags.length < 1 || !validTags(tags)) {
    return false;
  }
  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  // 同一用户每天只能上传 10 份试卷
  const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const condition = {
    userId: currentUser._id,
    isDelete: false,
    _createTime: _.gte(yesterday),
  };
  const count = await db.collection('paper').where(condition).count();
  if (count >= 10) {
    console.error(`addPaper count limit, userId = ${currentUser._id}`);
    return false;
  }

  return await db
    .collection('paper')
    .add({
      name,
      tags,
      detail,
      ownership,
      questions,
      userId: currentUser._id,
      priority: 0,
      viewNum: 0,
      isDelete: false,
      publishTime: new Date(),
      _createTime: new Date(),
      _updateTime: new Date(),
    })
    .then((res) => {
      console.log('addPaper succeed', res);
      return res.id;
    })
    .catch((e) => {
      console.error('addPaper error', e);
      return false;
    });
};
