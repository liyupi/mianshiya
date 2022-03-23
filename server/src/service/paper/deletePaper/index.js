const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');
const { isAdminUser } = require('../../../utils/bUtils');

const db = app.database();

/**
 * 删除题目
 *
 * @param event
 * @param context
 * @return {Promise<boolean|*>}
 * @author wenjingyuer
 */
exports.main = async (event, context) => {
  const { paperId } = event;
  if (!paperId) {
    return false;
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  // 仅题目所有者和管理员可操作
  const originPaper = await db
    .collection('paper')
    .where({
      _id: paperId,
      isDelete: false,
    })
    .get()
    .then(({ data }) => data[0]);
  if (!originPaper) {
    return false;
  }

  if (originPaper.userId !== currentUser._id && !isAdminUser(currentUser)) {
    return false;
  }

  return db.collection('paper').doc(paperId).update({
    isDelete: true,
    _updateTime: new Date(),
  });
};
