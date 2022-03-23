const app = require('../../../app');
const { REQUEST_PARAMS_ERROR_CODE } = require('../../../exception/errorCode');
const MyError = require('../../../exception');
const { getLoginUser } = require('../userService');
const { validTags } = require('../../tag/tagService');
const db = app.database();
const _ = db.command;

/**
 * 校验 URL
 * @type {RegExp}
 */
const URL_REG =
  /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

/**
 * 邮箱正则
 * @type {RegExp}
 */
const EMAIL_REG = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,})$/;

/**
 * 更新用户
 * @param event
 * @param context
 * @author liyupi
 */
exports.main = async (event, context) => {
  const { user } = event;
  if (!user) {
    return false;
  }

  let {
    email,
    profile,
    interests,
    nickName = undefined,
    avatarUrl = undefined,
    gender,
    jobStatus,
  } = user;

  // 校验兴趣
  if (interests) {
    if (interests.length > 20) {
      throw new MyError(REQUEST_PARAMS_ERROR_CODE, '兴趣选择过多');
    }
    if (!validTags(interests)) {
      throw new MyError(REQUEST_PARAMS_ERROR_CODE, '兴趣非法');
    }
  }

  // 需要更新昵称
  if (nickName) {
    nickName = nickName.trim();
    // 昵称不能只包含空格
    if (!nickName) {
      throw new MyError(REQUEST_PARAMS_ERROR_CODE, '昵称禁止为空');
    }
    // 用户名最多 12 个字
    if (nickName.length > 12) {
      throw new MyError(REQUEST_PARAMS_ERROR_CODE, '昵称过长');
    }
  }

  // 简介最多 40 个字
  if (profile && profile.length > 40) {
    throw new MyError(REQUEST_PARAMS_ERROR_CODE, '简介太长');
  }

  // 用正则校验用户头像
  if (avatarUrl && !URL_REG.test(avatarUrl)) {
    throw new MyError(REQUEST_PARAMS_ERROR_CODE, '头像非法');
  }

  // 校验邮箱
  if (email && (!EMAIL_REG.test(email) || email.length > 100)) {
    throw new MyError(REQUEST_PARAMS_ERROR_CODE, '邮箱非法');
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  const updateData = {
    _updateTime: new Date(),
  };
  if (email !== undefined) {
    updateData.email = email;
  }
  if (profile !== undefined) {
    updateData.profile = profile;
  }
  if (interests !== undefined) {
    updateData.interests = interests;
  }
  if (nickName) {
    // 禁止同名
    const sameNameNum = await db
      .collection('user')
      .where({
        _id: _.neq(currentUser._id),
        nickName,
        isDelete: false,
      })
      .count()
      .then((res) => res.total);
    if (sameNameNum > 0) {
      throw new MyError(REQUEST_PARAMS_ERROR_CODE, '该昵称已被占用');
    }
    updateData.nickName = nickName;
  }
  if (avatarUrl) {
    updateData.avatarUrl = avatarUrl;
  }
  if (gender !== undefined) {
    updateData.gender = gender;
  }
  if (jobStatus !== undefined) {
    updateData.jobStatus = jobStatus;
  }
  // 更新
  const result = await db.collection('user').doc(currentUser._id).update(updateData);
  console.log(`updateUser data = ${JSON.stringify(updateData)}`);
  return {
    code: 200,
    data: result,
  };
};
