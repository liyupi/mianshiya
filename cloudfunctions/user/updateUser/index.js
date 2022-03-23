const cloud = require('@cloudbase/node-sdk');
const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const _ = db.command;

/**
 * 校验 URL
 * @type {RegExp}
 */
const URL_REG = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

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
  const {user} = event;
  if (!user) {
    return false;
  }

  let {email, profile, interests, nickName = undefined, avatarUrl = undefined, gender, jobStatus} = user;

  // 兴趣不能超过 20 个
  if (interests && interests.length > 20) {
    return {
      code: 400, data: false, message: '兴趣选择过多',
    };
  }

  // 需要更新昵称
  if (nickName) {
    nickName = nickName.trim();
    // 昵称不能只包含空格
    if (!nickName) {
      return {
        code: 400, data: false, message: '昵称禁止为空',
      };
    }
    // 用户名最多 12 个字
    if (nickName.length > 12) {
      return {
        code: 400, data: false, message: '昵称太长',
      };
    }
  }

  // 简介最多 40 个字
  if (profile && profile.length > 40) {
    return {
      code: 400, data: false, message: '简介太长',
    };
  }

  // 用正则校验用户头像
  if (avatarUrl && !URL_REG.test(avatarUrl)) {
    return {
      code: 400, data: false, message: '头像路径非法',
    };
  }

  // 校验邮箱
  if (email && (!EMAIL_REG.test(email) || email.length > 100)) {
    return {
      code: 400, data: false, message: '邮箱非法',
    };
  }

  // 获取当前登录用户
  const {userInfo} = app.auth().getEndUserInfo();
  if (!userInfo || !userInfo.customUserId) {
    return false;
  }
  const currentUser = await db
    .collection('user')
    .where({
      unionId: userInfo.customUserId, isDelete: false,
    })
    .limit(1)
    .get()
    .then(({data}) => data[0]);
  if (!currentUser || !currentUser._id) {
    return false;
  }

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
        unionId: _.neq(userInfo.customUserId), nickName, isDelete: false,
      })
      .count()
      .then((res) => res.total);
    if (sameNameNum > 0) {
      return {
        code: 400, data: false, message: '该昵称已被占用',
      };
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
  console.log('updateUser data = {}', updateData);
  return {
    code: 200, data: result,
  };
};
