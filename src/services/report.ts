import type { ReportType } from '@/models/report';
import { reviewStatusInfoMap } from '@/constant/reviewStatusEnum';
import type { PageSearchParams } from '@/services/common';
import axios from 'axios';

export interface ReportSearchParams extends PageSearchParams {
  reportResourcesId?: string;
  reporterId?: string;
  reportedUserId?: string;
  reportType?: number;
  reportReason?: number;
  reviewStatus?: number;
  reviewerId?: string;
}

/**
 * 新增
 * @param params
 */
export async function addReport(params: Partial<ReportType>) {
  const { reportedUserId, reportResourceId, reportType = -1, reportReason = -1 } = params;
  if ((!reportResourceId && !reportedUserId) || reportType < 0 || reportReason < 0) {
    return false;
  }

  return axios
    .post('/report/add', params)
    .then((res: any) => {
      console.log(`addReport succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`addReport error`, e);
      return false;
    });
}

/**
 * 分页搜索
 * @param params
 */
export async function searchReportByPage(params: ReportSearchParams) {
  const { pageSize = 12, pageNum = 1 } = params;
  const emptyResult = {
    data: [],
    total: 0,
  };
  if (pageSize < 1 || pageNum < 1) {
    return emptyResult;
  }
  return axios
    .post('/report/search', params)
    .then((res: any) => {
      console.log(`searchReportByPage succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error('searchReportByPage error', e);
      return emptyResult;
    });
}

/**
 * 审核举报
 * @param reportId
 * @param reviewStatus
 * @param reviewMessage
 */
export async function reviewReport(reportId: string, reviewStatus: number, reviewMessage?: string) {
  if (!reviewStatusInfoMap[reviewStatus]) {
    return false;
  }
  return axios
    .post('/report/review', {
      reportId,
      reviewStatus,
      reviewMessage,
    })
    .then((res: any) => {
      console.log(`reviewReport succeed, id = ${reportId}, reviewStatus = ${reviewStatus}`);
      return res;
    })
    .catch((e: any) => {
      console.error('reviewReport error', e);
      return false;
    });
}
