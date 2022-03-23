const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const collection = db.collection('question');
const _ = db.command;

/**
 * 定期同步数据库的题目到 ES（每分钟）
 * @param event
 * @param context
 * @author liyupi
 */
exports.main = async (event, context) => {
  // 查询近 5 分钟内的数据
  const maxTime = new Date(new Date().getTime() - 5 * 60 * 1000);
  const condition = {
    _updateTime: _.gte(maxTime),
  };
  // 查询数据库题目数据总数
  const total = await collection
    .where(condition)
    .count()
    .then((res) => {
      return res.total;
    });

  console.log('数据库待同步总行数', total);

  if (!total) {
    return {
      total: 0,
      changeCount: 0,
    };
  }

  const pageSize = 100;
  // 新插入或变更的数据
  let changeCount = 0;

  // 分页插入 ES
  for (let i = 0; i < total; i += pageSize) {
    const list = await collection
      .where(condition)
      .skip(i)
      .limit(pageSize)
      .get()
      .then(({ data }) => data);

    for (let j = 0; j < list.length; j++) {
      const data = list[j];
      const id = data._id;
      delete data._id;
      delete data.reference;
      const res = await app
        .callFunction({
          name: 'esService',
          data: {
            op: 'add',
            index: 'question',
            id,
            params: data,
          },
        })
        .then((res) => {
          console.log('操作成功', id);
          return res.result;
        })
        .catch((e) => {
          console.error(`es add error`, e, id);
          return false;
        });
      if (res) {
        changeCount++;
      }
    }
  }

  return {
    total,
    changeCount,
  };
};
