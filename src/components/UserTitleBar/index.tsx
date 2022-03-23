import React from 'react';
import { Space, Tag } from 'antd';
import type { SimpleUser } from '@/models/user';
import UserInfoCardPopover from '@/components/UserInfoCardPopover';
import { getLevel, isAdminUser } from '@/utils/businessUtils';
import {DEFAULT_USER_NAME} from "@/constant";

interface UserTitleBarProps {
  user?: SimpleUser;
}

/**
 * 用户标题栏
 * @param props
 * @constructor
 * @author yupi
 */
const UserTitleBar: React.FC<UserTitleBarProps> = (props) => {
  const { user } = props;

  if (!user) {
    return <></>;
  }

  const userLevel = getLevel(user?.score);

  return (
    user && (
      <UserInfoCardPopover user={user}>
        <Space>
          <span>{user.nickName ?? DEFAULT_USER_NAME}</span>
          <Tag color={userLevel.color} style={{ marginRight: 0 }}>{userLevel.name}</Tag>
          {isAdminUser(user) && <Tag color="red">管理员</Tag>}
        </Space>
      </UserInfoCardPopover>
    )
  );
};

export default UserTitleBar;
