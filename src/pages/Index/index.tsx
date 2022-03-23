import { Alert, Avatar, Button, Card, Col, Empty, Image, List, message, Row, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'umi';
import QuestionItem from '@/components/QuestionItem';
import type { QuestionType } from '@/models/question';
import type { QuestionSearchParams } from '@/services/question';
import { listRecommendQuestions, searchQuestionsByPage } from '@/services/question';
import reviewStatusEnum from '@/constant/reviewStatusEnum';
import { LinkOutlined } from '@ant-design/icons';
import { toLoginPage } from '@/utils/businessUtils';
import type { CurrentUser, RankUser } from '@/models/user';
import { LIKE_TAG, RECOMMEND_TAG } from '@/constant/tag';
import { history } from '@@/core/history';
import moment from 'moment';
import { listUserCycleRank } from '@/services/user';
import TagTabList from '@/components/TagTabList';
import MyInterestUpdateModal from '@/components/MyInterestUpdateModal';
import { useModel } from '@@/plugin-model/useModel';
import { GOOD_QUESTION_PRIORITY } from '@/constant/question';
import { DEFAULT_AVATAR } from '@/constant';
import Logo from '@/assets/logo.png';
import { Steps } from 'intro.js-react';
import UserInfoCardPopover from '@/components/UserInfoCardPopover';
import UserTitleBar from '@/components/UserTitleBar';

/**
 * 排序方式
 */
const ORDERS = {
  RECOMMEND: '0',
  NEWEST: '1',
  GOOD: '2',
};

/**
 * 首页
 *
 * @author liyupi
 */
const Index: React.FC = () => {
  const [list, setList] = useState<QuestionType[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string>(RECOMMEND_TAG);
  const [order, setOrder] = useState<string>(ORDERS.RECOMMEND);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [rankList, setRankList] = useState<RankUser[]>([]);
  const [monthLoading, setMonthLoading] = useState<boolean>(true);
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};

  const loadData = async () => {
    setLoading(true);
    let data;
    // 根据兴趣推荐
    if (activeKey === RECOMMEND_TAG && order === ORDERS.RECOMMEND) {
      data = await listRecommendQuestions(12);
    } else if (activeKey === LIKE_TAG) {
      history.push({
        pathname: '/account/favour',
      });
      return;
    } else {
      const condition: QuestionSearchParams = {
        tags: activeKey === RECOMMEND_TAG ? [] : [activeKey],
        reviewStatus: reviewStatusEnum.PASS,
        pageSize: 12,
      };
      if (order === ORDERS.NEWEST) {
        condition.orderKey = 'publishTime';
      } else if (order === ORDERS.GOOD) {
        condition.priority = GOOD_QUESTION_PRIORITY;
      } else if (order === ORDERS.RECOMMEND) {
        condition.orderKey = 'favourNum';
      }
      data = await searchQuestionsByPage(condition).then((res) => res.data);
    }
    if (!data) {
      message.error('数据加载失败');
      data = [];
    }
    setLoading(false);
    setList(data);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line no-restricted-globals
    window.scrollTo(0, 0);
  }, [activeKey, order]);

  // 仅触发一次
  useEffect(() => {
    // 周积分榜
    setMonthLoading(true);
    listUserCycleRank(1, moment().startOf('month').format('YYYY-MM-DD'), 3)
      .then((data: any) => {
        setRankList(data);
      })
      .finally(() => setMonthLoading(false));
  }, []);

  const handleTabClick = (key: string) => {
    setActiveKey(key);
  };

  const doSetInterests = () => {
    if (!currentUser._id) {
      message.warning('登录后才能操作哦！');
      toLoginPage();
      return;
    }
    setModalVisible(true);
  };

  const moreLink = activeKey !== RECOMMEND_TAG ? `/tag/${activeKey}` : `questions`;

  const loadMore =
    !loading && list && list.length > 0 ? (
      <div
        style={{
          textAlign: 'center',
          margin: '20px 0',
          columnSpan: 'all',
        }}
      >
        <Button type="primary">
          <Link to={moreLink} target="_blank">
            <Space size={8}>查看更多</Space>
          </Link>
        </Button>
      </div>
    ) : null;

  const tabListNoTitle = [
    {
      key: ORDERS.RECOMMEND,
      tab: '最热',
    },
    {
      key: ORDERS.NEWEST,
      tab: '最新',
    },
    {
      key: ORDERS.GOOD,
      tab: '精选',
    },
  ];

  const guidanceEnable = () => {
    return localStorage.getItem('DownGuide') !== '1';
  };

  let stepsRef: Steps | null = null;
  return (
    <div>
      {/*@ts-ignore*/}
      <Steps
        enabled={guidanceEnable()}
        ref={(Steps) => (stepsRef = Steps)}
        options={{
          nextLabel: '下一步',
          prevLabel: '上一步',
          doneLabel: '完成',
          skipLabel: '跳过引导',
          exitOnOverlayClick: false,
        }}
        steps={[
          {
            element: '.ant-avatar',
            intro: '登陆后你可以在个人中心修改头像昵称等信息',
            title: 'welcome to 面试鸭！🎉',
          },
          {
            element: '.uploadDropdown',
            intro: '你可以在这里上传面试题目获得积分，也可以创建试卷',
            title: '开源万岁！✨',
          },
          {
            element: '.set-labels',
            intro: '设置兴趣标签，以便让我们给你推荐感兴趣的题目和试卷',
            title: '让我们更了解你🧐',
          },
          {
            element: '.pickQuestion666',
            intro: '点击将题目加入试题篮，后续可以组卷下载等操作',
            title: '遇到感兴趣的题目？😍',
          },
          {
            element: '.affix',
            intro: '你可以在试题篮查看挑选的题目，并进入组卷页面',
            title: '组卷达人📃',
          },
        ]}
        initialStep={0}
        onExit={() => {
          localStorage.setItem('DownGuide', '1');
        }}
        onBeforeChange={(nextStepIndex) => {
          if (nextStepIndex === 3) {
            // @ts-ignore
            stepsRef?.updateStepElement(nextStepIndex);
          }
        }}
      />
      <Row gutter={[24, 16]}>
        <Col lg={18} xs={24}>
          <Row gutter={12} wrap={false}>
            <Col flex="auto">
              <TagTabList activeKey={activeKey} onTabClick={handleTabClick} />
            </Col>
            <Col>
              <Button
                type="primary"
                className="set-labels"
                style={{ marginTop: 4 }}
                onClick={doSetInterests}
              >
                设置标签
              </Button>
            </Col>
          </Row>
          <Card
            style={{ width: '100%' }}
            bodyStyle={{
              paddingTop: 8,
            }}
            tabList={tabListNoTitle}
            activeTabKey={order}
            tabBarExtraContent={
              <a target="_blank" href={moreLink} rel="noreferrer">
                <LinkOutlined /> 更多
              </a>
            }
            onTabChange={(key) => {
              setOrder(key);
            }}
          >
            <List<QuestionType>
              rowKey="_id"
              itemLayout="vertical"
              loading={loading}
              dataSource={list}
              loadMore={loadMore}
              renderItem={(item, index) => (
                <QuestionItem index={index} key={item._id} question={item} />
              )}
              locale={{
                emptyText: (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无题目">
                    <Link to="/addQuestion" target="_blank">
                      <Button type="primary" size="large">
                        上传题目
                      </Button>
                    </Link>
                  </Empty>
                ),
              }}
            />
          </Card>
        </Col>
        <Col lg={6} xs={24}>
          <Alert
            style={{ marginBottom: 16 }}
            message={
              <>
                本站禁止任何测试行为，违者永久封号！
                <a href="https://docs.qq.com/sheet/DUGRYSlJMSm9Wb3lx" target="_blank" rel="noreferrer">
                  小黑屋
                </a>
              </>
            }
            type="warning"
            showIcon
            closable
          />
          <Card title="关于本站">
            <Card.Meta
              avatar={
                <Avatar src="https://636f-codenav-8grj8px727565176-1256524210.tcb.qcloud.la/img/1611148904143-1610274081627-%E9%B1%BC%E7%9A%AE.jpg" />
              }
              description={
                <div>
                  致力于收集面试题目与题解，提供一站式面试备战交流服务，助你成为面试达人！
                  <a href="https://t.1yb.co/yO1G" target="_blank" rel="noreferrer">
                    站长鱼皮，腾讯全栈开发者。
                  </a>
                </div>
              }
            />
          </Card>
          <div style={{ marginBottom: 16 }} />
          <Card
            title="本月排行"
            extra={
              <Link target="_blank" to="/ranking">
                更多
              </Link>
            }
            bodyStyle={{
              paddingTop: 12,
              paddingBottom: 12,
            }}
          >
            <List
              loading={monthLoading}
              dataSource={rankList}
              renderItem={(user) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <UserInfoCardPopover user={user}>
                        <Avatar src={user.avatarUrl || DEFAULT_AVATAR} />
                      </UserInfoCardPopover>
                    }
                    title={<UserTitleBar user={user} />}
                    description={`本月积分：${user.totalScore}`}
                  />
                </List.Item>
              )}
            />
          </Card>
          <div style={{ marginBottom: 16 }} />
          <Card bodyStyle={{ paddingBottom: 16 }}>
            <a href="https://www.code-nav.cn" target="_blank" rel="noreferrer">
              <Card.Meta
                avatar={<Image preview={false} width={64} src={Logo} />}
                title="编程导航"
                description="专业全面的编程资源站点，不再求人！"
              />
            </a>
          </Card>
        </Col>
      </Row>
      <MyInterestUpdateModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </div>
  );
};

export default Index;
