const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const _ = db.command;
const FORBIDDEN_CODE = -403;
const BLACK_IP_LIST = ['xxx'];

/**
 * 浏览题目
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 */
exports.main = async (event, context) => {
  // IP 黑名单
  const { TCB_SOURCE_IP } = cloud.getCloudbaseContext(context);
  if (!TCB_SOURCE_IP || BLACK_IP_LIST.includes(TCB_SOURCE_IP)) {
    console.error('ip {} is in blackList, banned!', TCB_SOURCE_IP);
    return FORBIDDEN_CODE;
  }
  console.log('viewQuestion ip = {}', TCB_SOURCE_IP);
  const { questionId } = event;
  if (!questionId) {
    return false;
  }
  const question = await db
    .collection('question')
    .where({
      _id: questionId,
      isDelete: false,
    })
    .get()
    .then(({ data }) => data[0]);

  if (!question) {
    return false;
  }

  return db
    .collection('question')
    .doc(questionId)
    .update({
      viewNum: _.inc(1),
      _updateTime: new Date(),
    });
};
