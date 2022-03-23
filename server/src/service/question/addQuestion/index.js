const app = require('../../../app');

const db = app.database();
const _ = db.command;
const xss = require('xss');
const cheerio = require('cheerio');
const { getLoginUser } = require('../../user/userService');
const { validTags } = require('../../tag/tagService');

/**
 * 创建题目
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 */
exports.main = async (event, context) => {
  let { name, tags, detail, links = [], difficulty = -1, type = -1, params, reference } = event;
  // 校验标题
  if (name) {
    name = name.trim();
    if (name.length < 1 || name.length > 100) {
      return false;
    }
  }
  if (!detail || !tags || tags.length < 1 || difficulty < 0 || type < 0) {
    return false;
  }
  // 校验标签列表
  if (!validTags(tags)) {
    return false;
  }
  // 校验题目详情，如果不包含任何文本，直接返回
  if (!cheerio.load(detail).text().trim()) {
    return false;
  }
  detail = xss(detail.trim());
  // 校验题目解析，
  if (reference !== undefined) {
    reference = xss(reference.trim());
  }
  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  // 同一用户每天只能上传 50 道题目
  const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const condition = {
    userId: currentUser._id,
    isDelete: false,
    _createTime: _.gte(yesterday),
  };
  const count = await db.collection('question').where(condition).count();
  if (count >= 50) {
    console.error(`addQuestion count limit, userId = ${currentUser._id}`);
    return false;
  }

  const questionData = {
    name,
    tags,
    detail,
    difficulty,
    links,
    params,
    type,
    reference,
    userId: currentUser._id,
    commentNum: 0,
    favourNum: 0,
    shareNum: 0,
    viewNum: 0,
    reviewStatus: 0,
    priority: 0,
    isDelete: false,
    _createTime: new Date(),
    _updateTime: new Date(),
  };

  return await addQuestion(db, questionData);
};

/**
 * 添加问题
 * @param transaction
 * @param data
 * @return {Promise<T | void>}
 */
function addQuestion(transaction, data) {
  return transaction
    .collection('question')
    .add(data)
    .then((res) => {
      console.log('addQuestion succeed', res);
      return res.id;
    })
    .catch((e) => {
      console.error('addQuestion error', e);
      throw e;
    });
}
