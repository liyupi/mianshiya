const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
  credentials: require('./tcb_custom_login_key(mianshiya-xx).json'),
});
const db = app.database();
const _ = db.command;
const FORBIDDEN_CODE = -403;
const BLACK_IP_LIST = ['xxx'];

/**
 * 登录（HTTP 调用）
 * @param event
 * @param context
 */
exports.main = async (event, context) => {
  // 简单 redis 限流，3 秒 / 次
  const { TCB_SOURCE_IP } = cloud.getCloudbaseContext(context);
  if (!TCB_SOURCE_IP || BLACK_IP_LIST.includes(TCB_SOURCE_IP)) {
    console.error('ip {} is in blackList, banned!', TCB_SOURCE_IP);
    return FORBIDDEN_CODE;
  }
  console.log('login ip = {}', TCB_SOURCE_IP);
  const { captcha } = event.queryStringParameters;
  if (!captcha) {
    console.error('captcha is null, ip = {}', TCB_SOURCE_IP);
    return null;
  }

  const getLock = await app
    .callFunction({
      name: 'redisService',
      data: {
        op: 'setnx',
        key: `login_${TCB_SOURCE_IP}`,
        value: 1,
        expireSeconds: 3,
      },
    })
    .then((tmpRes) => tmpRes.result);
  if (!getLock) {
    console.error('cannot getLock, ip = {}', TCB_SOURCE_IP);
    return FORBIDDEN_CODE;
  }

  // 登录
  const user = await db
    .collection('user')
    .where({
      captcha,
      captchaExpireTime: _.gt(new Date()),
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);
  // 不存在或被封号
  if (!user || !user.unionId || user.authority === 'ban') {
    console.error('user is invalid, ip = {}, user = {}', TCB_SOURCE_IP, user);
    return null;
  }

  // 创建登录凭证
  const ticket = app.auth().createTicket(user.unionId, {
    refresh: 30 * 24 * 60 * 60 * 1000, // 30 天刷新一次
  });

  return {
    ticket,
    user,
  };
};
