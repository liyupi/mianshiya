const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const _ = db.command;
const xss = require('xss');
const cheerio = require('cheerio');

/**
 * 创建回答
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 */
exports.main = async (event, context) => {
  let { content, questionId } = event;
  if (!content || !questionId) {
    return false;
  }
  // 如果不包含任何文本
  if (!cheerio.load(content).text().trim()) {
    return false;
  }
  // 防止 XSS 攻击
  content = xss(content);
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

  const transaction = await db.startTransaction();
  try {
    const id = await db
      .collection('comment')
      .add({
        userId: currentUser._id,
        questionId,
        content,
        priority: 0,
        thumbNum: 0,
        reviewStatus: 1, // 默认审核通过
        _createTime: new Date(),
        _updateTime: new Date(),
        isDelete: false,
      })
      .then((res) => {
        console.log('addComment succeed', res);
        return res.id;
      });
    // 题目评论数 +1
    await updateQuestionCommentNum(transaction, questionId, 1);
    await transaction.commit();
    return id;
  } catch (e) {
    console.error('addComment error', e);
    await transaction.rollback();
    return -1;
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
