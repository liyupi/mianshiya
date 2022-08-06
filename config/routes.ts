export default [
  {
    path: '/',
    layout: false,
    routes: [
      {
        path: '/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            name: '登录',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
      {
        path: '/op',
        component: '../layouts/AdminLayout',
        access: 'canAdmin',
        routes: [
          {
            path: '/op',
            redirect: 'question',
          },
          {
            name: '题目管理',
            path: './question',
            component: './OpCenter/ManageQuestion',
          },
          {
            name: '试卷管理',
            path: './paper',
            component: './OpCenter/ManagePaper',
          },
          {
            name: '回答管理',
            path: './comment',
            component: './OpCenter/ManageComment',
          },
          {
            name: '回复管理',
            path: './reply',
            component: './OpCenter/ManageReply',
          },
          {
            name: '举报管理',
            path: './report',
            component: './OpCenter/ManageReport',
          },
          {
            name: '用户管理',
            path: './user',
            component: './OpCenter/ManageUser',
          },
          {
            component: './404',
          },
        ],
      },
      {
        path: '/manage',
        component: '../layouts/AdminLayout',
        access: 'canUser',
        routes: [
          {
            path: '/manage',
            redirect: 'question',
          },
          {
            name: '题目管理',
            path: './question',
            component: './OpCenter/ManageQuestion',
          },
          {
            component: './404',
          },
        ],
        hideInMenu: true,
      },
      {
        path: '/',
        component: '../layouts/BasicLayout',
        routes: [
          {
            name: '首页',
            path: '/',
            component: './Index',
          },
          {
            name: '个人中心',
            path: '/account',
            routes: [
              {
                path: '/account',
                redirect: '/account/info',
              },
              {
                name: '个人资料',
                path: './info',
                component: './AccountCenter/MyInfo',
                wrappers: ['@/wrappers/auth'],
              },
              {
                name: '我的收藏',
                path: './favour',
                component: './AccountCenter/MyFavourQuestions',
                wrappers: ['@/wrappers/auth'],
              },
              {
                name: '我的题目',
                path: './question',
                component: './AccountCenter/MyAddQuestions',
                wrappers: ['@/wrappers/auth'],
              },
              {
                name: '我的回答',
                path: './comment',
                component: './AccountCenter/MyAddComments',
                wrappers: ['@/wrappers/auth'],
              },
              {
                name: '我的试卷',
                path: './paper',
                component: './AccountCenter/MyAddPapers',
                wrappers: ['@/wrappers/auth'],
              },
              {
                name: '消息通知',
                path: './message',
                component: './AccountCenter/MyMessages',
                wrappers: ['@/wrappers/auth'],
              },
            ],
          },
          {
            name: '题目大全',
            path: '/questions',
            component: './Questions',
          },
          {
            name: '题目大全',
            path: '/tag/:key',
            component: './Questions',
          },
          {
            name: '试卷大全',
            path: '/papers',
            component: './Papers',
          },
          {
            name: '下载试卷',
            path: '/downloadPaper',
            component: './DownloadPaper',
          },
          {
            name: '创建试卷',
            path: '/addPaper',
            component: './AddPaper',
            wrappers: ['@/wrappers/auth'],
          },
          {
            name: '排行榜',
            path: '/ranking',
            component: './Ranking',
          },
          {
            name: '标签大全',
            path: '/tags',
            component: './Tags',
          },
          {
            name: '题目详情',
            path: '/qd/:id',
            component: './QuestionDetail',
            hideInMenu: true,
          },
          {
            name: '题目回答详情',
            path: '/qd/:id/c/:commentId',
            component: './QuestionDetail',
            hideInMenu: true,
          },
          {
            name: '题目回答详情',
            path: '/cd/:commentId',
            component: './QuestionDetail',
            hideInMenu: true,
          },
          {
            name: '试卷详情',
            path: '/pd/:id',
            component: './PaperDetail',
            hideInMenu: true,
          },
          {
            name: '用户空间',
            path: '/ud/:id',
            component: './AccountCenter/MyInfo',
            hideInMenu: true,
          },
          {
            name: '上传题目',
            path: '/addQuestion',
            component: './AddQuestion',
            wrappers: ['@/wrappers/auth'],
            hideInMenu: true,
          },
          {
            name: '创建试卷成功',
            path: '/addPaperSucceed',
            component: './AddPaperSucceed',
            access: 'canUser',
            hideInMenu: true,
          },
          {
            name: '上传成功',
            path: '/addSucceed',
            component: './AddSucceed',
            access: 'canUser',
            hideInMenu: true,
          },
          {
            component: './404',
          },
        ],
      },
    ],
  },
  {
    layout: false,
    component: './404',
  },
];
