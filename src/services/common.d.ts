/**
 * 分页参数
 */
export interface PageSearchParams {
  pageSize?: number;
  pageNum?: number;
  orderKey?: string;
  order?: 'desc' | 'asc';
}

/**
 * 分页结果
 */
export interface PageResult<T> {
  data: T[];
  total: number;
}

/**
 * 通用响应
 */
export interface BaseResponse<T> {
  code: number;
  data: T;
  message: string;
}
