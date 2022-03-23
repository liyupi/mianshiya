const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');

const db = app.database();
const _ = db.command;

/**
 * 浏览题目
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 */
exports.main = async (event, context) => {
  const { questionId } = event;
  if (!questionId) {
    return false;
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);
  console.log(`viewQuestion user = ${JSON.stringify(currentUser)}`);

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
