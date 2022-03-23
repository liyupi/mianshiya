const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const collection = db.collection('searchHistory');
const _ = db.command;

/**
 * 获取搜索记录
 *
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 * @author wenjingyuer
 */
exports.main = async (event, context) => {
  const curDate = new Date();
  const preDate = new Date(curDate.getTime() - 48 * 60 * 60 * 1000);
  const res = await collection
    .where({
      _createTime: _.gte(preDate),
    })
    .get();
  const resMap = new Map();
  res.data.forEach((item, index) => {
    const count = resMap.get(item.content) ? resMap.get(item.content) + 1 : 1;
    resMap.set(item.content, count);
  });

  const resArray = Array.from(resMap);
  const result = resArray.sort((a, b) => b[1] - a[1]).slice(0, 5);
  return result.map((res) => res[0]);
};
