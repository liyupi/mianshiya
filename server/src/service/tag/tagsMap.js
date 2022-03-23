/**
 * 热门标签
 * @type {string[]}
 */
const hotTags = [
  'java',
  '前端',
  '后端',
  '数据结构',
  '算法',
];

/**
 * 零散的标签
 * @type {string[]}
 */
const otherTags = ['正则表达式'];

/**
 * 分组标签
 * @type {{name: string, tags: []}[]}
 */
const groupTags = [
  {
    name: '热门',
    tags: hotTags,
  },
  {
    name: '语言',
    tags: [
      'java',
      'csharp',
      'php',
      'cpp',
      'c',
      'html',
    ],
  },
  {
    name: '知识',
    tags: [
      '数据结构',
      '算法',
    ],
  },
  {
    name: '方向',
    tags: [
      '前端',
      '后端',
      '人工智能',
      '数据分析',
      '图像处理',
    ],
  },
  {
    name: '公司',
    tags: [
      '腾讯',
      '阿里巴巴',
      '字节跳动',
      '微软',
      '华为',
      '携程',
      '美团',
      '百度',
      '网易',
      'B站',
    ],
  },
  {
    name: '目标',
    tags: ['实习', '校招'],
  },
];

/**
 * 标签 => 推荐标签映射
 */
const categoryTagsMap = {
  python: {
    tags: ['django', 'scrapy', 'tornado', 'flask'],
  },
  编程语言: {
    tags: [
      'java',
      'csharp',
      'php',
      'cpp',
      'c',
    ],
  },
  后端: {
    tags: [
      'java',
      'python',
      'spring',
      'springboot',
      '数据库',
      '框架',
    ],
  },
  java: {
    tags: [
      'mybatis',
      'spring',
      'springboot',
    ],
  },
  cpp: {
    tags: ['指针', '模板'],
  },
  移动开发: {
    tags: [
      'android',
      'ios',
    ],
  },
  php: {
    tags: ['apache',],
  },
  前端: {
    tags: [
      'html',
      'css',
      'javascript',
      'typescript',
      'nodejs',
      'vue',
      'angular',
    ],
  },
  ios: {
    tags: ['swift',],
  },
  云原生: {
    tags: [
      'golang',
      'docker',
      'zookeeper',
      'kafka',
      'eureka',
      'springcloud',
      'vagrant',
    ],
  },
  运维: {
    tags: [
      'docker',
      '容器',
      '运维',
      'devops',
      'elk',
    ],
  },
  测试: {
    tags: [
      'postman',
      '单元测试',
      'selenium',
      'jira',
      '测试工具',
    ],
  },
  操作系统: {
    tags: [
      '进程',
    ],
  },
  数据结构: {
    tags: [
      '链表',
      '散列表',
    ],
  },
  算法: {
    tags: [
      '贪心',
      '动态规划',
      '排序',
      '二分查找',
      '均值算法',
      '预编码算法',
      '霍夫曼树',
      '剪枝',
      '哈希算法',
    ],
  },
  数据库: {
    tags: ['索引',],
  },
  大数据: {
    tags: [
      '数据库',
      'mysql',
      'redis',
      'sql',
      'mongodb',
      'etl',
    ],
  },
  游戏: {
    tags: [
      '游戏策划',
      'cascadeur',
    ],
  },
  设计模式: {
    tags: [
      'uml',
      '单例模式',
      '解释器模式',
    ],
  },
};

module.exports = {
  hotTags,
  otherTags,
  groupTags,
  categoryTagsMap,
};
