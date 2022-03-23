const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');
const { isAdminUser } = require('../../../utils/bUtils');

const db = app.database();

/**
 * 修改消息（已读、删除）
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 */
exports.main = async (event, context) => {
  const { messageId, status, isDelete } = event;
  // 请求参数校验
  if (!messageId || (status === undefined && isDelete === undefined)) {
    return false;
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  const originMessage = await db
    .collection('message')
    .where({
      _id: messageId,
      isDelete: false,
    })
    .get()
    .then(({ data }) => data[0]);
  if (!originMessage) {
    return false;
  }
  // 仅消息接收者和管理员可更新
  if (originMessage.toUserId !== currentUser._id && !isAdminUser(currentUser)) {
    return false;
  }

  // 封装数据
  const updateData = {
    _updateTime: new Date(),
  };
  if (status !== undefined) {
    updateData.status = status;
    updateData.readTime = new Date();
  }
  if (isDelete !== undefined) {
    updateData.isDelete = isDelete;
  }

  return await db.collection('message').doc(messageId).update(updateData);
};
