import { MenuDataItem } from '@ant-design/pro-layout';
import {
  BellOutlined,
  FileOutlined,
  FileTextOutlined,
  HomeOutlined,
  MessageOutlined,
  SafetyOutlined,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import questionMenu from './questionMenu';

/**
 * 顶部菜单项
 */
export default [
  {
    path: '/',
    name: '首页',
    icon: <HomeOutlined />,
  },
  {
    path: '/questions',
    name: '题目',
    icon: <FileOutlined />,
    children: questionMenu,
  },
  {
    path: '/papers',
    name: '试卷',
    icon: <FileTextOutlined />,
  },
  {
    path: '/account',
    name: '个人',
    icon: <UserOutlined />,
    access: 'canUser',
    children: [
      {
        name: '个人资料',
        path: '/account/info',
        icon: <UserOutlined />,
      },
      {
        name: '我的收藏',
        path: '/account/favour',
        icon: <StarOutlined />,
      },
      {
        name: '我的题目',
        path: '/account/question',
        icon: <FileOutlined />,
      },
      {
        name: '我的回答',
        path: '/account/comment',
        icon: <MessageOutlined />,
      },
      {
        name: '我的试卷',
        path: '/account/paper',
        icon: <FileTextOutlined />,
      },
      {
        name: '消息通知',
        path: '/account/message',
        icon: <BellOutlined />,
      },
    ],
  },
  {
    path: '/op',
    name: '运营',
    icon: <SafetyOutlined />,
    access: 'canAdmin',
  },
] as MenuDataItem[];
