const app = require('../../app');
const { FORBIDDEN_CODE } = require('../../constant');
const { isValidUser } = require('../../utils/bUtils');
const { FORBIDDEN_ERROR_CODE } = require('../../exception/errorCode');
const MyError = require('../../exception');

const db = app.database();
const _ = db.command;

/**
 * 登录
 * @param event
 * @param context
 */
exports.main = async (event, context) => {
  const clientIp = context.ip;
  const { captcha } = event;
  if (!captcha) {
    console.error(`captcha is null, ip = ${clientIp}`);
    return null;
  }
  // 限流
  const getLock = await app
    .callFunction({
      name: 'redisService',
      data: {
        op: 'setnx',
        key: `login_${clientIp}`,
        value: 1,
        expireSeconds: 3,
      },
    })
    .then((tmpRes) => tmpRes.result);
  if (!getLock) {
    console.error(`cannot getLock, ip = ${clientIp}`);
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
  // 用户不存在
  if (!user) {
    console.log(`user not exists, captcha = ${captcha}`);
    return null;
  }
  // 用户非法
  if (!isValidUser(user)) {
    console.error(`user is invalid, ip = ${clientIp}, user = ${JSON.stringify(user)}`);
    throw new MyError(FORBIDDEN_ERROR_CODE, '禁止访问');
  }

  // 创建登录凭证
  const ticket = app.auth().createTicket(user.unionId, {
    refresh: 30 * 24 * 60 * 60 * 1000, // 30 天刷新一次
  });

  // 存 session 登录态
  context.session.userInfo = user;

  return {
    ticket,
    user,
  };
};
