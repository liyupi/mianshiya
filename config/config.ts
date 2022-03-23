// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { REACT_APP_ENV } = process.env;
const IS_PROD = process.env.NODE_ENV !== 'development';

export default defineConfig({
  hash: true,
  antd: {},
  publicPath: IS_PROD ? "https://cdn.xxx.com/" : '/',
  dva: {
    hmr: true,
  },
  locale: {
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  layout: {
    // https://umijs.org/zh-CN/plugins/plugin-layout
    ...defaultSettings,
  },
  // dynamicImport: {
  //   loading: '@/components/GlobalLoading',
  // },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
    'root-entry-name': 'default',
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  // Fast Refresh 热更新
  fastRefresh: {},
  // 生产环境移除 console，性能优化
  extraBabelPlugins: [
    IS_PROD ? 'transform-remove-console' : "",
  ],
  nodeModulesTransform: {
    type: 'none',
  },
  mfsu: {},
  webpack5: {},
  // exportStatic: {},
});
