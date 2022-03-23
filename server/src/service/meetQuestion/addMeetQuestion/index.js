const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');
const { validTags } = require('../../tag/tagService');

const db = app.database();
const _ = db.command;

/**
 * 创建遇到题目
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 */
exports.main = async (event, context) => {
  const { tags, questionId } = event;
  if (!questionId) {
    return false;
  }
  // 校验标签列表
  if (!tags || tags.length < 1 || !validTags(tags)) {
    return false;
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  const transaction = await db.startTransaction();
  try {
    // 同用户、同题目只能存在一条数据
    const oldData = await db
      .collection('meetQuestion')
      .where({
        questionId,
        userId: currentUser._id,
        isDelete: false,
      })
      .limit(1)
      .get()
      .then(({ data }) => {
        return data[0];
      });

    if (oldData) {
      return false;
    }

    const id = await db
      .collection('meetQuestion')
      .add({
        userId: currentUser._id,
        questionId,
        tags,
        _createTime: new Date(),
        _updateTime: new Date(),
        isDelete: false,
      })
      .then((res) => {
        console.log('addMeetQuestion succeed', res);
        return res.id;
      });
    // 题目遇到数 +1
    await updateQuestionMeetQuestionNum(transaction, questionId, 1);
    await transaction.commit();
    return id;
  } catch (e) {
    console.error('addMeetQuestion error', e);
    await transaction.rollback();
    return -1;
  }
};

/**
 * 更新题目遇到题目数
 * @param transaction
 * @param questionId
 * @param num
 * @return {*}
 */
function updateQuestionMeetQuestionNum(transaction, questionId, num) {
  return transaction
    .collection('question')
    .doc(questionId)
    .update({
      meetNum: _.inc(num),
      _updateTime: new Date(),
    });
}
