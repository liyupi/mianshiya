const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const _ = db.command;
const FORBIDDEN_CODE = -403;
const BLACK_IP_LIST = ['xxx'];

/**
 * 创建试卷
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 */
exports.main = async (event, context) => {
  // IP 黑名单
  const { TCB_SOURCE_IP } = cloud.getCloudbaseContext(context);
  if (!TCB_SOURCE_IP || BLACK_IP_LIST.includes(TCB_SOURCE_IP)) {
    console.error('ip {} is in blackList, banned!', TCB_SOURCE_IP);
    return FORBIDDEN_CODE;
  }
  const { name, tags, detail, ownership, questions } = event;
  if (!tags || tags.length < 1 || !name) {
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

  // 同一用户每天只能上传 10 份试卷
  const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const condition = {
    userId: currentUser._id,
    isDelete: false,
    _createTime: _.gte(yesterday),
  };
  const count = await db.collection('paper').where(condition).count();
  if (count >= 10) {
    console.error('addPaper count limit, userId = {}', currentUser._id);
    return false;
  }

  return await db
    .collection('paper')
    .add({
      name,
      tags,
      detail,
      ownership,
      questions,
      userId: currentUser._id,
      viewNum: 0,
      isDelete: false,
      publishTime: new Date(),
      _createTime: new Date(),
      _updateTime: new Date(),
    })
    .then((res) => {
      console.log('addPaper succeed', res);
      return res.id;
    })
    .catch((e) => {
      console.error('addPaper error', e);
      return false;
    });
};
