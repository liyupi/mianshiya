import type { QuestionType } from '@/models/question';
import reviewStatusEnum, { reviewStatusInfoMap } from '@/constant/reviewStatusEnum';
import type { PageResult, PageSearchParams } from '@/services/common';
import type { CurrentUser } from '@/models/user';
import axios from 'axios';

export interface QuestionSearchParams extends PageSearchParams {
  _ids?: string[];
  notId?: string;
  name?: string;
  tags?: string[]; // 须包含全部标签才查出
  orTags?: string[]; // 包含任一标签就可查出
  priority?: number;
  reviewStatus?: number;
  userId?: string;
  link?: string;
  type?: number;
  difficulty?: number;
  hasReference?: boolean;
}

/**
 * 添加题目
 * @param params
 * @return 题目 id
 */
export function addQuestion(params: QuestionType) {
  if (!params.userId || !params.tags || params.tags.length < 1) {
    return false;
  }

  return axios
    .post('/question/add', params)
    .then((res: any) => {
      console.log(`addQuestion succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`addQuestion error`, e);
      return false;
    });
}

/**
 * 从 ES 搜索题目
 * @param params
 */
export async function searchQuestions(
  params: QuestionSearchParams,
): Promise<PageResult<QuestionType>> {
  const condition = { isDelete: false, ...params };
  if (!condition.orderKey) {
    condition.orderKey = '_score';
  }
  if (!condition.order) {
    condition.order = 'desc';
  }
  console.log(condition);
  return axios
    .post('/question/search', condition)
    .then((res: any) => {
      console.log(`searchQuestions s`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`searchQuestions e`, e);
      return false;
    });
}

/**
 * 分页搜索题目（直接调云数据库）
 * @param params
 */
export async function searchQuestionsByPage(
  params: QuestionSearchParams,
): Promise<PageResult<QuestionType>> {
  const { pageSize = 12, pageNum = 1 } = params;
  const emptyResult = {
    data: [],
    total: 0,
  };
  if (pageSize < 1 || pageNum < 1) {
    return emptyResult;
  }
  return axios
    .post('/question/search/origin', params)
    .then((res: any) => {
      console.log('searchQuestionsByPage succeed', res);
      return res;
    })
    .catch((e: any) => {
      console.error('searchQuestionsByPage error', e);
      return emptyResult;
    });
}

/**
 * 分页获取用户收藏的题目列表
 * @param currentUser
 * @param params
 */
export async function searchUserFavourQuestions(
  currentUser: CurrentUser,
  params: QuestionSearchParams,
): Promise<PageResult<QuestionType>> {
  const defaultValue = {
    data: [],
    total: 0,
  };
  if (!currentUser) {
    return defaultValue;
  }
  if (!currentUser?.favourQuestionIds || currentUser.favourQuestionIds.length === 0) {
    return defaultValue;
  }

  params.userId = undefined;
  params._ids = currentUser.favourQuestionIds;
  params.reviewStatus = reviewStatusEnum.PASS;
  return searchQuestionsByPage(params);
}

/**
 * 增加分享数
 * @param questionId
 */
export function shareQuestion(questionId: string) {
  if (!questionId) {
    return false;
  }

  return axios
    .post('/question/share', {
      questionId,
    })
    .then((res: any) => {
      console.log('shareQuestion succeed', res);
      return res;
    })
    .catch((e: any) => {
      console.error('shareQuestion error', e);
    });
}

/**
 * 删除题目
 * @param questionId
 */
export function deleteQuestion(questionId: string) {
  if (!questionId) {
    return false;
  }

  return axios
    .post('/question/delete', {
      questionId,
    })
    .then((res: any) => {
      console.log(`deleteQuestion succeed, id = ${questionId}`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`deleteQuestion error, id = ${questionId}`, e);
      return false;
    });
}

/**
 * 收藏（取消收藏）
 * @param questionId
 * @return 收藏数变化
 */
export function favourQuestion(questionId: string) {
  if (!questionId) {
    return 0;
  }

  return axios
    .post('/question/favour', {
      questionId,
    })
    .then((res: any) => {
      console.log('favourQuestion succeed', res);
      return res.data;
    })
    .catch((e: any) => {
      console.error('favourQuestion error', e);
      return 0;
    });
}

/**
 * 根据用户兴趣获取推荐题目
 * @param size
 */
export function listRecommendQuestions(size: number = 12) {
  return axios
    .post('/question/list/recommend', {
      size,
    })
    .then((res: any) => {
      console.log('listRecommendQuestions succeed', res);
      return res;
    })
    .catch((e: any) => {
      console.error('listRecommendQuestions error', e);
      return [];
    });
}

/**
 * 修改题目
 * @param questionId
 * @param question
 */
export async function updateQuestion(questionId: string, question: Partial<QuestionType>) {
  if (!questionId || !question) {
    return false;
  }

  return axios
    .post('/question/update', {
      questionId,
      question,
    })
    .then((res: any) => {
      console.log(`updateQuestion succeed, id = ${questionId}`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`updateQuestion error, id = ${questionId}`, e);
      return false;
    });
}

/**
 * 根据 id 获取题目
 * @param questionId
 */
export function getQuestion(questionId: string) {
  if (!questionId) {
    return null;
  }

  return axios
    .post('/question/get', {
      id: questionId,
    })
    .then((res: any) => {
      console.log('getQuestion succeed', res);
      return res;
    })
    .catch((e: any) => {
      console.error(`getQuestion error, id = ${questionId}`, e);
      return null;
    });
}

/**
 * 审核题目
 * @param questionId
 * @param score
 * @param reviewStatus
 * @param reviewMessage
 */
export async function reviewQuestion(
  questionId: string,
  score: number,
  reviewStatus: number,
  reviewMessage?: string,
) {
  if (!questionId || !reviewStatusInfoMap[reviewStatus]) {
    return false;
  }

  return axios
    .post('/question/review', {
      questionId,
      score,
      reviewStatus,
      reviewMessage,
    })
    .then((res: any) => {
      console.log(`reviewQuestion succeed, id = ${questionId}`);
      return res;
    })
    .catch((e: any) => {
      console.error(`reviewQuestion error, id = ${questionId}`, e);
      return false;
    });
}

/**
 * 浏览题目
 * @param questionId
 */
export async function viewQuestion(questionId: string) {
  if (!questionId) {
    return false;
  }

  return axios
    .post('/question/view', {
      questionId,
    })
    .then((res: any) => {
      console.log(`viewQuestion succeed, id = ${questionId}`, res);
      return true;
    })
    .catch((e: any) => {
      console.error(`viewQuestion error, id = ${questionId}`, e);
      return false;
    });
}
