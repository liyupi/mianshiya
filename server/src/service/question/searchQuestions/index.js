const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');

/**
 * 搜索题目（ES）
 * @param event
 * @param context
 * @return {Promise<boolean|number>}
 */
exports.main = async (event, context) => {
  let {
    name,
    tags,
    orTags,
    type,
    difficulty = -1,
    reviewStatus = -1,
    hasReference,
    hasComment,
    userId,
    priority,
    orderKey,
    order,
    pageSize = 12,
    pageNum = 1,
  } = event.queryStringParameters ? event.queryStringParameters : event;

  // 防止爬虫
  if (pageSize > 20 || pageNum > 20) {
    return {
      data: [],
      total: 0,
    };
  }

  // 移除多余的空格
  if (name) {
    name = name.trim();
  }

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  const queryData = {
    query: {
      bool: {
        filter: [
          {
            term: {
              isDelete: false,
            },
          },
        ],
      },
    },
    from: (pageNum - 1) * pageSize,
    size: pageSize,
    sort: [
      // {
      //   priority: {
      //     order: 'desc',
      //   },
      // },
    ],
  };

  if (name && name.length > 0) {
    queryData.query.bool.should = [
      {
        match: {
          name,
        },
      },
      {
        match: {
          detail: name,
        },
      },
    ];
    queryData.query.bool.minimum_should_match = 1;
  }

  if (reviewStatus >= 0) {
    queryData.query.bool.filter.push({
      term: {
        reviewStatus,
      },
    });
  }

  if (type >= 0) {
    queryData.query.bool.filter.push({
      term: {
        type,
      },
    });
  }

  if (difficulty >= 0) {
    queryData.query.bool.filter.push({
      term: {
        difficulty,
      },
    });
  }

  if (userId) {
    queryData.query.bool.filter.push({
      term: {
        userId,
      },
    });
  }

  if (priority) {
    queryData.query.bool.filter.push({
      term: {
        priority,
      },
    });
  }

  // 只看有回答的
  if (hasComment) {
    queryData.query.bool.filter.push({
      range: {
        commentNum: {
          gt: 0,
        },
      },
    });
  }

  // 只看有标准答案的
  if (hasReference) {
    queryData.query.bool.filter.push({
      exists: {
        field: 'reference',
      },
    });
  }

  if (tags && tags.length > 0) {
    tags.forEach((tag) => {
      queryData.query.bool.filter.push({
        term: {
          tags: tag,
        },
      });
    });
  }

  // 查询至少包含一个标签的题目
  if (orTags && orTags.length > 0) {
    queryData.query.bool.filter.push({
      terms: {
        tags: orTags,
      },
    });
  }

  if (orderKey && order) {
    queryData.sort.push({
      [orderKey]: {
        order,
      },
    });
  }

  const res = await app
    .callFunction({
      name: 'esService',
      data: {
        op: 'search',
        index: 'question',
        params: queryData,
      },
    })
    .catch((e) => console.log(e));

  if (res?.result?.code !== 200) {
    throw new Error('res searchQuestions error', res);
  }

  const data = [];
  const hits = res.result.body.hits;
  if (hits && hits.length > 0) {
    hits.forEach((hit) => {
      hit._source._id = hit._id;
      data.push(hit._source);
    });
  }

  return {
    total: res.result.body.total.value,
    data,
  };
};
