const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const collection = db.collection('comment');
const _ = db.command;
const $ = db.command.aggregate;

/**
 * 搜索回答（支持分页）
 * @param event
 * @param context
 * @return {Promise<{total: number, data: []}|{total: *, data: *}>}
 */
exports.main = async (event, context) => {
  const {
    userId,
    reviewStatus,
    questionId,
    pageSize = 10,
    pageNum = 1,
    getQuestion = false,
    getReplyList = false,
  } = event;

  const conditions = { isDelete: false, reviewStatus, questionId };
  if (userId) {
    conditions.userId = userId;
  }

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

  // 查询消息
  let query = collection.aggregate().match(conditions);

  // 需要查询题目
  if (getQuestion) {
    query = query.lookup({
      from: 'question',
      localField: 'questionId',
      foreignField: '_id',
      as: 'question',
    });
  }

  // 需要查询回复列表
  if (getReplyList) {
    query = query.lookup({
      from: 'reply',
      let: {
        commentId: '$_id',
      },
      pipeline: $.pipeline()
        .match(_.expr($.and([$.eq(['$commentId', '$$commentId']), $.eq(['$isDelete', false])])))
        .limit(4)
        .done(),
      as: 'replyList',
    });
  } else {
    // 不用查回复列表，直接关联用户表拿头像等信息
    query = query.lookup({
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
    });
  }

  const data = await query
    .sort({
      priority: -1,
      thumbNum: -1,
      _createTime: 1,
    })
    .skip((pageNum - 1) * pageSize)
    .limit(pageSize)
    .end()
    .then((res) => {
      return res.data;
    });

  // 查询关联用户信息
  if (getReplyList) {
    const userIdList = [];
    data.forEach((comment) => {
      userIdList.push(comment.userId);
      if (comment.replyList && comment.replyList.length > 0) {
        comment.replyList.forEach((reply) => {
          userIdList.push(reply.userId);
          if (reply.replyUserId) {
            userIdList.push(reply.replyUserId);
          }
        });
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
    data.forEach((comment) => {
      comment.userInfo = [userIdInfoMap[comment.userId]];
      if (comment.replyList && comment.replyList.length > 0) {
        comment.replyList.forEach((reply) => {
          reply.userInfo = [userIdInfoMap[reply.userId]];
          if (reply.replyUserId) {
            reply.replyUserInfo = [userIdInfoMap[reply.replyUserId]];
          }
        });
      }
    });
  }

  return {
    total,
    data,
  };
};
