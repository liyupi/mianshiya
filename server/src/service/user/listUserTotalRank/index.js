const app = require('../../../app');
const { SIMPLE_USER_FIELDS } = require('../../../constant');
const db = app.database();

/**
 * 获取用户积分总排行
 * @param event
 * @param context
 * @return {Promise<boolean|number>}
 */
exports.main = async (event, context) => {
  const { pageSize = 10, pageNum = 1 } = event;

  return await db
    .collection('user')
    .field(SIMPLE_USER_FIELDS)
    .where({
      isDelete: false,
    })
    .orderBy('score', 'desc')
    .skip((pageNum - 1) * pageSize)
    .limit(pageSize)
    .get()
    .then(({ data }) => data);
};
