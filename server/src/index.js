const { CloudBaseRunServer } = require('./server');

// 创建云托管 Server 实例
const server = new CloudBaseRunServer();

// 注册路由
// 登录
server.setRoute('/login', require('./service/login/index.js').main);
server.setRoute('/logout', require('./service/logout/index.js').main);

// 题目
server.setRoute('/question/add', require('./service/question/addQuestion/index.js').main);
server.setRoute('/question/delete', require('./service/question/deleteQuestion/index.js').main);
server.setRoute('/question/update', require('./service/question/updateQuestion/index.js').main);
server.setRoute('/question/get', require('./service/question/getQuestion/index.js').main);
server.setRoute('/question/search', require('./service/question/searchQuestions/index.js').main);
server.setRoute(
  '/question/search/origin',
  require('./service/question/searchQuestionsOrigin/index.js').main,
);
server.setRoute('/question/review', require('./service/question/reviewQuestion/index.js').main);
server.setRoute('/question/view', require('./service/question/viewQuestion/index.js').main);
server.setRoute('/question/favour', require('./service/question/favourQuestion/index.js').main);
server.setRoute('/question/share', require('./service/question/shareQuestion/index.js').main);
server.setRoute('/question/random', require('./service/question/getRandomQuestion/index.js').main);
server.setRoute(
  '/question/list/recommend',
  require('./service/question/listRecommendQuestions/index.js').main,
);

// 回答
server.setRoute('/comment/add', require('./service/comment/addComment/index.js').main);
server.setRoute('/comment/delete', require('./service/comment/deleteComment/index.js').main);
server.setRoute('/comment/update', require('./service/comment/updateComment/index.js').main);
server.setRoute('/comment/update/priority', require('./service/comment/updateCommentPriority/index.js').main);
server.setRoute('/comment/get', require('./service/comment/getComment/index.js').main);
server.setRoute('/comment/search', require('./service/comment/searchComments/index.js').main);
server.setRoute('/comment/review', require('./service/comment/reviewComment/index.js').main);
server.setRoute('/comment/thumb-up', require('./service/comment/thumbUpComment/index.js').main);

// 遇到题目
server.setRoute(
  '/meet-question/add',
  require('./service/meetQuestion/addMeetQuestion/index.js').main,
);
server.setRoute(
  '/meet-question/delete',
  require('./service/meetQuestion/deleteMeetQuestion/index.js').main,
);
server.setRoute(
  '/meet-question/update',
  require('./service/meetQuestion/updateMeetQuestion/index.js').main,
);
server.setRoute(
  '/meet-question/search',
  require('./service/meetQuestion/searchMeetQuestions/index.js').main,
);

// 试卷
server.setRoute('/paper/add', require('./service/paper/addPaper/index.js').main);
server.setRoute('/paper/delete', require('./service/paper/deletePaper/index.js').main);
server.setRoute('/paper/update', require('./service/paper/updatePaper/index.js').main);
server.setRoute('/paper/get', require('./service/paper/getPaper/index.js').main);
server.setRoute('/paper/search', require('./service/paper/searchPapers/index.js').main);
server.setRoute('/paper/view', require('./service/paper/viewPaper/index.js').main);

// 回复
server.setRoute('/reply/add', require('./service/reply/addReply/index.js').main);
server.setRoute('/reply/delete', require('./service/reply/deleteReply/index.js').main);
server.setRoute('/reply/search', require('./service/reply/searchReplies/index.js').main);

// 举报
server.setRoute('/report/add', require('./service/report/addReport/index.js').main);
server.setRoute('/report/search', require('./service/report/searchReports/index.js').main);
server.setRoute('/report/review', require('./service/report/reviewReport/index.js').main);

// 搜索历史
server.setRoute(
  '/search-history/add',
  require('./service/searchHistory/addSearchHistory/index.js').main,
);
server.setRoute(
  '/search-history/list/hot',
  require('./service/searchHistory/hotSearches/index.js').main,
);

// 标签
server.setRoute('/tag/get/map', require('./service/tag/getTagsMap/index.js').main);

// 用户
server.setRoute('/user/current', require('./service/user/getCurrentUser/index.js').main);
server.setRoute('/user/simple', require('./service/user/getSimpleUser/index.js').main);
server.setRoute('/user/update', require('./service/user/updateUser/index.js').main);
server.setRoute('/user/get/rank', require('./service/user/getUserRank/index.js').main);
server.setRoute('/user/list/rank', require('./service/user/listUserCycleRank/index.js').main);
server.setRoute('/user/list/total-rank', require('./service/user/listUserTotalRank/index.js').main);
server.setRoute('/user/ban', require('./service/user/banUser/index.js').main);
server.setRoute('/user/search', require('./service/user/searchUsers/index.js').main);

// 消息
server.setRoute('/message/add', require('./service/message/addMessage/index.js').main);
server.setRoute('/message/update', require('./service/message/updateMessage/index.js').main);
server.setRoute(
  '/message/update/all',
  require('./service/message/updateAllMessages/index.js').main,
);
server.setRoute('/message/search', require('./service/message/searchMessages/index.js').main);
server.setRoute('/message/count', require('./service/message/countMyMessages/index.js').main);

// 文件
server.setRoute('/file/upload', require('./service/file/upload/index.js').main);

// 监听端口
server.listen(7592);
