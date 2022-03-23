import { parse } from 'querystring';
import moment from 'moment';
import { COMPANY_LIST } from '@/constant/paper';
import { DEFAULT_AVATAR } from '@/constant';

/**
 * 检验是否为 URL
 */
export const URL_REG =
  /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => URL_REG.test(path);

export const getPageQuery = () => parse(window.location.href.split('?')[1]);

/**
 * 让查询支持分页
 * @param query
 * @param pageSize
 * @param pageNum
 */
export const wrapPageQuery = (query: any, pageSize?: number, pageNum?: number) => {
  let resultQuery = query;
  if (pageSize) {
    resultQuery = query.limit(pageSize);
    if (pageNum) {
      resultQuery = query.skip(pageSize * (pageNum - 1));
    }
  }
  return resultQuery;
};

/**
 * 美化文本
 *
 * @param str
 */
export const beautifyDetail = (str: string) => {
  const resultStr = str.replace(/\n/g, '<br/>');
  const reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
  if (resultStr.length && reg.exec(resultStr)) {
    return resultStr.replace(reg, "<a href='$1$2' target='_blank'>$1$2</a>");
  }
  return resultStr;
};

/**
 * 获得格式化日期字符串
 * @param time
 */
export const formatDateStr = (time: any) => {
  if (!time) {
    return '';
  }
  return moment(time).format('YYYY-MM-DD');
};

/**
 * 获得格式化日期时间字符串（年-月-日 时-分）
 * @param time
 * @param format
 */
export const formatPartDateTimeStr = (time: any, format = 'YYYY-MM-DD HH:mm') => {
  if (!time) {
    return '';
  }
  return moment(time).format(format);
};

/**
 * 获得格式化日期时间字符串
 * @param time
 * @param format
 */
export const formatDateTimeStr = (time: any, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) {
    return '';
  }
  return moment(time).format(format);
};

/**
 * 判断是否为移动设备
 */
export const isMobile = () => {
  const deviceWidth = document.querySelector('body')?.offsetWidth;
  return deviceWidth && deviceWidth < 480;
};

/**
 * 获取公司图片
 * @param paper
 */
export const getCompanyImg = (paper: PaperType) => {
  if (!paper || !paper.name) {
    return DEFAULT_AVATAR;
  }
  for (const company of COMPANY_LIST) {
    if (paper.name.includes(company.key)) {
      return company.picUrl;
    }
  }
  return DEFAULT_AVATAR;
};
