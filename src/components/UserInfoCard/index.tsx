import React, { useState } from 'react';
import { Button, Card, message } from 'antd';
import type { SimpleUser } from '@/models/user';
import { banUser } from '@/services/user';
import { useAccess } from '@@/plugin-access/access';
import './style.less';

interface UserInfoCardProps {
  user: SimpleUser;
}

/**
 * 用户卡片
 * @param props
 * @constructor
 */
const UserInfoCard: React.FC<UserInfoCardProps> = (props) => {
  const { user } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const access = useAccess();

  /**
   * 封号
   */
  const doBanUser = async () => {
    if (!user?._id) {
      return;
    }
    setLoading(true);
    const res = await banUser(user._id);
    if (res) {
      message.success('操作成功');
    } else {
      message.error('操作失败');
    }
    setLoading(false);
  };

  return (
    <div className="user-info-card">
      <Card loading={!user} bordered={false}>
        {access.canAdmin &&
          (user.authority?.includes('ban') ? (
            <Button type="primary" loading={loading} onClick={() => doBanUser()}>
              解除封号
            </Button>
          ) : (
            <Button danger type="primary" loading={loading} onClick={() => doBanUser()}>
              封号
            </Button>
          ))}
      </Card>
    </div>
  );
};

export default UserInfoCard;
