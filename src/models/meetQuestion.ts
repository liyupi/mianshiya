import type { SimpleUser } from '@/models/user';

/**
 * 遇到题目类型
 */
export interface MeetQuestionType {
  _id: string;
  userId: string;
  questionId: string;
  tags: string[];
  _createTime: Date;
  _updateTime: Date;
}

/**
 * 遇到题目类型（封装用户信息）
 */
export interface MeetQuestionUserType extends MeetQuestionType {
  userInfo: SimpleUser[];
}
