const { getQuestion } = require('../questionService');

/**
 * 查询
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 */
exports.main = async (event, context) => {
  const { id } = event;
  if (!id) {
    return null;
  }

  // 查询
  return await getQuestion(id);
};
