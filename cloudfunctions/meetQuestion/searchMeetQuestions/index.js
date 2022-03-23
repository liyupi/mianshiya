const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const collection = db.collection('meetQuestion');
const _ = db.command;
const $ = db.command.aggregate;

/**
 * 搜索遇到题目（支持分页）
 * @param event
 * @param context
 * @return {Promise<{total: number, data: []}|{total: *, data: *}>}
 */
exports.main = async (event, context) => {
  const {
    userId,
    questionId,
    pageSize = 10,
    pageNum = 1,
  } = event;

  const conditions = { isDelete: false, questionId, userId };

  // 查询总数
  const total = await collection
    .where(conditions)
    .count()
    .then((res) => {
      return res.total;
    });

  if (!total) {
    return {
      total: 0,
      data: [],
    };
  }

  // 查询
  const query = collection.aggregate().match(conditions);
  const data = await query
    .lookup({
      from: 'user',
      let: {
        userId: '$userId',
      },
      pipeline: $.pipeline()
        .match(_.expr($.and([$.eq(['$_id', '$$userId'])])))
        .project({
          avatarUrl: 1,
          nickName: 1,
        })
        .done(),
      as: 'userInfo',
    })
    .sort({
      // 按时间倒序
      _createTime: -1,
    })
    .skip((pageNum - 1) * pageSize)
    .limit(pageSize)
    .end()
    .then((res) => {
      return res.data;
    });

  return {
    total,
    data,
  };
};
