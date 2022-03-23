const app = require('../../../app');
const { getLoginUser } = require('../../user/userService');

const db = app.database();
const _ = db.command;

/**
 * 获取推荐题目列表
 * @param event
 * @param context
 * @return {Promise<*|*[]|*>}
 */
exports.main = async (event, context) => {
  const { size = 12 } = event;

  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  if (
    !currentUser ||
    !currentUser._id ||
    !currentUser.interests ||
    currentUser.interests.length < 1
  ) {
    return await getRecommendList(size);
  }

  // 推荐
  const recommendList = await getRecommendList(size, currentUser.interests);

  // 随机补全
  if (recommendList.length < size) {
    const randomList = await getRandomList(size - recommendList.length);
    return [...recommendList, ...randomList];
  }

  return recommendList;
};

/**
 * 获取推荐列表
 * @param size
 * @param interests
 */
function getRecommendList(size, interests) {
  const condition = { reviewStatus: 1, isDelete: false };
  if (interests && interests.length > 0) {
    condition.tags = _.in(interests);
  }
  return db
    .collection('question')
    .where(condition)
    .orderBy('priority', 'desc')
    .orderBy('viewNum', 'desc')
    .orderBy('favourNum', 'desc')
    .limit(size)
    .get()
    .then(({ data }) => {
      return data;
    })
    .catch((e) => {
      console.error(e);
      return [];
    });
}

/**
 * 获取随机列表
 * @param size
 */
function getRandomList(size) {
  return db
    .collection('question')
    .aggregate()
    .match({
      reviewStatus: 1,
      isDelete: false,
    })
    .sample({ size })
    .sort({
      priority: -1,
      viewNum: -1,
      favourNum: -1,
    })
    .end()
    .then(({ data }) => data);
}
