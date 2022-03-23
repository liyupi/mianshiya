const app = require('../../../app');

const db = app.database();
const _ = db.command;

/**
 * 随机题目
 * @param event
 * @param context
 * @return {Promise<boolean|number>}
 */
exports.main = async (event, context) => {
  const { orTags, size = 1 } = event.queryStringParameters ? event.queryStringParameters : event;

  const condition = {
    reference: _.neq(null),
    reviewStatus: 1,
    isDelete: false,
  };

  if (orTags && orTags.length > 0) {
    condition.tags = _.in(orTags);
  }

  // 只看有解
  const questionList = await db
    .collection('question')
    .aggregate()
    .match(condition)
    .sample({ size })
    .end()
    .then(({ data }) => data);

  return {
    total: size,
    data: questionList,
  };
};
