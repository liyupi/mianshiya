const app = require('../../../app');

const db = app.database();
const _ = db.command;

const ERROR_CODE = -1;

/**
 * 获取指定用户排名
 * @param event
 * @param context
 */
exports.main = async (event, context) => {
  const { userId } = event;
  if (!userId) {
    return ERROR_CODE;
  }

  const user = await db
    .collection('user')
    .doc(userId)
    .get()
    .then(({ data }) => data[0]);

  if (!user) {
    return ERROR_CODE;
  }

  // 获取分数大于指定用户分数的人数，+1 即为排名
  const count = await db
    .collection('user')
    .where({
      score: _.gt(user.score),
      isDelete: false,
    })
    .count()
    .then((res) => res.total);
  return count + 1;
};
