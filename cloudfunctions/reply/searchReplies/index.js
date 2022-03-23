const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const collection = db.collection('reply');
const _ = db.command;
const $ = db.command.aggregate;

/**
 * 获取回复列表（支持分页）
 * @param event
 * @param context
 * @return {Promise<{total: number, data: []}|{total: *, data: *}>}
 */
exports.main = async (event, context) => {
  const {
    commentId,
    replyId,
    pageSize = 10,
    pageNum = 1,
    orderKey = '_createTime',
    order = 'desc',
  } = event;
  const conditions = { isDelete: false, commentId, replyId };

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

  // comment 主要查询评论表（id, content)
  // reply 关联查询回复表 (commentId, content)

  const sortCondition = {
    [orderKey]: order === 'desc' ? -1 : 1,
  };
  // 查询
  const data = await collection
    .aggregate()
    .match(conditions)
    .lookup({
      from: 'reply',
      localField: '_id',
      foreignField: 'commentId',
      as: 'reply',
    })
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
    .sort(sortCondition)
    .skip((pageNum - 1) * pageSize)
    .limit(pageSize)
    .end()
    .then((res) => {
      return res.data;
    });

  // 查询关联用户信息，[1, 2]
  const userIdList = [];
  data.forEach((reply) => {
    if (reply.replyUserId) {
      userIdList.push(reply.replyUserId);
    }
  });

  // [{id: 1, nickName: 鱼皮}, {id: 2, nickName: 鱼皮狗}]
  const userList = await db
    .collection('user')
    .field({
      _id: true,
      nickName: true,
      avatarUrl: true,
    })
    .where({
      _id: _.in(userIdList),
      isDelete: false,
    })
    .get()
    .then((res) => {
      return res.data;
    });

  // { "1": {id: 1, nickName: 鱼皮}, "2": {id: 2, nickName: 鱼皮狗}}
  const userIdInfoMap = {};
  userList &&
    userList.forEach((user) => {
      userIdInfoMap[user._id] = user;
    });
  data.forEach((reply) => {
    if (userIdInfoMap[reply.replyUserId]) {
      reply.replyUserInfo = [userIdInfoMap[reply.replyUserId]];
    }
  });

  return {
    total,
    data,
  };
};
