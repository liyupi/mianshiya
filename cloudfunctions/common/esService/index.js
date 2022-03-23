const { Client } = require('@elastic/elasticsearch');
const esConfig = require('./esConfig.json');

const client = new Client({
  // 本地调试用公网地址 + IP 白名单配置
  // node: 'https://xxx:9200',
  // 实际发布用内网地址
  node: 'http://xxx:9200',
  auth: {
    username: esConfig.username,
    password: esConfig.password,
  },
});

/**
 * ElasticSearch 服务
 *
 * @desc 支持多种操作，私有网络部署和访问
 * @param event
 * @param context
 * @return { code, body }
 * @author yupili
 */
exports.main = async (event, context) => {
  const { op, index, id, params = {} } = event;

  if (!op || !index) {
    return {
      code: 400,
      data: null,
      message: '请求参数错误',
    };
  }

  switch (op) {
    case 'add':
      return doAdd(index, id, params);
    case 'get':
      return doGet(index, id);
    case 'delete':
      return doDelete(index, id);
    case 'search':
      return doSearch(index, params);
    case 'update':
      return doUpdate(index, id, params);
    case 'exists':
      return doExists(index, id);
    default:
      return null;
  }
};

/**
 * 插入
 * @param index
 * @param id
 * @param params
 * @return {Promise<{code: number, body}>}
 */
const doAdd = async (index, id, params) => {
  const res = await client
    .index({
      index,
      id,
      body: params,
    })
    .catch((e) => {
      console.error('es add error', e);
      return e.meta;
    });
  return {
    code: res.statusCode,
    body: res.body,
  };
};

/**
 * 删除
 * @param index
 * @param id
 * @return {Promise<{code: number, body}>}
 */
const doDelete = async (index, id) => {
  const res = await client
    .delete({
      index,
      id,
    })
    .catch((e) => {
      console.error('es delete error', e);
      return e.meta;
    });
  return {
    code: res.statusCode,
    body: res.body._id,
  };
};

/**
 * 单查
 * @param index
 * @param id
 * @return {Promise<{code: number, body: TResponse}>}
 */
const doGet = async (index, id) => {
  const res = await client
    .get({
      index,
      id,
    })
    .catch((e) => {
      console.error('es get error', e);
      return e.meta;
    });
  return {
    code: res.statusCode,
    body: res.body,
  };
};

/**
 * 局部更新
 * @param index
 * @param id
 * @param params
 * @return {Promise<{code: number, body}>}
 */
const doUpdate = async (index, id, params) => {
  const res = await client
    .update({
      index,
      id,
      body: {
        doc: params,
      },
    })
    .catch((e) => {
      console.error('es update error', e);
      return e.meta;
    });
  return {
    code: res.statusCode,
    body: res.body._id,
  };
};

/**
 * 分页搜索
 * @param index
 * @param params
 * @return {Promise<{code: number, body: any}>}
 */
const doSearch = async (index, params) => {
  const res = await client.search({
    index,
    from: params.from,
    size: params.size,
    body: params,
  });
  return {
    code: res.statusCode,
    body: res.body.hits,
  };
};

/**
 * 是否存在
 * @param index
 * @param id
 * @return {Promise<{code: number, body: TResponse}>}
 */
const doExists = async (index, id) => {
  const res = await client
    .exists({
      index,
      id,
    })
    .catch((e) => {
      console.error('es exists error', e);
      return e.meta;
    });
  return {
    code: res.statusCode,
    body: res.body,
  };
};
