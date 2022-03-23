import type { ReplyType, ReplyUserType } from '@/models/reply';
import type { PageResult, PageSearchParams } from './common';
import axios from 'axios';

export interface ReplySearchParams extends PageSearchParams {
  commentId?: string;
  replyId?: string;
  questionId?: string;
  userId?: string;
}

/**
 * 新增
 * @param params
 */
export function addReply(params: Partial<ReplyType>) {
  const { content, commentId } = params;
  if (!content || !commentId) {
    return false;
  }

  return axios
    .post('/reply/add', params)
    .then((res: any) => {
      console.log(`addReply succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`addReply error`, e);
      return false;
    });
}

/**
 * 删除
 * @param replyId
 */
export function deleteReply(replyId: string) {
  if (!replyId) {
    return false;
  }

  return axios
    .post('/reply/delete', {
      replyId,
    })
    .then((res: any) => {
      console.log(`deleteReply succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`deleteReply error`, e);
      return false;
    });
}

/**
 * 分页搜索
 * @param params
 */
export async function searchReplies(params: ReplySearchParams): Promise<PageResult<ReplyUserType>> {
  return axios
    .post('/reply/search', params)
    .then((res: any) => {
      console.log(`searchReplies succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`searchReplies error`, e);
      return {
        data: [],
        total: 0,
      };
    });
}
