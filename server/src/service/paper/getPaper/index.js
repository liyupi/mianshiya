const app = require('../../../app');
const { isValidUser, isAdminUser } = require('../../../utils/bUtils');

const db = app.database();
const _ = db.command;

/**
 * 查看试卷详情
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
  const paper = await db
    .collection('paper')
    .where({
      _id: id,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);
  if (!paper) {
    return null;
  }
  // 非公开，判断是否有查看权限
  if (paper.ownership !== 1) {
    // 获取当前登录用户
    const { userInfo } = context.session;
    if (!userInfo?._id) {
      return null;
    }
    const currentUser = await db
      .collection('user')
      .where({
        _id: userInfo._id,
        isDelete: false,
      })
      .limit(1)
      .get()
      .then(({ data }) => data[0]);
    if (!isValidUser(currentUser)) {
      return null;
    }
    // 仅本人或管理员可查看
    if (currentUser._id !== paper.userId && !isAdminUser(currentUser)) {
      return null;
    }
  }
  // 为试卷填充题目
  const questionIdList = getQuestionIdList(paper.questions);
  const allQuestions = await db
    .collection('question')
    .where({
      _id: _.in(questionIdList),
      isDelete: false,
    })
    .get();

  return {
    ...paper,
    questions: getQuestionsDetail(paper.questions, allQuestions.data),
  };
};

/**
 * 从试卷的题目字段中拼接题目 id 列表
 * @param questions
 * @returns {PaperType[]}
 */
function getQuestionIdList(questions) {
  let res = [];
  for (const key in questions) {
    res = res.concat(questions[key]);
  }
  return res;
}

/**
 * 恢复题目原来的顺序
 * @param questions
 * @param questionsDetail
 * @returns {{}}
 */
function getQuestionsDetail(questions, questionsDetail) {
  const res = {};
  for (const key in questions) {
    res[key] = questions[key]
      .map((q) => questionsDetail.find((detail) => detail._id === q))
      .filter((q) => !!q);
  }
  return res;
}
