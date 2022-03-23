/**
 * 试卷类别枚举
 */
import { STORAGE_HOST } from '@/constant/index';

export const PAPER_OWNERSHIP_ENUM = {
  0: '私有',
  1: '公开',
};

/**
 * 试卷公开
 */
export const PAPER_OWNERSHIP_PUBLIC = 1;

/**
 * 试卷私有
 */
export const PAPER_OWNERSHIP_PRIVATE = 0;

/**
 * 官方试卷的优先级
 */
export const STANDARD_PAPER_PRIORITY = 9999;

/**
 * 普通试卷的优先级
 */
export const DEFAULT_PAPER_PRIORITY = 0;

/**
 * 公司列表
 */
export const COMPANY_LIST = [
  {
    key: '腾讯',
    picUrl: `${STORAGE_HOST}/web/company/tencent.jpeg`,
  },
  {
    key: '百度',
    picUrl: `${STORAGE_HOST}/web/company/baidu.png`,
  },
  {
    key: '阿里',
    picUrl: `${STORAGE_HOST}/web/company/alibaba.jpeg`,
  },
  {
    key: '字节',
    picUrl: `${STORAGE_HOST}/web/company/bytedance.png`,
  },
];
