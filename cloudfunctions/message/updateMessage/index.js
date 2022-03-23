const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
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
  const { userInfo } = app.auth().getEndUserInfo();
  if (!userInfo || !userInfo.customUserId) {
    return false;
  }
  const currentUser = await db
    .collection('user')
    .where({
      unionId: userInfo.customUserId,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);
  if (!currentUser || !currentUser._id) {
    return false;
  }

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
  if (originMessage.toUserId !== currentUser._id && !currentUser.authority.includes('admin')) {
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
