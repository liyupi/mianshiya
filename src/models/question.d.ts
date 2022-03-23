/**
 * 题目类型
 */
export interface QuestionType {
  _id: string;
  name?: string;
  detail: string;
  favourNum: number;
  shareNum: number;
  viewNum: number;
  commentNum: number;
  meetNum: number;
  tags: string[];
  links: string[];
  userId: string;
  difficulty: number;
  type: number;
  reference?: string;
  priority?: number;
  referenceCommentId?: string;
  params?: {options: string[], answer: string | string[]};
  reviewTime?: Date;
  reviewerId?: string;
  reviewStatus: number;
  reviewMessage?: string;
  publishTime?: Date;
  _createTime: Date;
  _updateTime: Date;
}
