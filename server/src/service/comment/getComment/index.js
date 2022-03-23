const { getComment } = require('../commentService');
const getSimpleUser = require('../../user/getSimpleUser').main;

/**
 * 查看
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 */
exports.main = async (event, context) => {
  const { id, withUser } = event;
  if (!id) {
    return null;
  }

  // 查询
  const comment = await getComment(id);
  if (!comment) {
    return null;
  }
  if (withUser) {
    comment.userInfo = [await getSimpleUser({ userId: comment.userId })];
  }
  return comment;
};
