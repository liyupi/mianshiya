const app = require('../../../app');
const { getQuestionTitle, getQuestionDetailLink, isAdminUser } = require('../../../utils/bUtils');
const { getLoginUser } = require('../../user/userService');
const { ADD_USER_SCORE_REASON } = require('../../../constant');

const db = app.database();
const addUserScore = require('../../userScore/addUserScore/index').main;
const addMessage = require('../../message/addMessage/index').main;

/**
 * 审核题目
 * @param event
 * @param context
 * @return {Promise<boolean|number>}
 */
exports.main = async (event, context) => {
  const {
    questionId,
    reviewStatus,
    reviewMessage,
    score = ADD_USER_SCORE_REASON.ADD_QUESTION.score,
  } = event;
  if (!questionId || reviewStatus < 0 || reviewStatus > 2) {
    return false;
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
  if (!originQuestion || originQuestion.reviewStatus === reviewStatus) {
    console.log('question not exists or same operation');
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

  const transaction = await db.startTransaction();
  try {
    const userId = originQuestion.userId;
    // 未发布即为第一次过审
    const firstPassReview = !originQuestion.publishTime;
    const publishTime = firstPassReview ? new Date() : null;

    if (reviewStatus === 1) {
      let res = await updateQuestion(
        transaction,
        currentUser._id,
        questionId,
        reviewStatus,
        reviewMessage,
        publishTime,
      );
      // 第一次审核通过，用户加积分
      if (res && firstPassReview && userId) {
        let res1 = await addUserScore(
          {
            userId,
            score,
            reason: ADD_USER_SCORE_REASON.ADD_QUESTION.value,
          },
          context,
        );
        if (!res1) {
          throw new Error('addUserScore error');
        }
      }
    } else if (reviewStatus === 2) {
      await updateQuestion(transaction, currentUser._id, questionId, reviewStatus, reviewMessage);
    }
    const questionTitle = getQuestionTitle(originQuestion).substring(0, 40);
    const questionDetailLink = getQuestionDetailLink(originQuestion);
    const questionDetailLinkFull = getQuestionDetailLink(originQuestion, true);
    // 消息通知
    if (reviewStatus === 1) {
      await addMessage(
        {
          toUserId: userId,
          title: '题目审核通过',
          content: `您上传的题目 <a href="${questionDetailLink}" target="_blank">${questionTitle}</a> 已通过审核`,
          mailContent: `您上传的题目 <a href="${questionDetailLinkFull}" target="_blank">${questionTitle}</a> 已通过审核`,
        },
        context,
      );
    } else if (reviewStatus === 2) {
      await addMessage(
        {
          toUserId: userId,
          title: '题目审核拒绝',
          content: `您上传的题目 <a href="${questionDetailLink}" target="_blank">${questionTitle}</a> 未通过审核，拒绝原因：${
            reviewMessage ? reviewMessage : '无'
          }`,
          mailContent: `您上传的题目 <a href="${questionDetailLinkFull}" target="_blank">${questionTitle}</a> 未通过审核，拒绝原因：${
            reviewMessage ? reviewMessage : '无'
          }`,
        },
        context,
      );
    }
    await transaction.commit();
  } catch (e) {
    console.error(e);
    await transaction.rollback();
    return false;
  }
  return true;
};

/**
 * 修改题目
 * @param transaction
 * @param reviewerId
 * @param questionId
 * @param reviewStatus
 * @param reviewMessage
 * @param publishTime
 */
async function updateQuestion(
  transaction,
  reviewerId,
  questionId,
  reviewStatus,
  reviewMessage,
  publishTime,
) {
  if (!reviewerId || !questionId) {
    return false;
  }

  const params = {
    reviewerId,
    reviewStatus,
    reviewMessage,
    _updateTime: new Date(),
    reviewTime: new Date(),
  };

  if (publishTime) {
    params.publishTime = publishTime;
  }

  return transaction
    .collection('question')
    .doc(questionId)
    .update(params)
    .then((res) => {
      console.log(`updateQuestion succeed, id = ${questionId}`);
      return true;
    });
}
