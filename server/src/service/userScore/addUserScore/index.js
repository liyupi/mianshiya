const app = require('../../../app');

const db = app.database();
const _ = db.command;

// 错误码
const ERROR_CODE = -1;

/**
 * 添加用户积分记录
 * @param event
 * @param context
 */
exports.main = async (event, context) => {
  const { userId, score, reason = -1, detail } = event;
  // 请求参数校验
  if (!userId || !score || reason < 0) {
    return false;
  }

  // 封装数据
  const data = {
    userId,
    score,
    reason,
    detail,
    _createTime: new Date(),
    _updateTime: new Date(),
    isDelete: false,
  };

  const transaction = await db.startTransaction();
  let res;

  try {
    // 插入用户积分记录
    res = await transaction
      .collection('userScore')
      .add(data)
      .then((res) => {
        console.log(`addUserScore succeed, id = ${res.id}`);
        return true;
      })
      .catch((e) => {
        console.error('addUserScore error', e);
        throw e;
      });

    // 更新用户积分
    res = await transaction
      .collection('user')
      .where({
        _id: userId,
        isDelete: false,
      })
      .update({
        score: _.inc(score),
        _updateTime: new Date(),
      })
      .then((res) => {
        console.log('updateUserScore succeed', res);
        return true;
      })
      .catch((e) => {
        console.error('updateUserScore error', e);
        throw e;
      });

    await transaction.commit();
    return res;
  } catch (e) {
    await transaction.rollback();
    console.error('未知错误！', e);
    return false;
  }
};
