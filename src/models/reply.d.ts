import type { SimpleUser } from '@/models/user';

/**
 * 回复类型
 */
export interface ReplyType {
  _id: string;
  content: string;
  questionId: string;
  replyId: string;
  userId: string;
  commentId: string;
  replyUserId: string;
  _createTime: Date;
  _updateTime: Date;
}

/**
 * 回复类型（封装用户信息）
 */
export interface ReplyUserType extends ReplyType {
  userInfo: SimpleUser[];
  replyUserInfo: SimpleUser[];
  isThumb?: boolean;
}
