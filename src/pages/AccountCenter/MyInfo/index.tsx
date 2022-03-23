import { Avatar, Button, Card, Descriptions, message, Space, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import type { CurrentUser } from '@/models/user';
import { EditOutlined } from '@ant-design/icons/lib';
import { formatDateTimeStr } from '@/utils/utils';
import MyInfoUpdateModal from './MyInfoUpdateModal';
import { useModel } from '@@/plugin-model/useModel';
import { USER_GENDER_ENUM, USER_JOB_STATUS_ENUM } from '@/constant/user';
import { DEFAULT_AVATAR, DEFAULT_USER_NAME } from '@/constant';
import { getLevel, isAdminUser } from '@/utils/businessUtils';
import { useParams } from 'umi';
import { getUserSimpleInfo } from '@/services/user';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import styles from './style.less';

const { Title } = Typography;

/**
 * 个人信息页
 *
 * @author liyupi
 */
export const MyInfo: React.FC = () => {
  const [refresh, setRefresh] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const [user, setUser] = useState<CurrentUser>({} as CurrentUser);
  const [loading, setLoading] = useState<boolean>(false);
  const { id } = useParams<{ id?: string }>();
  const userId = id;

  const loadData = async () => {
    if (!userId) {
      setUser(currentUser);
      return;
    }
    setLoading(true);
    const res = await getUserSimpleInfo(userId);
    if (res) {
      setUser(res);
    } else {
      message.error('加载失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const interestsTagView =
    user && user.interests && user.interests.length > 0 ? (
      user.interests.map((key) => {
        return (
          <Tag key={key} style={{ cursor: 'pointer' }}>
            {key}
          </Tag>
        );
      })
    ) : (
      <div style={{ color: '#999' }}>暂无，设置后推荐更精准哦</div>
    );

  const userLevel = getLevel(user?.score);

  return (
    <HelmetProvider>
      <Helmet>{user.nickName && <title>{user.nickName}的主页 - 面试鸭</title>}</Helmet>
      <div>
        <Card loading={loading}>
          <Card.Meta
            className={styles.cardMeta}
            title={
              <Space align="center">
                <Title level={4} style={{ marginBottom: 0 }}>
                  {user.nickName ? user.nickName : DEFAULT_USER_NAME}
                </Title>
                <Tag color={userLevel.color} style={{ marginRight: 0, marginBottom: 3 }}>
                  {userLevel.name}
                </Tag>
                {isAdminUser(user) && (
                  <Tag color="red" style={{ marginBottom: 3 }}>
                    管理员
                  </Tag>
                )}
              </Space>
            }
            description={user.profile || '暂无个人简介'}
            avatar={
              <Avatar
                src={user.avatarUrl || DEFAULT_AVATAR}
                size={96}
                // @ts-ignore
                onClick={() => {
                  if (user._id === currentUser._id) {
                    setModalVisible(true);
                  }
                }}
              />
            }
          />
        </Card>
        <div style={{ marginTop: 16 }} />
        <Card
          title="信息"
          extra={
            user._id === currentUser._id && (
              <Button type="link" icon={<EditOutlined />} onClick={() => setModalVisible(true)}>
                编辑
              </Button>
            )
          }
        >
          <Descriptions column={1} labelStyle={{ width: 100, marginBottom: 8 }} colon={false}>
            <Descriptions.Item label="积分">{user.score}</Descriptions.Item>
            <Descriptions.Item label="性别">
              {USER_GENDER_ENUM[user.gender] || '暂无'}
            </Descriptions.Item>
            <Descriptions.Item label="简介">{user.profile || '暂无'}</Descriptions.Item>
            <Descriptions.Item label="兴趣">{interestsTagView}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {USER_JOB_STATUS_ENUM[user.jobStatus] || '暂无'}
            </Descriptions.Item>
            <Descriptions.Item label="邮箱">{user.email || '暂无'}</Descriptions.Item>
            <Descriptions.Item label="注册时间">
              {formatDateTimeStr(user._createTime)}
            </Descriptions.Item>
          </Descriptions>
        </Card>
        <MyInfoUpdateModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          reload={() => setRefresh(!refresh)}
        />
      </div>
    </HelmetProvider>
  );
};

export default MyInfo;
