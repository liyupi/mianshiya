const app = require("../app");
const db = app.database();
const _ = db.command;

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

module.exports = {
  updateQuestionCommentNum,
};
