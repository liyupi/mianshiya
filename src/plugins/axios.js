/**
 * 全局 Axios 配置（加载一次即可）
 * @author yupi
 */
import axios from 'axios';
import { toLoginPage } from '@/utils/businessUtils';
import { message } from 'antd';

// 根据环境设定请求后端 url 地址
axios.defaults.baseURL =
  process.env.NODE_ENV === 'production'
    ? 'https://fly.mianshiya.com/api'
    : 'http://local.mianshiya.com:7592/api';

axios.defaults.withCredentials = true;

// 添加全局请求拦截器
axios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  },
);

// 添加全局响应拦截器
axios.interceptors.response.use(
  function (response) {
    const serverResponse = response.data;
    console.log('serverResponse', serverResponse);
    // 兼容老接口返回值
    if (!serverResponse.code) {
      return serverResponse;
    }
    if (serverResponse.code === 401) {
      message.warning('请先登录');
      toLoginPage();
      return Promise.reject(serverResponse);
    } else if (serverResponse.code === 403) {
      message.error('无权访问');
      toLoginPage();
      return Promise.reject(serverResponse);
    } else if (serverResponse.code === 500) {
      message.error('服务器错误，请重试');
      return Promise.reject(serverResponse);
    }
    return serverResponse;
  },
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  },
);
