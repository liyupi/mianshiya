import { getCurrentUser } from '@/services/user';
import { getPageQuery } from '@/utils/utils';
import { history } from '@@/core/history';
import axios from 'axios';

export interface LoginParamsType {
  captcha: string;
  type: string;
  userId?: string;
}

/**
 * 用户登录
 * @param loginParams
 */
export async function login(loginParams: LoginParamsType) {
  const { captcha } = loginParams;
  // tcb 登录
  if (!captcha) {
    console.error('login error, no captcha');
    return null;
  }
  const data = await axios
    .post('login', { captcha })
    .then((res: any) => {
      console.log('login', res);
      return res;
    })
    .catch((err) => console.error(err));
  if (!data) {
    return null;
  }
  if (data === 403) {
    console.error('访问太过频繁！');
    return null;
  }
  // 获取用户信息
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser._id) {
    return null;
  }
  if (window.location.pathname.startsWith('/user/login')) {
    const urlParams = new URL(window.location.href);
    const params = getPageQuery();
    let { redirect } = params as { redirect: string };
    if (redirect) {
      const redirectUrlParams = new URL(redirect);
      if (redirectUrlParams.origin === urlParams.origin) {
        redirect = redirect.substr(urlParams.origin.length);
        console.log(redirect);
        if (redirect.match(/^\/.*#/)) {
          redirect = redirect.substr(redirect.indexOf('#') + 1);
        }
      } else {
        window.location.href = '/';
        return currentUser;
      }
    }
    history.replace(redirect || '/account/info');
  }
  return currentUser;
}

/**
 * 用户退出登录
 */
export async function logout() {
  return axios
    .post('/logout')
    .then((res: any) => {
      console.log('logout succeed', res);
      return res;
    })
    .catch((e: any) => {
      console.error('logout error', e);
      return false;
    });
}
