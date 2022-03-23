const cloud = require('@cloudbase/node-sdk');
const randomString = require('random-string');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});

/**
 * 获取动态码（用户注册）
 * @param event
 */
exports.main = async (event) => {
  let { userInfo, unionId, from, mpOpenId, mnOpenId } = event.queryStringParameters;
  console.log(userInfo);

  if (typeof userInfo === 'string') {
    userInfo = JSON.parse(userInfo);
  }

  // 校验来源
  if (!userInfo || !unionId || !['mp', 'mn'].includes(from)) {
    return {
      code: 401,
    };
  }

  const db = app.database();

  // 用户是否已存在
  const user = await db
    .collection('user')
    .where({
      unionId,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);

  // 被删除或封号，禁止获取动态码
  if (user && (user.isDelete || user.authority === 'ban')) {
    console.log('user unionId = {} try getCaptcha', unionId);
    return {
      result: false,
    };
  }

  // 生成 10 分钟有效且唯一的验证码
  let captcha;
  while (true) {
    captcha = randomString({ length: 6 }).toLowerCase();
    // 防止冲突
    const tmpUser = await db
      .collection('user')
      .where({
        captcha,
        isDelete: false,
      })
      .limit(1)
      .get()
      .then(({ data }) => data[0]);
    // 验证码未被使用或已过期
    if (
      !tmpUser ||
      !tmpUser.captchaExpireTime ||
      tmpUser.captchaExpireTime.getTime() < new Date().getTime()
    ) {
      break;
    }
  }
  const captchaExpireTime = new Date();
  captchaExpireTime.setTime(captchaExpireTime.getTime() + 10 * 60 * 1000);

  let result;
  // 不存在则创建, 存在则更新
  if (!user) {
    // 设置默认昵称
    const totalUser = await db
      .collection('user')
      .where({
        isDelete: false,
      })
      .count()
      .then((res) => res.total);
    userInfo.nickName = `鸭鸭${totalUser + 1}`;
    // 默认为男性
    if (!userInfo.gender) {
      userInfo.gender = 0;
    }
    result = await db
      .collection('user')
      .add({
        unionId,
        mpOpenId: mpOpenId,
        mnOpenId: mnOpenId,
        ...userInfo,
        captcha,
        captchaExpireTime,
        score: 0,
        favourQuestionIds: [],
        thumbCommentIds: [],
        interests: [],
        _createTime: new Date(),
        _updateTime: new Date(),
        isDelete: false,
      })
      .then((res) => {
        console.log('addUser succeed');
        return true;
      })
      .catch((e) => {
        return false;
      });
  } else {
    let updateData = {
      mpOpenId: mpOpenId,
      mnOpenId: mnOpenId,
      captcha,
      captchaExpireTime,
      _updateTime: new Date(),
    };

    result = await db
      .collection('user')
      .doc(user._id)
      .update(updateData)
      .then((res) => {
        console.log('updateUser succeed');
        return true;
      })
      .catch((e) => {
        return false;
      });
  }

  return {
    result,
    captcha,
  };
};
