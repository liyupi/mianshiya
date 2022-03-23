const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();

// 默认增加的积分
const ADD_SCORE = 5;

/**
 * 审核题目
 * @param event
 * @param context
 * @return {Promise<boolean|number>}
 */
exports.main = async (event, context) => {
  const { questionId, reviewStatus, reviewMessage, score = ADD_SCORE } = event;
  if (!questionId || reviewStatus < 0 || reviewStatus > 2) {
    return false;
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
  if (currentUser.authority && currentUser.authority.includes('admin')) {
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
        let res1 = await app
          .callFunction({
            name: 'addUserScore',
            data: {
              userId,
              score,
              reason: 1,
            },
          })
          .then((tmpRes) => tmpRes.result);
        if (res1 < 0) {
          throw new Error('addUserScore error');
        }
      }
    } else if (reviewStatus === 2) {
      await updateQuestion(transaction, currentUser._id, questionId, reviewStatus, reviewMessage);
    }
    // 消息通知
    if (reviewStatus === 1) {
      await addMessage(userId, '题目审核通过', `您推荐的题目【${originQuestion.name}】已通过审核`);
    } else if (reviewStatus === 2) {
      await addMessage(
        userId,
        '题目审核拒绝',
        `您推荐的题目【${originQuestion.name}】未通过审核，拒绝原因：${
          reviewMessage ? reviewMessage : '无'
        }`,
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

/**
 * 发送消息
 * @param toUserId
 * @param title
 * @param content
 * @return {Promise<void>}
 */
async function addMessage(toUserId, title, content) {
  // 消息通知
  const res = await app
    .callFunction({
      name: 'addMessage',
      data: {
        toUserId: toUserId,
        title: title,
        content: content,
      },
    })
    .catch((e) => console.log(e));
  console.log('addMessage by system', res);
  return res;
}
