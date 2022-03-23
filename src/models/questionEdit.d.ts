import type {SimpleUser} from '@/models/user';

/**
 * 回答类型
 */
export interface QuestionEditType {
  _id: string;
  userId: string;
  questionId: string;
  description: string;
  reference: string;
  reviewTime?: Date;
  reviewerId?: string;
  reviewStatus: number;
  reviewMessage?: string;
  _createTime: Date;
  _updateTime: Date;
}

/**
 * 回答类型（封装用户、问题信息）
 */
export interface QuestionEditUserType extends QuestionEditType {
  userInfo: SimpleUser[];
}
