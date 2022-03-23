const app = require('../../../app');
const db = app.database();
const _ = db.command;
const xss = require('xss');
const cheerio = require('cheerio');
const { getLoginUser } = require('../../user/userService');
const {
  getQuestionTitle,
  getQuestionCommentDetailLink,
} = require('../../../utils/bUtils');
const { getQuestion } = require('../../question/questionService');
const addMessage = require('../../message/addMessage').main;

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
  const textContent = cheerio.load(content).text().trim();
  // 如果不包含任何文本
  if (!textContent) {
    return false;
  }
  // 防止 XSS 攻击
  content = xss(content);
  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  // 判断题目是否存在
  const question = await getQuestion(questionId);
  if (!question) {
    return false;
  }

  // 同一用户每天只能写 20 个回答
  const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const condition = {
    userId: currentUser._id,
    isDelete: false,
    _createTime: _.gte(yesterday),
  };
  const count = await db.collection('comment').where(condition).count();
  if (count >= 20) {
    console.error(`addComment count limit, userId = ${currentUser._id}`);
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
    // 异步通知被回答的人
    const questionCommentDetailLink = getQuestionCommentDetailLink(questionId, id);
    const questionCommentDetailLinkFull = getQuestionCommentDetailLink(questionId, id, true);
    const questionTitle = getQuestionTitle(question).substring(0, 20);
    addMessage(
      {
        toUserId: question.userId,
        title: `${currentUser.nickName} 回答了 <a href="${questionCommentDetailLink}" target="_blank">我的题目：${questionTitle}</a>`,
        content: textContent.substring(0, 200),
        mailContent: `${content} <p><a href="${questionCommentDetailLinkFull}" target="_blank">点击查看详情</a></p>`,
      },
      context,
    );
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
