import type { BasicLayoutProps as ProLayoutProps, MenuDataItem } from '@ant-design/pro-layout';
import ProLayout from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import { history, Link, useAccess, useLocation } from 'umi';
import RightContent from '@/components/GlobalHeader/RightContent';
import GlobalFooter from '@/components/GlobalFooter';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import defaultSettings from '../../config/defaultSettings';
import menu from '../../config/headerMenu';
import { DYNAMIC_CAPTCHA, SLOGAN } from '@/constant';
import { useModel } from '@@/plugin-model/useModel';
import type { AccessType } from '@/access';
import './BasicLayout.less';
import { Inspector } from 'react-dev-inspector';
import AffixQuestionDrawer from '@/components/AffixQuestionDrawer';
import { BackTop, message, Popover } from 'antd';
import { login } from '@/services/login';
import { isMobile } from '@/utils/utils';
import save_site from '@/assets/save_site.gif';
import SYSTEM_LOGO from '@/assets/logo.png';
const isDev = process.env.NODE_ENV === 'development';
const InspectorWrapper = isDev ? Inspector : React.Fragment;

export interface BasicLayoutProps extends ProLayoutProps {
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
}

/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList: MenuDataItem[], access: AccessType): MenuDataItem[] => {
  return menuList.filter((menuItem) => {
    return !menuItem.access || access[menuItem.access];
  });
};

/**
 * 基础布局
 * @param props
 * @constructor
 * @author liyupi
 */
const BasicLayout: React.FC<BasicLayoutProps> = (props) => {
  const { children } = props;

  const { fetchTagsMap } = useModel('tag');
  const access = useAccess();
  const location = useLocation();
  const { initialState, setInitialState } = useModel('@@initialState');

  /**
   * 自动登录
   */
  const autoLogin = async () => {
    // @ts-ignore
    const captcha = location?.query[DYNAMIC_CAPTCHA];
    if (captcha) {
      const currentUser = await login({
        captcha,
        type: 'auto',
      });
      if (currentUser) {
        message.success('登录成功');
        await setInitialState({ ...initialState, currentUser });
      } else {
        message.error('自动登录失败，请重试或联系微信 code_nav');
      }
    }
  };

  useEffect(() => {
    autoLogin();
    fetchTagsMap();
  }, []);

  // 被永久封号（不显示封号提示，制造错觉）
  if (access.isBan) {
    return <></>;
  }

  return (
    <HelmetProvider>
      <InspectorWrapper keys={['control', 'shift', 'command', 'c']} disableLaunchEditor={false}>
        <Helmet>
          <title>面试鸭 - {SLOGAN}</title>
        </Helmet>
        <ProLayout
          className="basic-layout"
          logo={
            <>
              <Popover
                placement="topRight"
                content={
                  <div>
                    <img width={200} src={save_site} alt="" />
                  </div>
                }
                title="拖拽Logo到收藏栏，刷题更方便！"
              >
                <span>
                  <a href="https://www.mianshiya.com/" title="面试鸭">
                    <img src={SYSTEM_LOGO} alt="面试鸭" title="面试鸭" />
                  </a>
                </span>
              </Popover>
            </>
          }
          {...props}
          {...defaultSettings}
          headerTheme="light"
          layout="mix"
          splitMenus
          contentStyle={
            isMobile()
              ? {
                  marginLeft: 0,
                  marginRight: 0,
                }
              : {}
          }
          onMenuHeaderClick={() => history.push('/')}
          menuItemRender={(menuItemProps, defaultDom) => {
            if (menuItemProps.isUrl || !menuItemProps.path) {
              return defaultDom;
            }
            return <Link to={menuItemProps.path}>{defaultDom}</Link>;
          }}
          footerRender={() => <GlobalFooter />}
          menuDataRender={() => menuDataRender(menu, access)}
          rightContentRender={() => <RightContent />}
        >
          {children}
          <BackTop />
        </ProLayout>
        {history.location.pathname === '/addPaper' ? null : <AffixQuestionDrawer />}
      </InspectorWrapper>
    </HelmetProvider>
  );
};

export default BasicLayout;
