/**
 * ⚠️ 注意！本文件仍调用云函数，如重新用，需改为调用云托管
 */
import { getApp } from '@/tcb';
import type { QuestionEditType, QuestionEditUserType } from '@/models/questionEdit';
import { reviewStatusInfoMap } from '@/constant/reviewStatusEnum';
import type { PageResult, PageSearchParams } from './common';

const app = getApp();
const db = app.database();
const collection = db.collection('questionEdit');

export interface QuestionEditSearchParams extends PageSearchParams {
  questionId?: string;
  userId?: string;
  reviewStatus?: number;
}

/**
 * 新增
 * @param params
 */
export function addQuestionEdit(params: Partial<QuestionEditType>) {
  const { reference, questionId, description } = params;
  if (!reference || !questionId || !description) {
    return false;
  }

  return app
    .callFunction({
      name: 'addQuestionEdit',
      data: params,
    })
    .then((res: any) => {
      console.log(`addQuestionEdit succeed`, res);
      return res.result;
    })
    .catch((e: any) => {
      console.error(`addQuestionEdit error`, e);
      return false;
    });
}

/**
 * 分页搜索
 * @param params
 */
export async function searchQuestionEdits(
  params: QuestionEditSearchParams,
): Promise<PageResult<QuestionEditUserType>> {
  return app
    .callFunction({
      name: 'searchQuestionEdits',
      data: params,
    })
    .then(({ result }: any) => {
      console.log(`searchQuestionEdits succeed`, result);
      return result;
    })
    .catch((e: any) => {
      console.error('searchQuestionEdits error', e);
      return {
        data: [],
        total: 0,
      };
    });
}

/**
 * 审核
 * @param questionEditId
 * @param reviewStatus
 * @param reviewMessage
 */
export async function reviewQuestionEdit(
  questionEditId: string,
  reviewStatus: number,
  reviewMessage?: string,
) {
  if (!questionEditId || !reviewStatusInfoMap[reviewStatus]) {
    return false;
  }

  return app
    .callFunction({
      name: 'reviewQuestionEdit',
      data: {
        questionEditId,
        reviewStatus,
        reviewMessage,
      },
    })
    .then((res: any) => {
      console.log(`reviewQuestionEdit succeed, id = ${questionEditId}`);
      return res;
    })
    .catch((e: any) => {
      console.error(`reviewQuestionEdit error, id = ${questionEditId}`, e);
      return false;
    });
}

/**
 * 根据 id 获取
 * @param questionEditId
 */
export function getQuestionEdit(questionEditId: string) {
  if (!questionEditId) {
    return null;
  }

  return collection
    .where({
      _id: questionEditId,
      isDelete: false,
    })
    .limit(1)
    .get()
    .then(({ data }: any) => {
      console.log(`getQuestionEdit succeed, id = ${questionEditId}`, data);
      return data[0];
    })
    .catch((e: any) => {
      console.error(`getQuestionEdit error, id = ${questionEditId}`, e);
      return null;
    });
}

/**
 * 修改
 * @param questionEditId
 * @param questionEdit
 */
export async function updateQuestionEdit(
  questionEditId: string,
  questionEdit: Partial<QuestionEditType>,
) {
  if (!questionEditId || !questionEdit) {
    return false;
  }

  return app
    .callFunction({
      name: 'updateQuestionEdit',
      data: {
        questionEditId,
        questionEdit,
      },
    })
    .then((res: any) => {
      console.log(`updateQuestionEdit succeed, id = ${questionEditId}`, res);
      return true;
    })
    .catch((e: any) => {
      console.error(`updateQuestionEdit error, id = ${questionEditId}`, e);
      return false;
    });
}

/**
 * 删除
 * @param questionEditId
 */
export function deleteQuestionEdit(questionEditId: string) {
  if (!questionEditId) {
    return false;
  }

  return app
    .callFunction({
      name: 'deleteQuestionEdit',
      data: {
        questionEditId,
      },
    })
    .then((res: any) => {
      console.log(`deleteQuestionEdit succeed, id = ${questionEditId}`, res);
      return res.result;
    })
    .catch((e: any) => {
      console.error(`deleteQuestionEdit error, id = ${questionEditId}`, e);
      return false;
    });
}
