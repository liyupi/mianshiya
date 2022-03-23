const app = require('../../../app');
const db = app.database();
const _ = db.command;
const xss = require('xss');
const { getLoginUser } = require('../../user/userService');
const { getComment } = require('../../comment/commentService');
const { getQuestionCommentDetailLink } = require('../../../utils/bUtils');
const { getQuestion } = require('../../question/questionService');
const addMessage = require('../../message/addMessage').main;

/**
 * 创建回复
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 */
exports.main = async (event, context) => {
  let { content, questionId, commentId, replyId, replyUserId } = event;
  if (!content || !questionId || !commentId) {
    return false;
  }
  if (content.length > 600) {
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

  // 判断回答是否存在
  const comment = await getComment(commentId);
  if (!comment) {
    return false;
  }

  // 同一用户每天只能进行 50 个回复
  const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const condition = {
    userId: currentUser._id,
    isDelete: false,
    _createTime: _.gte(yesterday),
  };
  const count = await db.collection('reply').where(condition).count();
  if (count >= 50) {
    console.error(`addReply count limit, userId = ${currentUser._id}`);
    return false;
  }

  const res = await db
    .collection('reply')
    .add({
      userId: currentUser._id,
      questionId,
      content,
      commentId,
      replyId,
      replyUserId,
      _createTime: new Date(),
      _updateTime: new Date(),
      isDelete: false,
    })
    .then((res) => {
      console.log('addReply succeed', res);
      return res.id;
    })
    .catch((e) => {
      console.error('addReply error', e);
      return false;
    });

  if (res) {
    const questionCommentDetailLink = getQuestionCommentDetailLink(questionId, commentId);
    // 异步通知被回复的人
    if (replyUserId) {
      addMessage(
        {
          toUserId: replyUserId,
          title: `${currentUser.nickName} 回复了 <a href="${questionCommentDetailLink}" target="_blank">我的回复</a>`,
          content,
          sendEmail: false,
        },
        context,
      );
    } else {
      // 通知回答者
      addMessage(
        {
          toUserId: comment.userId,
          title: `${currentUser.nickName} 回复了 <a href="${questionCommentDetailLink}" target="_blank">我的回答</a>`,
          content,
          sendEmail: false,
        },
        context,
      );
    }
  }
  return res;
};
