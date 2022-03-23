import { MESSAGE_STATUS_ENUM } from '@/constant/message';
import type { PageResult, PageSearchParams } from '@/services/common';
import type { MessageType } from '@/models/message';
import axios from 'axios';

export interface MessageSearchParams extends PageSearchParams {
  status?: number;
  type?: number;
}

/**
 * 获取当前用户收到的消息（支持分页）
 * @param params
 */
export async function searchMessages(
  params: MessageSearchParams,
): Promise<PageResult<MessageType>> {
  const defaultValue = {
    total: 0,
    data: [],
  };

  if (!params) {
    return defaultValue;
  }

  return axios
    .post('/message/search', params)
    .then((res: any) => {
      console.log('searchMessages succeed', res);
      return res;
    })
    .catch((e: any) => {
      console.error('searchMessages error', e);
      return defaultValue;
    });
}

/**
 * 删除消息
 * @param messageId
 */
export function deleteMessage(messageId: string) {
  if (!messageId) {
    return false;
  }

  return axios
    .post('/message/update', {
      messageId,
      isDelete: true,
    })
    .then((res: any) => {
      console.log('deleteMessage succeed', res);
      return res;
    })
    .catch((e: any) => {
      console.error('deleteMessage error', e);
      return false;
    });
}

/**
 * 删除全部消息
 */
export function deleteAllMessages() {
  return axios
    .post('/message/update/all', {
      isDelete: true,
    })
    .then((res: any) => {
      console.log('deleteAllMessages succeed', res);
      return res;
    })
    .catch((e: any) => {
      console.error('deleteAllMessages error', e);
      return false;
    });
}

/**
 * 阅读消息
 * @param messageId
 */
export function readMessage(messageId: string) {
  if (!messageId) {
    return false;
  }

  return axios
    .post('/message/update', {
      messageId,
      status: MESSAGE_STATUS_ENUM.HAS_READ,
    })
    .then((res: any) => {
      console.log('readMessage succeed', res);
      return res;
    })
    .catch((e: any) => {
      console.error('readMessage error', e);
      return false;
    });
}

/**
 * 阅读全部消息
 * @param messageId
 */
export function readAllMessages() {
  return axios
    .post('/message/update/all', {
      status: MESSAGE_STATUS_ENUM.HAS_READ,
    })
    .then((res: any) => {
      console.log('readAllMessages succeed', res);
      return res;
    })
    .catch((e: any) => {
      console.error('readAllMessages error', e);
      return false;
    });
}

/**
 * 获取当前用户收到的消息数
 * @param params
 */
export async function countMyMessages(params: MessageSearchParams) {
  if (!params) {
    return 0;
  }

  return axios
    .post('/message/count', params)
    .then((res: any) => {
      console.log('countMyMessages succeed', res);
      return res.data;
    })
    .catch((e: any) => {
      console.error('countMyMessages error', e);
      return 0;
    });
}
