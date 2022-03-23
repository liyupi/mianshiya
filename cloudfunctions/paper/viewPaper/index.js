const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const _ = db.command;

/**
 * 浏览题目
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 */
exports.main = async (event, context) => {
  const { paperId } = event;
  if (!paperId) {
    return false;
  }

  const paper = await db
    .collection('paper')
    .where({
      _id: paperId,
      isDelete: false,
    })
    .get()
    .then(({ data }) => data[0]);

  if (!paper) {
    return false;
  }

  return db
    .collection('paper')
    .doc(paperId)
    .update({
      viewNum: _.inc(1),
      _updateTime: new Date(),
    });
};
