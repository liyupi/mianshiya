const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const _ = db.command;

/**
 * 搜索试卷
 * @param event
 * @param context
 * @return {Promise<boolean|number>}
 */
exports.main = async (event, context) => {
  const { pageSize = 12, pageNum = 1, orderKey = '_createTime', order = 'desc' } = event;
  // 防止爬虫
  if (pageSize > 20) {
    return {
      data: [],
      total: 0,
    };
  }

  const conditions = getSearchConditions(event);
  const res = await db
    .collection('paper')
    .where(conditions)
    .orderBy(orderKey, order)
    .skip((pageNum - 1) * pageSize)
    .limit(pageSize)
    .get();
  const count = await db.collection('paper').where(conditions).count();

  return {
    data: res.data,
    total: count.total,
  };
};

/**
 * 获得搜索条件
 * @param params
 */
function getSearchConditions(params) {
  const condition = { isDelete: false, ownership: params.ownership };
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
  if (params.priority) {
    condition.priority = params.priority;
  }
  if (params.tags && params.tags.length > 0) {
    condition.tags = _.in([params.tags[0]]);
    for (let i = 1; i < params.tags.length; i += 1) {
      condition.tags = condition.tags.and(_.in([params.tags[i]]));
    }
  }
  return condition;
}
