import type { CommentType, CommentUserType } from '@/models/comment';
import { reviewStatusInfoMap } from '@/constant/reviewStatusEnum';
import type { PageResult, PageSearchParams } from './common';
import axios from 'axios';

export interface CommentSearchParams extends PageSearchParams {
  commentId?: string;
  questionId?: string;
  content?: string;
  reviewStatus?: number;
  getQuestion?: boolean; // 是否获取题目信息
  getReplyList?: boolean; // 是否获取回复列表信息
}

/**
 * 新增
 * @param params
 */
export function addComment(params: Partial<CommentType>) {
  const { content, questionId } = params;
  if (!content || !questionId) {
    return false;
  }

  return axios
    .post('/comment/add', params)
    .then((res) => {
      console.log(`addComment succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`addComment error`, e);
      return false;
    });
}

/**
 * 分页搜索
 * @param params
 */
export async function searchComments(
  params: CommentSearchParams,
): Promise<PageResult<CommentUserType>> {
  const { pageSize = 8, pageNum = 1 } = params;
  const emptyResult = {
    data: [],
    total: 0,
  };
  if (pageSize < 1 || pageNum < 1) {
    return emptyResult;
  }
  return axios
    .post('/comment/search', params)
    .then((res: any) => {
      console.log(`searchComments succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error('searchComments error', e);
      return emptyResult;
    });
}

/**
 * 审核回答
 * @param commentId
 * @param reviewStatus
 * @param reviewMessage
 */
export async function reviewComment(
  commentId: string,
  reviewStatus: number,
  reviewMessage?: string,
) {
  if (!commentId || !reviewStatusInfoMap[reviewStatus]) {
    return false;
  }

  return axios
    .post('/comment/review', {
      commentId,
      reviewStatus,
      reviewMessage,
    })
    .then((res: any) => {
      console.log(`reviewComment succeed, id = ${commentId}`);
      return res;
    })
    .catch((e: any) => {
      console.error(`reviewComment error, id = ${commentId}`, e);
      return false;
    });
}

/**
 * 根据 id 获取
 * @param commentId
 * @param withUser 获取回答用户信息
 */
export function getComment(commentId: string, withUser = false) {
  if (!commentId) {
    return null;
  }

  return axios
    .post('/comment/get', {
      id: commentId,
      withUser,
    })
    .then((res: any) => {
      console.log(`getComment succeed, id = ${commentId}`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`getComment error, id = ${commentId}`, e);
      return null;
    });
}

/**
 * 点赞数 +1
 * @param commentId
 * @return
 */
export function thumbUpComment(commentId: string) {
  if (!commentId) {
    return false;
  }

  return axios
    .post('/comment/thumb-up', {
      commentId,
    })
    .then((res: any) => {
      console.log(`thumbUpComment succeed, id = ${commentId}`, res);
      return res.data;
    })
    .catch((e: any) => {
      console.error(`thumbUpComment error, id = ${commentId}`, e);
      return false;
    });
}

/**
 * 修改回答
 * @param commentId
 * @param comment
 */
export async function updateComment(commentId: string, comment: Partial<CommentType>) {
  if (!commentId || !comment) {
    return false;
  }

  return axios
    .post('/comment/update', {
      commentId,
      comment,
    })
    .then((res: any) => {
      console.log(`updateComment succeed, id = ${commentId}`, res);
      return true;
    })
    .catch((e: any) => {
      console.error(`updateComment error, id = ${commentId}`, e);
      return false;
    });
}

/**
 * 修改回答优先级（精选 / 取消精选 / 设为参考）
 * @param commentId
 * @param priority
 */
export async function updateCommentPriority(commentId: string, priority = -1) {
  if (!commentId || priority < 0) {
    return false;
  }

  return axios
    .post('/comment/update/priority', {
      commentId,
      priority,
    })
    .then((res: any) => {
      console.log(`updateCommentPriority succeed, id = ${commentId}`, res);
      return true;
    })
    .catch((e: any) => {
      console.error(`updateCommentPriority error, id = ${commentId}`, e);
      return false;
    });
}

/**
 * 删除回答
 * @param commentId
 */
export function deleteComment(commentId: string) {
  if (!commentId) {
    return false;
  }

  return axios
    .post('/comment/delete', {
      commentId,
    })
    .then((res: any) => {
      console.log(`deleteComment succeed, id = ${commentId}`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`deleteComment error, id = ${commentId}`, e);
      return false;
    });
}
