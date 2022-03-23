import type { TopicType } from '@/models/topic';

/**
 * 登录 Cookie 键名
 */
export const LOGIN_STATUS = 'loginStatus';

/**
 * url 动态码键名
 */
export const DYNAMIC_CAPTCHA = 'dc';

/**
 * 默认用户名
 */
export const DEFAULT_USER_NAME = '鸭鸭';

/**
 * 网站域名
 * @type {string}
 */
export const WEB_HOST = 'https://www.mianshiya.com';

/**
 * 对象存储域名
 */
export const STORAGE_HOST = 'https://xxx.mianshiya.com';

/**
 * 系统 LOGO
 */
export const SYSTEM_LOGO = `${STORAGE_HOST}/logo.png`;

/**
 * 默认头像
 */
export const DEFAULT_AVATAR = `${STORAGE_HOST}/logo.png`;

/**
 * 二维码图片
 */
export const QR_CODE = `${STORAGE_HOST}/qrcode.jpg`;

/**
 * 鱼皮公众号二维码
 */
export const YUPI_QR_CODE = `${STORAGE_HOST}/yupi_qrcode.png`;

/**
 * 标语
 */
export const SLOGAN = '助你成为面试达人';

/**
 * 用户搜索历史  LocalStorage 键名
 */
export const SEARCH_HISTORY_KEY = 'searchHistory';

/**
 * 补充专区
 */
export const EXTRA_TOPIC = {
  key: 'recommend',
  icon: SYSTEM_LOGO,
  name: '推荐',
} as TopicType;
