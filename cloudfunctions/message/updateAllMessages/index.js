const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const _ = db.command;

/**
 * 修改全部消息（已读、删除）
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 */
exports.main = async (event, context) => {
  const { status, isDelete } = event;
  // 请求参数校验
  if (status === undefined && isDelete === undefined) {
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

  // 封装数据
  const condition = {
    toUserId: currentUser._id,
    isDelete: false,
  };
  const updateData = {
    _updateTime: new Date(),
  };
  if (status !== undefined) {
    updateData.status = status;
    updateData.readTime = new Date();
    condition.status = _.neq(status);
  }
  if (isDelete !== undefined) {
    updateData.isDelete = isDelete;
  }

  return await db.collection('message').where(condition).update(updateData);
};
