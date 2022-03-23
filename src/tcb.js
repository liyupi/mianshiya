import cloudbase from '@cloudbase/js-sdk';
import axios from 'axios';

// 将你的环境 Id 填写到此处
export const envId = 'mianshiya-xxx';

const app = cloudbase.init({
  env: envId,
});

const auth = app.auth({
  persistence: 'local',
});

/**
 * 匿名登录
 * @returns {Promise<ILoginState>}
 */
export async function tcbLogin() {
  // 1. 建议登录前先判断当前是否已经登录
  let loginState = await auth.getLoginState();
  if (!loginState) {
    // 2. 匿名登录
    await auth.anonymousAuthProvider().signIn();
    loginState = await auth.getLoginState();
    console.log('tcbLogin', loginState);
  }
  return loginState;
}

/**
 * 自定义登录
 * @param captcha
 */
export async function tcbCustomLogin(captcha) {
  let loginState = await auth.getLoginState();
  if (!captcha) {
    console.error('no captcha!');
    return loginState;
  }
  const data = await axios
    .post('login', { captcha })
    .then((res) => {
      console.log('login', res);
      return res;
    })
    .catch((err) => console.error(err));
  if (data === 403) {
    console.error('访问太过频繁！');
    return loginState;
  }
  if (!data.ticket) {
    console.error('ticket is null');
    return loginState;
  }
  loginState = await auth.customAuthProvider().signIn(data.ticket);
  console.log('tcbCustomLogin', loginState);
  return loginState;
}

/**
 * 注销
 * @return {Promise<void>}
 */
export async function tcbLogout() {
  console.log('tcbLogout');
  await auth.signOut();
  await tcbLogin();
}

export const getApp = () => {
  return app;
};
