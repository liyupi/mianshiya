import type { SimpleUser } from '@/models/user';
import type { QuestionType } from '@/models/question';
import type { ReplyUserType } from '@/models/reply';

/**
 * 回答类型
 */
export interface CommentType {
  _id: string;
  userId: string;
  questionId: string;
  content: string;
  thumbNum: number;
  priority: number;
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
export interface CommentUserType extends CommentType {
  userInfo: SimpleUser[];
  question?: QuestionType[];
  replyList?: ReplyUserType[];
}
