const app = require('../../app');
const db = app.database();

/**
 * 根据 id 查询
 * @return {Promise<boolean|*>}
 * @param id
 */
async function getQuestion(id) {
  if (!id) {
    return null;
  }

  // 查询
  return await db
    .collection('question')
    .where({
      _id: id,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);
}

module.exports = {
  getQuestion,
};
