const cloud = require('@cloudbase/node-sdk');
const moment = require('moment');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});
const db = app.database();
const _ = db.command;
const $ = db.command.aggregate;

/**
 * 统计用户周期内积分排行（定时任务，每日 2 点执行一次）
 * @param event
 * @param context
 * @return {Promise<void>}
 */
exports.main = async (event, context) => {
  // 周统计
  await doCount(0);
  // 月统计
  await doCount(1);
};

/**
 * 统计
 * @param cycle
 * @return {Promise<void>}
 */
async function doCount(cycle) {
  let startMoment;
  if (cycle === 1) {
    startMoment = moment().startOf('month');
  } else {
    startMoment = moment().startOf('week').add(1, 'd');
  }
  const endTime = new Date();

  // 统计前 20
  let rankList = await db
    .collection('userScore')
    .aggregate()
    .match({
      _createTime: _.gte(startMoment.toDate()).and(_.lte(endTime)),
      isDelete: false,
    })
    .group({
      _id: '$userId',
      totalScore: $.sum('$score'),
    })
    .sort({
      totalScore: -1,
    })
    .limit(20)
    .end()
    .then((res) => res.data);

  const countDate = startMoment.format('YYYY-MM-DD');
  const data = {
    cycle,
    countDate,
    rankList: JSON.stringify(rankList),
    _createTime: new Date(),
    _updateTime: new Date(),
    isDelete: false,
  };

  const oldData = await db
    .collection('userScoreRank')
    .where({
      countDate,
      isDelete: false,
    })
    .get()
    .then((res) => res.data[0]);

  if (oldData) {
    return await db
      .collection('userScoreRank')
      .doc(oldData._id)
      .update(data)
      .then((res) => {
        console.log(res);
        return res;
      });
  } else {
    return await db
      .collection('userScoreRank')
      .add(data)
      .then((res) => {
        console.log(res);
        return res;
      });
  }
}
