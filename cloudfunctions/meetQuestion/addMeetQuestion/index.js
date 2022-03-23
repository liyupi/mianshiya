const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const _ = db.command;

/**
 * 创建遇到题目
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 */
exports.main = async (event, context) => {
  const { tags, questionId } = event;
  // 至少有一个公司标签
  if (!questionId || !tags || tags.length < 1) {
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

  const transaction = await db.startTransaction();
  try {
    const id = await db
      .collection('meetQuestion')
      .add({
        userId: currentUser._id,
        questionId,
        tags,
        _createTime: new Date(),
        _updateTime: new Date(),
        isDelete: false,
      })
      .then((res) => {
        console.log('addMeetQuestion succeed', res);
        return res.id;
      });
    // 题目遇到数 +1
    await updateQuestionMeetQuestionNum(transaction, questionId, 1);
    await transaction.commit();
    return id;
  } catch (e) {
    console.error('addMeetQuestion error', e);
    await transaction.rollback();
    return -1;
  }
};

/**
 * 更新题目遇到题目数
 * @param transaction
 * @param questionId
 * @param num
 * @return {*}
 */
function updateQuestionMeetQuestionNum(transaction, questionId, num) {
  return transaction
    .collection('question')
    .doc(questionId)
    .update({
      meetNum: _.inc(num),
      _updateTime: new Date(),
    });
}
