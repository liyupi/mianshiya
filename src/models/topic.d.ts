import type { TagType } from '@/.umi/plugin-dva/connect';

/**
 * 专区类型
 */
export interface TopicType {
  _id: string;
  key: string;
  icon: string;
  name: string;
  desc: string;
  subTags: TagType[];
  keyTags: TagType[];
  viewNum: number;
  _createTime: Date;
  _updateTime: Date;
  isDelete: boolean;
}
