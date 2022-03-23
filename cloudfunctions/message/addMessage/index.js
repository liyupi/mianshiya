const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();

/**
 * 发送系统消息（内部调用）
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 */
exports.main = async (event, context) => {
  const { toUserId, title, content } = event;
  // 请求参数校验
  if (!toUserId || !title) {
    return false;
  }

  // 判断用户是否存在
  const user = await db
    .collection('user')
    .where({
      _id: toUserId,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);
  if (!user) {
    return false;
  }

  // 发送邮件
  if (user.email) {
    app
      .callFunction({
        name: 'sendEmail',
        data: {
          to: user.email,
          subject: `【面试鸭】${title}`,
          content: content,
        },
      })
      .catch((e) => console.log('发送邮件失败', e));
  }

  // 封装数据
  const data = {
    toUserId,
    title,
    content,
    fromUserId: 0,
    status: 0,
    type: 0,
    _createTime: new Date(),
    _updateTime: new Date(),
    isDelete: false,
  };

  // 插入数据
  return await db
    .collection('message')
    .add(data)
    .then((res) => {
      console.log(`addMessage succeed, id = ${res.id}`);
      return true;
    })
    .catch((e) => {
      console.error('addMessage error', e);
      return false;
    });
};
