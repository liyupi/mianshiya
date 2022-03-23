/**
 * 获取标签
 * @param event
 * @param context
 */
exports.main = async (event, context) => {
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

  return {
    hotTags, allTags: Array.from(allTagsSet), groupTags, categoryTagsMap,
  };
};

/**
 * 热门标签
 * @type {string[]}
 */
const hotTags = ['java', '前端', '后端', '数据结构', '算法'];

/**
 * 零散的标签
 * @type {string[]}
 */
const otherTags = ['正则表达式'];

/**
 * 分组标签
 * @type {{name: string, tags: []}[]}
 */
const groupTags = [{
  name: '热门', tags: hotTags,
}, {
  name: '语言', tags: ['java', 'csharp', 'php', 'cpp', 'c'],
}, {
  name: '知识', tags: ['数据结构', '算法', '软件工程'],
}, {
  name: '方向', tags: ['前端', '后端', '人工智能', '数据分析', '图像处理'],
}, {
  name: '公司', tags: ['腾讯', '阿里巴巴', '字节跳动', '微软', '华为', '携程', '美团'],
}, {
  name: '目标', tags: ['实习', '校招', '社招', '比赛', '考试', '考研', '考证'],
},];

/**
 * 标签 => 推荐标签映射
 */
const categoryTagsMap = {
  python: {
    tags: ['django', 'scrapy', 'tornado', 'flask'],
  }, 编程语言: {
    tags: ['java', 'csharp', 'php', 'cpp'],
  }, 后端: {
    tags: ['java', 'python', 'spring', 'lavarel', 'scala', 'golang', 'rust', 'nodejs'],
  }, java: {
    tags: ['mybatis', 'spring', 'springboot'],
  }, cpp: {
    tags: ['指针', '模板', '运算符重载'],
  }, 移动开发: {
    tags: ['android', 'ios', 'swift'],
  }, php: {
    tags: ['apache', 'swoole', 'symfony'],
  }, 前端: {
    tags: ['html', 'css', 'javascript', 'npm'],
  }, ios: {
    tags: ['swift', 'objective-c', 'safari', 'xcode'],
  },
};
