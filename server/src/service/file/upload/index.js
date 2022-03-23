const { getLoginUser } = require('../../user/userService');

const COS = require('cos-nodejs-sdk-v5');
const { tcbConfig } = require('../../../config/getConfig');
const { COS_HOST } = require('../../../constant');

const cos = new COS({
  SecretId: tcbConfig.secretId,
  SecretKey: tcbConfig.secretKey,
});

/**
 * 创建试卷
 * @param event
 * @param context
 * @return {Promise<*|boolean>}
 */
exports.main = async (event, context) => {
  const { filename, file } = event;
  // 获取当前登录用户
  const currentUser = await getLoginUser(context);

  // 检查文件后缀
  let index = filename.lastIndexOf('.');
  if (index < 0) {
    return false;
  }

  const fileType = filename.substr(index + 1);
  const fileKey = `img/${new Date().getTime()}_${Math.round(Math.random() * 10000)}.${fileType}`;

  const res = await cos.putObject({
    Bucket: 'mianshiya-xxx' /* 填入您自己的存储桶，必须字段 */,
    Region: 'ap-shanghai' /* 存储桶所在地域，例如ap-beijing，必须字段 */,
    Key: fileKey /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */,
    StorageClass: 'STANDARD',
    Body: Buffer.from(file.split(',')[1], 'base64'), // 上传文件对象
  });

  if (res.statusCode === 200) {
    const fileURL = `${COS_HOST}/${fileKey}`;
    console.log(`uploadFile succeed, userId = ${currentUser._id}, fileURL = ${fileURL}`);
    return {
      fileURL,
    };
  }

  console.log(res);
};
