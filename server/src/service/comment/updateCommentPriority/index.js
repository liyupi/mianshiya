const app = require('../../../app');
const db = app.database();

const {
  isAdminUser,
  getQuestionTitle,
  getQuestionCommentDetailLink,
} = require('../../../utils/bUtils');
const { getLoginUser } = require('../../user/userService');
const MyError = require('../../../exception');
const { FORBIDDEN_ERROR_CODE } = require('../../../exception/errorCode');
const { ADD_USER_SCORE_REASON } = require('../../../constant');
const addUserScore = require('../../userScore/addUserScore/index').main;
const addMessage = require('../../message/addMessage').main;

// 设为精选增加的积分
const GOOD_ADD_SCORE = ADD_USER_SCORE_REASON.GOOD_ANSWER.score;
// 设为参考增加的积分
const STANDARD_ADD_SCORE = ADD_USER_SCORE_REASON.STANDARD_ANSWER.score;

/**
 * 修改回答优先级（普通 / 精选 / 设为参考）
 * @param event
 * @param context
 * @return {Promise<boolean>}
 */
exports.main = async (event, context) => {
  const { commentId, priority = -1 } = event;
  if (!commentId || priority < 0) {
    return false;
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);
  // 仅管理员可操作
  if (!isAdminUser(currentUser)) {
    throw new MyError(FORBIDDEN_ERROR_CODE, '禁止访问');
  }

  const transaction = await db.startTransaction();
  try {
    const comment = await transaction
      .collection('comment')
      .where({
        _id: commentId,
        isDelete: false,
      })
      .limit(1)
      .get()
      .then(({ data }) => data[0]);
    // 无需更改状态
    if (!comment) {
      throw new Error('回答不存在');
    }
    if (comment.priority === priority) {
      throw new Error('禁止重复操作');
    }

    const questionId = comment.questionId;
    const question = await transaction
      .collection('question')
      .doc(questionId)
      .get()
      .then(({ data }) => data);
    if (!question) {
      throw new Error('题目不存在');
    }

    let tempRes;
    // 要设置为参考解析，需要更新题目的解析字段
    if (priority === 9999) {
      // 更新题目解析
      tempRes = await transaction.collection('question').doc(questionId).update({
        reference: comment.content,
        referenceCommentId: commentId,
        _updateTime: new Date(),
      });
      // 未更新，直接失败
      if (!tempRes?.updated) {
        throw new Error('update question error, no updated');
      }
    }

    // 修改回答优先级、操作人
    tempRes = await transaction.collection('comment').doc(commentId).update({
      priority,
      reviewerId: currentUser._id,
      _updateTime: new Date(),
    });
    // 未更新，直接失败
    if (!tempRes?.updated) {
      throw new Error('update comment error, no updated');
    }

    // 添加用户积分
    let score = 0;
    // 原因
    let reason = 0;
    if (priority === 999) {
      score = GOOD_ADD_SCORE;
      reason = ADD_USER_SCORE_REASON.GOOD_ANSWER.value;
    } else if (priority === 9999) {
      score = STANDARD_ADD_SCORE;
      reason = ADD_USER_SCORE_REASON.STANDARD_ANSWER.value;
    }
    if (score > 0) {
      tempRes = await addUserScore(
        {
          userId: comment.userId,
          score,
          reason,
        },
        context,
      );
      if (!tempRes) {
        throw new Error('addUserScore error');
      }
    }
    await transaction.commit();
    // 精选成功，发送消息
    const questionTitle = getQuestionTitle(question).substring(0, 40);
    const questionCommentDetailLink = getQuestionCommentDetailLink(questionId, commentId);
    const questionCommentDetailLinkFull = getQuestionCommentDetailLink(questionId, commentId, true);
    if (priority === 999) {
      addMessage(
        {
          toUserId: comment.userId,
          title: '您的回答被精选',
          content: `您在题目 <a href="${questionCommentDetailLink}" target="_blank">${questionTitle}</a> 下的回答被精选`,
          mailContent: `您在题目 <a href="${questionCommentDetailLinkFull}" target="_blank">${questionTitle}</a> 下的回答被精选`,
        },
        context,
      );
    } else if (priority === 9999) {
      addMessage(
        {
          toUserId: comment.userId,
          title: '您的回答被设为参考',
          content: `您在题目 <a href="${questionCommentDetailLink}" target="_blank">${questionTitle}</a> 下的回答被设为参考`,
          mailContent: `您在题目 <a href="${questionCommentDetailLinkFull}" target="_blank">${questionTitle}</a> 下的回答被设为参考`,
        },
        context,
      );
    }
  } catch (e) {
    await transaction.rollback();
    console.error('updateCommentPriority error', e);
    return false;
  }
  // todo 异步消息通知

  return true;
};
