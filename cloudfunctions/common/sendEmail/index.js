/**
 * 发送邮件  sendEmail
 *
 * @param to   收件人
 * @param subject   主题
 * @param content   正文
 * @return bool  true / error (成功 / 错误)
 */

/**
 * 测试模板
 {
    "to": "xxx@qq.com",
    "subject": "邮件测试",
    "content": "正文"
 }
 */

const nodemailer = require('nodemailer');
const transporter_config = require('./transporter.json');
exports.main = async (event, context) => {
  const { to, subject, content } = event;
  if (!to || !subject || !content) {
    return null;
  }

  let mailOptions = {
    from: 'xxx@qq.com', // 发送方
    to, // 收件人
    subject, // 标题
    text: content, // 发送text或者html格式
    //   html: '<b>Hello world?</b>' // html body
  };

  // 发送邮件
  const transporter = nodemailer.createTransport(transporter_config);
  const res = await transporter.sendMail(mailOptions);
  return !!res;
};
