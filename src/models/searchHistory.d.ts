/**
 * 搜索历史类型
 */
export interface SearchHistoryType {
  _id: string;
  content: string;
  userId: string;
  _createTime: Date;
  _updateTime: Date;
}
