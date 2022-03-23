const app = require('../../../app');

const db = app.database();

/**
 * 获取指定用户信息（传 unionId，给 java 后台调用）
 * @param event
 * @param context
 * @return {Promise<boolean|number>}
 */
exports.main = async (event, context) => {
  let { unionId } = event.queryStringParameters;

  if (!unionId) {
    return {
      code: 401,
    };
  }

  const currentUser = await db
    .collection('user')
    .field({
      _id: true,
      nickName: true,
      avatarUrl: true,
      interests: true,
      score: true,
      title: true,
      gender: true,
      profile: true,
    })
    .where({
      unionId,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }) => data[0]);

  console.log(currentUser);
  return currentUser;
};
