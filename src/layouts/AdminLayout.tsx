import type { BasicLayoutProps as ProLayoutProps } from '@ant-design/pro-layout';
import ProLayout from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import { history, Link, useAccess } from 'umi';
import RightContent from '@/components/GlobalHeader/RightContent';
import GlobalFooter from '@/components/GlobalFooter';
import defaultSettings from '../../config/defaultSettings';
import { NoAuth } from '@/components/NoAuth';
import { SYSTEM_LOGO } from '@/constant';
import { Access } from '@@/plugin-access/access';
import { useModel } from '@@/plugin-model/useModel';
import { Inspector } from 'react-dev-inspector';
import { CurrentUser } from '@/models/user';
import { BackTop } from 'antd';

const isDev = process.env.NODE_ENV === 'development';
const InspectorWrapper = isDev ? Inspector : React.Fragment;

export interface AdminLayoutProps extends ProLayoutProps {
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
}

/**
 * 管理员布局
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const AdminLayout: React.FC<AdminLayoutProps> = (props) => {
  const { children } = props;

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const access = useAccess();

  const { fetchTagsMap } = useModel('tag');
  useEffect(() => {
    fetchTagsMap();
  }, [fetchTagsMap]);

  // 被永久封号（不显示封号提示，制造错觉）
  if (access.isBan) {
    return <></>;
  }

  let canVisit = false;
  // 管理员可访问
  if (access.canAdmin) {
    canVisit = true;
  }
  // 有对应标签权限也可访问
  if (currentUser.extraAuthority?.tags && currentUser.extraAuthority.tags.length > 0) {
    canVisit = true;
  }

  return (
    // https://github.com/zthxxx/react-dev-inspector
    <InspectorWrapper keys={['control', 'shift', 'command', 'c']} disableLaunchEditor={false}>
      <ProLayout
        logo={SYSTEM_LOGO}
        {...props}
        {...defaultSettings}
        title="面试鸭后台"
        onMenuHeaderClick={() => history.push('/')}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (menuItemProps.isUrl || !menuItemProps.path) {
            return defaultDom;
          }
          return <Link to={menuItemProps.path}>{defaultDom}</Link>;
        }}
        footerRender={() => <GlobalFooter />}
        rightContentRender={() => <RightContent />}
      >
        <Access accessible={canVisit} fallback={<NoAuth />}>
          {children}
          <BackTop />
        </Access>
      </ProLayout>
    </InspectorWrapper>
  );
};

export default AdminLayout;
