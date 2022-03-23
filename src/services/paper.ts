import type { PageResult, PageSearchParams } from '@/services/common';
import axios from 'axios';

export interface PaperSearchParams extends PageSearchParams {
  _ids?: string[];
  notId?: string;
  name?: string;
  tags?: string[];
  priority?: number;
  ownership?: number;
  userId?: string;
  difficulty?: number;
}

/**
 * 添加
 * @param params
 * @return id
 */
export function addPaper(params: PaperType) {
  if (!params.userId || !params.tags || params.tags.length < 1) {
    return false;
  }

  return axios
    .post('/paper/add', params)
    .then((res: any) => {
      console.log(`addPaper succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`addPaper error`, e);
      return false;
    });
}

/**
 * 修改
 * @param paperId
 * @param paper
 */
export async function updatePaper(paperId: string, paper: Partial<PaperType>) {
  if (!paperId || !paper) {
    return false;
  }

  if (paper.tags !== undefined && (paper.tags?.length < 1)) {
    return false;
  }

  return axios
    .post('/paper/update', {
      paperId,
      paper,
    })
    .then((res: any) => {
      console.log(`updatePaper succeed, id = ${paperId}`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`updatePaper error, id = ${paperId}`, e);
      return false;
    });
}

/**
 * 删除
 * @param paperId
 */
export function deletePaper(paperId: string) {
  if (!paperId) {
    return false;
  }

  return axios
    .post('/paper/delete', {
      paperId,
    })
    .then((res: any) => {
      console.log(`deletePaper succeed, id = ${paperId}`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`deletePaper error, id = ${paperId}`, e);
      return false;
    });
}

/**
 * 搜索试卷
 * @param params
 */
export async function searchPapers(params: PaperSearchParams): Promise<PageResult<PaperType>> {
  const condition = { isDelete: false, ...params };
  if (!condition.orderKey) {
    condition.orderKey = 'publishTime';
  }
  if (!condition.order) {
    condition.order = 'desc';
  }
  console.log(condition);
  return axios
    .post('/paper/search', condition)
    .then((res: any) => {
      console.log(`searchPapers s`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`searchPapers e`, e);
      return false;
    });
}

/**
 * 根据 id 获取试卷
 * @param paperId
 */
export async function getPaper(paperId: string) {
  if (!paperId) {
    return null;
  }
  return await axios
    .post('/paper/get', {
      id: paperId,
    })
    .then((res: any) => {
      console.log(`getPaper succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`getPaper error, id = ${paperId}`, e);
      return null;
    });
}

/**
 * 浏览试卷
 * @param paperId
 */
export async function viewPaper(paperId: string) {
  if (!paperId) {
    return false;
  }

  return axios
    .post('/paper/view', {
      paperId,
    })
    .then((res: any) => {
      console.log(`viewQuestion succeed, id = ${paperId}`, res);
      return true;
    })
    .catch((e: any) => {
      console.error(`viewQuestion error, id = ${paperId}`, e);
      return false;
    });
}
