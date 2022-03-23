const { getTagsMap } = require('../tagService');
/**
 * 获取标签
 * @param event
 * @param context
 * @author yupi
 */
exports.main = async (event, context) => {
  return getTagsMap();
};
