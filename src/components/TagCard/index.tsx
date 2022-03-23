import { Avatar, Button, Card, message, Space, Typography } from 'antd';
import React from 'react';
import { Link } from 'umi';
import { SYSTEM_LOGO } from '@/constant';
import styles from './index.less';
import type { TagType } from '@/models/tag';
import { useModel } from '@@/plugin-model/useModel';
import type { CurrentUser } from '@/models/user';
import { updateUser } from '@/services/user';
import { toLoginPage } from '@/utils/businessUtils';

interface TagCardProps {
  tag: TagType;
  loading?: boolean;
}

/**
 * 标签卡片
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const TagCard: React.FC<TagCardProps> = (props) => {
  const { tag, loading } = props;
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};

  const updateUserInterests = async () => {
    if (!currentUser._id) {
      toLoginPage();
      message.warning('请先登录');
      return;
    }
    const index = currentUser.interests.indexOf(tag);
    // 取消关注
    if (index >= 0) {
      currentUser.interests.splice(index, 1);
    } else {
      // 关注
      currentUser.interests.push(tag);
    }

    const res = await updateUser({
      interests: currentUser.interests,
    });
    if (res.data) {
      const newCurrentUser = {
        ...currentUser,
      };
      setInitialState({ ...initialState, currentUser: newCurrentUser });
    } else {
      message.error('操作失败，' + res.message ?? '请重试');
    }
  };

  return (
    <Link to={`/tag/${tag}`} target="_blank">
      <Card className={styles.topicCard} hoverable loading={loading}>
        <Space direction="vertical" size={8}>
          <Avatar shape="square" size={48} src={SYSTEM_LOGO} alt={tag} />
          <Typography.Title level={5}>{tag}</Typography.Title>
          <Button
            type={currentUser.interests?.includes(tag) ? 'primary' : 'default'}
            onClick={(e) => {
              updateUserInterests();
              e.preventDefault();
            }}
          >
            {currentUser.interests?.includes(tag) && '已'}关注
          </Button>
        </Space>
      </Card>
    </Link>
  );
};

export default TagCard;
