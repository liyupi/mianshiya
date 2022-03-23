/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
import type { CurrentUser } from '@/models/user';

export interface AccessType {
  canAdmin: boolean; // 是否为管理员
  canUser: boolean; // 是否已登录
  isBan: boolean; // 是否被封号
}

export default function access(initialState: { currentUser?: CurrentUser | undefined }): AccessType {
  const { currentUser } = initialState || {};
  return {
    canAdmin: currentUser?.authority === 'admin',
    canUser: !!currentUser,
    isBan: currentUser?.authority === 'ban',
  };
}
