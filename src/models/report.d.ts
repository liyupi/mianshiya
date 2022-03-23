/**
 * 举报类型
 */
export interface ReportType {
  _id: string;
  reporterId: string;
  reportedUserId?: string;
  reportResourceId?: string;
  reportType: number;
  reportReason: number;
  reportDetail?: string;
  reviewStatus: number;
  reviewMessage?: string;
  reviewerId: string;
  reviewTime?: Date;
  isDelete?: boolean;
  _createTime?: Date;
  _updateTime?: Date;
}
