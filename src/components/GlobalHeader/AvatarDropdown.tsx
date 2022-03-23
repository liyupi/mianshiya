import React, { useEffect, useState } from 'react';
import { BellOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Dropdown, Menu, message, Tooltip } from 'antd';
import type { ConnectProps } from 'umi';
import { history, Link } from 'umi';
import type { CurrentUser } from '@/models/user';
import classNames from 'classnames';
import { stringify } from 'querystring';
import { logout } from '@/services/login';
import { useModel } from '@@/plugin-model/useModel';
import { MESSAGE_STATUS_ENUM } from '@/constant/message';
import { countMyMessages } from '@/services/message';
import { DEFAULT_AVATAR } from '@/constant';
import styles from './index.less';

type GlobalHeaderRightProps = Partial<ConnectProps>;

/**
 * 头像下拉菜单
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const AvatarDropdown: React.FC<GlobalHeaderRightProps> = (props) => {
  const { location } = props;
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const [unreadMessageNum, setUnreadMessageNum] = useState<number>(0);

  const loadData = async () => {
    const total = await countMyMessages({ status: MESSAGE_STATUS_ENUM.UNREAD });
    setUnreadMessageNum(total);
  };

  useEffect(() => {
    if (currentUser._id) {
      loadData();
    }
  }, [currentUser]);

  const onMenuClick = async (event: { key: React.Key; keyPath: React.Key[] }) => {
    const { key } = event;

    const keyPathMap = {
      home: '/account/info',
      message: '/account/message',
    };

    if (key === 'logout') {
      const res = await logout();
      if (res) {
        message.success('已退出登录');
        await setInitialState({ ...initialState, currentUser: undefined });
        history.replace({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        });
      } else {
        message.error('操作失败');
      }
      return;
    }

    const path = keyPathMap[key];
    if (location?.pathname !== path) {
      history.push(path);
    }
  };

  /**
   * 下拉菜单
   */
  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      <Menu.Item key="home">
        <UserOutlined />
        个人中心
      </Menu.Item>
      <Menu.Item key="message">
        <BellOutlined />
        我的消息
      </Menu.Item>
      <Menu.Item key="logout">
        <span style={{ color: 'red' }}>
          <LogoutOutlined />
          退出登录
        </span>
      </Menu.Item>
    </Menu>
  );

  return currentUser?._id ? (
    <Dropdown overlayClassName={classNames(styles.container)} overlay={menuHeaderDropdown}>
      <div className={`${styles.action} ${styles.account}`}>
        <Badge count={unreadMessageNum}>
          <Avatar className={styles.avatar} src={currentUser.avatarUrl || DEFAULT_AVATAR} />
        </Badge>
      </div>
    </Dropdown>
  ) : (
    <Link to="/user/login">
      <span className={`${styles.action} ${styles.account}`}>
        <Tooltip title="登录享用更多功能" placement="bottomLeft" defaultVisible>
          <Avatar icon={<UserOutlined />} />
        </Tooltip>
      </span>
    </Link>
  );
};

export default AvatarDropdown;
