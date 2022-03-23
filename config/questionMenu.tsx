import { MenuDataItem } from '@ant-design/pro-layout';
import {AimOutlined, BranchesOutlined, CodeOutlined, FieldBinaryOutlined, TagsOutlined} from '@ant-design/icons';

/**
 * 题目菜单项
 */
export default [
  {
    path: '/tag/language',
    name: '编程语言',
    icon: <CodeOutlined />,
    children: [
      {
        path: '/tag/java',
        name: 'java',
      },
      {
        path: '/tag/python',
        name: 'python',
      },
    ],
  },
  {
    path: '/tag/knowledge',
    name: '学科知识',
    icon: <FieldBinaryOutlined />,
    children: [
      {
        path: '/tag/数据结构',
        name: '数据结构',
      },
      {
        path: '/tag/算法',
        name: '算法',
      }
    ],
  },
  {
    path: '/tag/goal',
    name: '备战目标',
    icon: <AimOutlined />,
    children: [
      {
        path: '/tag/实习',
        name: '实习',
      },
      {
        path: '/tag/校招',
        name: '校招',
      },
    ],
  },
  {
    path: '/tag/domain',
    name: '领域方向',
    icon: <BranchesOutlined />,
    children: [
      {
        path: '/tag/前端',
        name: '前端',
      },
      {
        path: '/tag/后端',
        name: '后端',
      },
    ],
  },
  {
    path: '/tags',
    name: '标签大全',
    icon: <TagsOutlined />,
  },
  {
    path: '/tag/:key',
  },
] as MenuDataItem[];
