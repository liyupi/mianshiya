import type { MeetQuestionType, MeetQuestionUserType } from '@/models/meetQuestion';
import type { PageResult, PageSearchParams } from './common';
import axios from 'axios';

export interface MeetQuestionSearchParams extends PageSearchParams {
  questionId?: string;
  userId?: string;
}

/**
 * 新增
 * @param params
 */
export function addMeetQuestion(params: Partial<MeetQuestionType>) {
  const { tags, questionId } = params;
  if (!questionId || !tags || tags.length < 1) {
    return false;
  }

  return axios
    .post('/meet-question/add', params)
    .then((res: any) => {
      console.log(`addMeetQuestion succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`addMeetQuestion error`, e);
      return false;
    });
}

/**
 * 分页搜索
 * @param params
 */
export async function searchMeetQuestions(
  params: MeetQuestionSearchParams,
): Promise<PageResult<MeetQuestionUserType>> {
  return axios
    .post('/meet-question/search', params)
    .then((res: any) => {
      console.log(`searchMeetQuestions succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error('searchMeetQuestions error', e);
      return {
        data: [],
        total: 0,
      };
    });
}

/**
 * 修改
 * @param meetQuestionId
 * @param meetQuestion
 */
export async function updateMeetQuestion(
  meetQuestionId: string,
  meetQuestion: Partial<MeetQuestionType>,
) {
  if (!meetQuestionId || !meetQuestion) {
    return false;
  }

  return axios
    .post('/meet-question/update', {
      meetQuestionId,
      meetQuestion,
    })
    .then((res: any) => {
      console.log(`updateMeetQuestion succeed, id = ${meetQuestionId}`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`updateMeetQuestion error, id = ${meetQuestionId}`, e);
      return false;
    });
}

/**
 * 删除
 * @param meetQuestionId
 */
export function deleteMeetQuestion(meetQuestionId: string) {
  if (!meetQuestionId) {
    return false;
  }

  return axios
    .post('/meet-question/delete', {
      meetQuestionId,
    })
    .then((res: any) => {
      console.log(`deleteMeetQuestion succeed, id = ${meetQuestionId}`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`deleteMeetQuestion error, id = ${meetQuestionId}`, e);
      return false;
    });
}
