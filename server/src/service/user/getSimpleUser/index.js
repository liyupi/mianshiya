const app = require('../../../app');
const { SIMPLE_USER_FIELDS } = require('../../../constant');

const db = app.database();

/**
 * 获取公开可见的简略用户信息
 * @param event
 */
exports.main = async (event, context) => {
  const { userId } = event;
  if (!userId) {
    return null;
  }

  return await db
    .collection('user')
    .field(SIMPLE_USER_FIELDS)
    .where({
      _id: userId,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);
};
