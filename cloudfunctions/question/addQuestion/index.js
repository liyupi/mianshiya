const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const _ = db.command;
const xss = require('xss');
const cheerio = require('cheerio');

/**
 * 创建题目
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 */
exports.main = async (event, context) => {
  let { name, tags, detail, links = [], difficulty = -1, type = -1, params, reference } = event;
  if (!detail || !tags || tags.length < 1 || difficulty < 0 || type < 0) {
    return false;
  }
  // 校验题目详情，如果不包含任何文本，直接返回
  if (!cheerio.load(detail).text().trim()) {
    return false;
  }
  detail = xss(detail);
  // 校验题目解析，
  if (reference !== undefined) {
    // 如果不包含任何文本，直接返回
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

  // 同一用户每天只能上传 100 道题目
  const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const condition = {
    userId: currentUser._id,
    isDelete: false,
    _createTime: _.gte(yesterday),
  };
  const count = await db.collection('question').where(condition).count();
  if (count >= 100) {
    console.error('addQuestion count limit, userId = {}', currentUser._id);
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
