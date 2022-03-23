const app = require('../../../app');
const { isAdminUser } = require('../../../utils/bUtils');
const { getLoginUser } = require('../../user/userService');

const db = app.database();

/**
 * 删除回复
 * @param event
 * @param context
 */
exports.main = async (event, context) => {
  const { replyId } = event;
  if (!replyId) {
    return false;
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  // 获取要删除的回复信息，判断操作者是否为回复者本人
  const reply = await db
    .collection('reply')
    .where({
      _id: replyId,
      isDelete: false,
    })
    .get()
    .then(({ data }) => data[0]);
  if (!reply) {
    console.log('reply not exists');
    return false;
  }
  if (reply.userId !== currentUser._id && !isAdminUser(currentUser)) {
    console.log('no auth');
    return false;
  }

  const transaction = await db.startTransaction();
  try {
    // 删除回复
    await transaction.collection('reply').doc(replyId).update({
      isDelete: true,
      _updateTime: new Date(),
    });

    // 删除回复关联的回复（儿子）
    // await transaction.collection('reply').where({
    //   replyId
    // }).update({
    //   isDelete: true,
    //   _updateTime: new Date(),
    // });
    await transaction.commit();
  } catch (e) {
    console.error(e);
    await transaction.rollback();
    return false;
  }
  return true;
};
