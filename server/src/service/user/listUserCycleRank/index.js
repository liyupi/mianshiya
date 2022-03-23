const app = require('../../../app');
const {SIMPLE_USER_FIELDS} = require("../../../constant");

const db = app.database();
const _ = db.command;

/**
 * 获取用户积分排行统计榜
 * @desc cycle: 0-周榜 1-月榜
 * @param event
 * @param context
 */
exports.main = async (event, context) => {
  const { cycle = 0, countDate, pageSize = 10 } = event;
  let result = [];
  if (![0, 1].includes(cycle) || !countDate || !pageSize) {
    return result;
  }

  const userScoreRank = await db
    .collection('userScoreRank')
    .field({
      countDate: true,
      rankList: true,
    })
    .where({
      cycle,
      countDate,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);

  if (userScoreRank && userScoreRank.rankList) {
    const rankList = JSON.parse(userScoreRank.rankList).slice(0, pageSize);
    const userIds = rankList.map((item) => item._id);
    const users = await db
      .collection('user')
      .field(SIMPLE_USER_FIELDS)
      .where({
        _id: _.in(userIds),
      })
      .get()
      .then(({ data }) => data);
    result = rankList.map((rank) => {
      const userInfo = users.find((user) => user._id === rank._id);
      return Object.assign({}, rank, userInfo);
    });
  }
  return result;
};
