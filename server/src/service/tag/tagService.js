// 计算标签集合，只执行一次
const { hotTags, groupTags, otherTags, categoryTagsMap } = require('./tagsMap');
const allTagsSet = new Set(otherTags);

hotTags.forEach((tag) => allTagsSet.add(tag));
groupTags.forEach((groupTag) => {
  groupTag.tags.forEach((tag) => {
    allTagsSet.add(tag);
  });
});
Object.keys(categoryTagsMap).forEach((parentTag) => {
  categoryTagsMap[parentTag].tags.forEach((tag) => {
    allTagsSet.add(tag);
  });
});

/**
 * 获取标签
 */
const getTagsMap = () => {
  return {
    hotTags,
    allTags: Array.from(allTagsSet),
    groupTags,
    categoryTagsMap,
  };
};

/**
 * 校验标签列表合法性
 * @param tags
 */
const validTags = (tags) => {
  if (!tags) {
    return false;
  }
  for (const tag of tags) {
    if (!allTagsSet.has(tag)) {
      return false;
    }
  }
  return true;
};

module.exports = {
  getTagsMap,
  validTags,
};
