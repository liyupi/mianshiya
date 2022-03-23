import type { CurrentUser } from '@/models/user';
import type { PageSearchParams } from '@/services/common';
import axios from 'axios';

export interface UserSearchParams extends PageSearchParams {
  authority?: string;
}

/**
 * 查询当前用户
 */
export function getCurrentUser() {
  return axios
    .post('/user/current')
    .then((res: any) => {
      console.log('getCurrentUser succeed', res);
      return res.data;
    })
    .catch((e: any) => {
      console.error('getCurrentUser error', e);
      return undefined;
    });
}

/**
 * 查询用户简略信息
 * @param userId
 */
export async function getUserSimpleInfo(userId: string) {
  if (!userId) {
    return null;
  }

  return axios
    .post('/user/simple', {
      userId,
    })
    .then((res: any) => {
      console.log(`getUserSimpleInfo succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error('getUserSimpleInfo error', e);
      return null;
    });
}

/**
 * 更新用户
 * @param user
 */
export function updateUser(user: Partial<CurrentUser>) {
  if (!user) {
    return false;
  }

  return axios
    .post('/user/update', {
      user,
    })
    .then((res: any) => {
      console.log(`updateUser succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`updateUser error`, e);
      return false;
    });
}

/**
 * 查询用户积分总排行
 * @param pageSize
 * @param pageNum
 */
export function listUserTotalRank(pageSize: number = 10, pageNum: number = 1) {
  return axios
    .post('/user/list/total-rank', {
      pageSize,
      pageNum,
    })
    .then((res: any) => {
      console.log(`listUserTotalRank succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error('listUserTotalRank error', e);
      return [];
    });
}

/**
 * 查询指定用户的积分排行
 * @param userId
 */
export function getUserRank(userId: string) {
  if (!userId) {
    return -1;
  }
  return axios
    .post('/user/get/rank', {
      userId,
    })
    .then((res: any) => {
      console.log(`getUserRank succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error('getUserRank error', e);
      return -1;
    });
}

/**
 * 查询用户周期积分排行
 * @param cycle
 * @param countDate
 * @param pageSize
 */
export async function listUserCycleRank(
  cycle: number = 0,
  countDate: string,
  pageSize: number = 10,
) {
  if (cycle < 0 || cycle > 1 || !countDate) {
    return [];
  }

  return axios
    .post('/user/list/rank', {
      cycle,
      countDate,
      pageSize,
    })
    .then((res) => {
      console.log(`listUserCycleRank succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error('listUserCycleRank error', e);
      return [];
    });
}

/**
 * 封号 / 解封用户
 * @param userId
 */
export function banUser(userId: string) {
  if (!userId) {
    return false;
  }
  return axios
    .post('/user/ban', {
      userId,
    })
    .then((res: any) => {
      console.log(`banUser succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error('banUser error', e);
      return false;
    });
}

/**
 * 查询用户（分页，仅管理员可用）
 * @param params
 */
export function searchUsers(params: UserSearchParams) {
  const emptyResult = {
    data: [],
    total: 0,
  };
  return axios
    .post('/user/search', params)
    .then((res: any) => {
      console.log(`searchUsers succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error('searchUsers error', e);
      return emptyResult;
    });
}
