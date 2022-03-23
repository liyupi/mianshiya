const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');
const db = app.database();
const _ = db.command;

/**
 * 搜索（直接查库，支持分页，仅管理员可见）
 * @param event
 * @param context
 * @return {Promise<{total: number, data: []}|null|{total: *, data: *}>}
 */
exports.main = async (event, context) => {
  const { pageSize = 10, pageNum = 1 } = event;
  const emptyResult = {
    total: 0,
    data: [],
  };

  // 防止爬虫
  if (pageSize > 20 || pageNum > 20) {
    return emptyResult;
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  // 查询总数
  const condition = getSearchConditions(event);
  // 分页查总数
  const total = await db
    .collection('question')
    .where(condition)
    .count()
    .then((res) => res.total)
    .catch((err) => {
      console.error('getQuestionTotal error', err);
      return 0;
    });

  if (!total) {
    return emptyResult;
  }

  // 查询
  const list = await db
    .collection('question')
    .where(condition)
    .orderBy(event.orderKey ?? 'publishTime', event.order ?? 'desc')
    .skip(pageSize * (pageNum - 1))
    .limit(pageSize)
    .get()
    .then((res) => {
      return res.data;
    })
    .catch((e) => {
      console.error('searchQuestion error', e);
      return [];
    });

  return {
    total,
    data: list,
  };
};

/**
 * 获得搜索条件
 * @param params
 */
function getSearchConditions(params) {
  const condition = {
    isDelete: false,
    reviewStatus: params.reviewStatus,
    difficulty: params.difficulty,
    type: params.type,
  };
  if (params._ids) {
    condition._id = _.in(params._ids);
  }
  if (params.notId) {
    condition._id = _.neq(params.notId);
  }
  if (params.userId) {
    condition.userId = params.userId;
  }
  if (params.name) {
    condition.name = {
      $regex: `.*${params.name}.*`,
      $options: 'i',
    };
  }
  if (params.link) {
    condition.link = params.link;
  }
  if (params.priority) {
    condition.priority = params.priority;
  }
  // 必须包含所有标签
  if (params.tags && params.tags.length > 0) {
    condition.tags = _.in([params.tags[0]]);
    for (let i = 1; i < params.tags.length; i += 1) {
      condition.tags = condition.tags.and(_.in([params.tags[i]]));
    }
  }
  // 包含任一标签即可
  if (params.orTags && params.orTags.length > 0) {
    condition.tags = _.in(params.orTags);
  }
  return condition;
}
