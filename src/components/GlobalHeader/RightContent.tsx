import type { Settings as ProSettings } from '@ant-design/pro-layout';
import React, { useState } from 'react';
import { Button, Dropdown, Menu } from 'antd';
import AvatarDropdown from './AvatarDropdown';
import HeaderSearch from '@/components/HeaderSearch';
import { Link, useLocation } from 'umi';
import { isMobile } from '@/utils/utils';
import styles from './index.less';

type GlobalHeaderRightProps = Partial<ProSettings>;

/**
 * 全局菜单右侧
 * @constructor
 */
const GlobalHeaderRight: React.FC<GlobalHeaderRightProps> = () => {
  const location = useLocation();
  // @ts-ignore
  const [searchText, setSearchText] = useState<string>(location.query.q);

  const menu = (
    <Menu>
      <Menu.Item key="1">
        <Link to="/addQuestion" target="_blank">
          上传题目
        </Link>
      </Menu.Item>
      <Menu.Item key="2">
        <Link to="/addPaper" target="_blank">
          创建试卷
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.right}>
      <div style={{ width: '40vw' }}>
        <HeaderSearch
          value={searchText}
          placeholder="全站搜索面试题目"
          onChange={(value) => setSearchText(value)}
        />
      </div>
      {!isMobile() && (
        <Dropdown overlay={menu} placement="bottomCenter">
          <Link to="/addQuestion" target="_blank">
            <Button
              type="primary"
              className="uploadDropdown"
              style={{ marginLeft: 24, marginRight: 8 }}
            >
              上传
            </Button>
          </Link>
        </Dropdown>
      )}
      <AvatarDropdown />
    </div>
  );
};

export default GlobalHeaderRight;
