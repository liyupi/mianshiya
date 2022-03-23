const cloud = require('@cloudbase/node-sdk');

const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV,
});

const db = app.database();
const _ = db.command;
const FORBIDDEN_CODE = -403;
const BLACK_IP_LIST = ['xxx'];

/**
 * 获取推荐题目列表
 * @param event
 * @param context
 * @return {Promise<*|*[]|*>}
 */
exports.main = async (event, context) => {
  // IP 黑名单
  const { TCB_SOURCE_IP } = cloud.getCloudbaseContext(context);
  if (!TCB_SOURCE_IP || BLACK_IP_LIST.includes(TCB_SOURCE_IP)) {
    console.error('ip {} is in blackList, banned!', TCB_SOURCE_IP);
    return FORBIDDEN_CODE;
  }

  const { size = 12 } = event;

  // 获取当前登录用户
  const { userInfo } = app.auth().getEndUserInfo();
  if (!userInfo || !userInfo.customUserId) {
    return await getRecommendList(size);
  }
  const currentUser = await db
    .collection('user')
    .where({
      unionId: userInfo.customUserId,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);

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
