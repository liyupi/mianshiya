/**
 * 额外权限（版主）
 */
type ExtraAuthorityType = {
  // 可以管理的标签
  tags: string[];
};

/**
 * 当前登录用户信息
 */
export interface CurrentUser {
  _id: string;
  avatarUrl: string;
  nickName: string;
  gender: number;
  jobStatus: number;
  city: string;
  email: string;
  province: string;
  country: string;
  language: string;
  authority: string;
  extraAuthority: ExtraAuthorityType;
  favourQuestionIds: string[];
  thumbCommentIds: string[];
  interests: string[];
  score: number;
  profile: string;
  _createTime: Date;
  _updateTime: Date;
}

/**
 * 简略用户信息（脱敏）
 */
export interface SimpleUser {
  _id: string;
  avatarUrl: string;
  nickName: string;
  score: number;
  authority: string;
}

export interface RankUser extends SimpleUser {
  totalScore: number;
}
