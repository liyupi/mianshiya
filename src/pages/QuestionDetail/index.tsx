import {
  Avatar,
  Card,
  Col,
  Divider,
  message,
  Row,
  Space,
  Typography,
  Tag,
  Button,
  Image,
  Tooltip,
  Dropdown,
  Menu,
  List,
} from 'antd';
import React, { useEffect, useState } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import {history, Link, useAccess, useParams} from 'umi';
import { getQuestion, favourQuestion, viewQuestion, deleteQuestion } from '@/services/question';
import type { QuestionType } from '@/models/question';
import TagList from '@/components/TagList';
import type { CurrentUser, SimpleUser } from '@/models/user';
import { getCurrentUser, getUserSimpleInfo } from '@/services/user';
import { MinusCircleOutlined, ShareAltOutlined } from '@ant-design/icons/lib';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import CommentList from '@/pages/QuestionDetail/components/CommentList';
import {
  doShareQuestion,
  getQuestionSpeakText,
  getQuestionTitle,
  toLoginPage,
  toQuestionDetailPage,
} from '@/utils/businessUtils';
import SimilarQuestions from './components/SimilarQuestions';
import { useModel } from '@@/plugin-model/useModel';
import {
  EditOutlined,
  StarFilled,
  StarOutlined,
  SoundOutlined,
  HistoryOutlined,
  WarningOutlined,
  MoreOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  QUESTION_DIFFICULTY_ENUM,
  QUESTION_TYPE_ENUM,
  QUESTION_DIFFICULTY_COLOR_ENUM,
} from '@/constant/question';
import { DEFAULT_AVATAR, YUPI_QR_CODE } from '@/constant';
import AddMeetQuestionModal from '@/components/AddMeetQuestionModal';
import QuestionDetailCard from '@/components/QuestionDetailCard';
import QuestionManageBar from '@/components/QuestionManageBar';
import { formatPartDateTimeStr } from '@/utils/utils';
import ReportModal from '@/components/ReportModal';
import { REPORT_TYPE_ENUM } from '@/constant/report';
import UserInfoCardPopover from '@/components/UserInfoCardPopover';
import UserTitleBar from '@/components/UserTitleBar';
import type { CommentUserType } from '@/models/comment';
import { searchComments } from '@/services/comment';
import CommentItem from '@/components/CommentItem';
import './index.less';

/**
 * 题目详情页
 * @constructor
 * @author liyupi
 */
const QuestionDetail: React.FC = () => {
  const [question, setQuestion] = useState<QuestionType>({} as QuestionType);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<SimpleUser>();
  const [favourLoading, setFavourLoading] = useState<boolean>(false);
  const [showReference, setShowReference] = useState<boolean>(false);
  const [meetModalVisible, setMeetModalVisible] = useState<boolean>(false);
  const [isFavour, setIsFavour] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [favourNum, setFavourNum] = useState<number>(0);
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const [comment, setComment] = useState<CommentUserType>();
  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const access = useAccess();
  const { id, commentId } = useParams<any>();
  const [questionId, setQuestionId] = useState<string>(id);

  useEffect(() => {
    setQuestionId(id);
  }, [id]);

  const loadData = async () => {
    if (!questionId) {
      return;
    }
    setLoading(true);
    const res = await getQuestion(questionId);
    if (res) {
      setQuestion(res);
      getUserSimpleInfo(res.userId)?.then((tmpUser) => {
        setUser(tmpUser);
      });
    } else {
      message.error('题目加载失败，请刷新重试');
    }
    setLoading(false);
    // 浏览量 +1
    if (currentUser._id) {
      viewQuestion(questionId);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
    setShowReference(false);
  }, [questionId]);

  /**
   * 加载单条回答
   */
  const loadCommentData = async () => {
    if (!commentId) {
      return;
    }
    setCommentLoading(true);
    const res = await searchComments({ questionId, commentId, pageSize: 1, getReplyList: true });
    if (res?.data?.[0]) {
      setComment(res.data[0]);
      if (!questionId) {
        setQuestionId(res.data[0].questionId);
      }
    } else {
      message.error('回答加载失败，请刷新重试');
    }
    setCommentLoading(false);
  };

  useEffect(() => {
    loadCommentData();
  }, [commentId]);

  useEffect(() => {
    if (question) {
      setIsFavour(currentUser.favourQuestionIds?.includes(question._id) ?? false);
      setFavourNum(question.favourNum ?? 0);
    }
  }, [currentUser, question]);

  /**
   * 收藏
   */
  const doFavour = async () => {
    if (!question._id || favourLoading) {
      return;
    }
    if (!currentUser._id) {
      message.warning('登录后才能操作哦！');
      toLoginPage();
      return;
    }
    setFavourLoading(true);
    const res = await favourQuestion(question._id);
    setFavourLoading(false);
    setFavourNum(favourNum + res);
    if (res !== 0) {
      if (res > 0) {
        setIsFavour(true);
        message.success('收藏成功');
      } else {
        setIsFavour(false);
        message.success('已取消收藏');
      }
      question.favourNum = favourNum + res;
      const newCurrentUser = await getCurrentUser();
      setInitialState({ ...initialState, currentUser: newCurrentUser });
    } else {
      message.error('操作失败');
    }
  };

  // 遇到题目
  const doMeet = () => {
    if (!currentUser?._id) {
      toLoginPage();
      message.warning('请先登录');
      return;
    }
    setMeetModalVisible(true);
  };

  /**
   * 删除题目
   */
  const doDelete = async () => {
    const res = await deleteQuestion(question._id);
    if (res) {
      message.success('操作成功');
    } else {
      message.error('操作失败');
    }
  };

  /**
   * 修改题目
   */
  const toEditPage = () => {
    history.push({
      pathname: '/addQuestion',
      query: {
        rid: question._id,
      },
    });
  };

  // 是否允许编辑题目
  const canEdit = access.canAdmin || question.userId === currentUser._id;

  const opMenu = (
    <Menu>
      <Menu.Item key="report" icon={<WarningOutlined />} onClick={() => setShowReportModal(true)}>
        反馈
      </Menu.Item>
      {canEdit && (
        <Menu.Item key="report" icon={<EditOutlined />} onClick={toEditPage}>
          修改
        </Menu.Item>
      )}
      {canEdit && (
        <Menu.Item key="report" icon={<DeleteOutlined />} danger onClick={doDelete}>
          删除
        </Menu.Item>
      )}
      {access.canAdmin && (
        <Menu.Item key="2" icon={<MinusCircleOutlined />}>
          <Link to={`/op/question?id=${questionId}`} target="_blank">
            管理
          </Link>
        </Menu.Item>
      )}
    </Menu>
  );

  const actions = [
    <div onClick={() => doFavour()}>
      <Space>
        {isFavour ? (
          <>
            <StarFilled />
            已收藏
          </>
        ) : (
          <>
            <StarOutlined />
            收藏
          </>
        )}
      </Space>
    </div>,
    <div onClick={() => doMeet()}>
      <Space>
        <HistoryOutlined /> 遇到
      </Space>
    </div>,
    <div onClick={() => doShareQuestion(question)}>
      <Space>
        <ShareAltOutlined /> 分享
      </Space>
    </div>,
    <Dropdown overlay={opMenu} arrow>
      <Space>
        <MoreOutlined /> 操作
      </Space>
    </Dropdown>,
  ];

  const questionTitle = getQuestionTitle(question);

  /**
   * 语音读题
   */
  const doSpeak = async () => {
    if (!question._id) {
      return;
    }
    // 拼接朗读信息
    const speakText = getQuestionSpeakText(question, showReference);
    const utterThis = new window.SpeechSynthesisUtterance(speakText);
    await window.speechSynthesis.speak(utterThis);
  };

  return (
    <HelmetProvider>
      <Helmet>{question && <title>{questionTitle.substring(0, 40)} - 面试鸭</title>}</Helmet>
      <GridContent className="question-detail" style={{ overflowX: 'hidden' }}>
        <Row gutter={[24, 24]}>
          <Col xl={16} lg={24} xs={24}>
            <Card
              title={
                <Space split={<Divider type="vertical" />} wrap align="center">
                  <span>{QUESTION_TYPE_ENUM[question?.type ?? 0]}题</span>
                  <Tag color={QUESTION_DIFFICULTY_COLOR_ENUM[question?.difficulty || 0]}>
                    {QUESTION_DIFFICULTY_ENUM[question?.difficulty || 0]}
                  </Tag>
                  <TagList question={question} />
                </Space>
              }
              extra={
                <Tooltip title="语音读题">
                  <Button icon={<SoundOutlined />} type="text" onClick={() => doSpeak()} />
                </Tooltip>
              }
              bordered={false}
              style={{ marginBottom: 24 }}
              loading={loading}
              actions={actions}
            >
              {question._id && (
                <div>
                  <QuestionDetailCard question={question} showReference={showReference} />
                  <div style={{ marginBottom: 16 }} />
                  {(question.reference || question.params?.answer) && (
                    <Row justify="space-between">
                      <Space size="middle">
                        <Button
                          type="primary"
                          danger={showReference}
                          onClick={() => {
                            // 如果是隐藏解析，回到顶部
                            if (showReference) {
                              window.scrollTo(0, 0);
                            }
                            setShowReference(!showReference);
                          }}
                        >
                          {showReference ? '隐藏解析' : '查看解析'}
                        </Button>
                      </Space>
                    </Row>
                  )}
                  {access.canAdmin && <QuestionManageBar question={question} />}
                </div>
              )}
            </Card>
            {commentId ? (
              <>
                <Card
                  bodyStyle={{
                    textAlign: 'center',
                    fontSize: 15,
                    paddingTop: 12,
                    paddingBottom: 12,
                  }}
                >
                  <Link to={`/qd/${questionId}`}>查看全部 {question.commentNum ?? 0} 个回答</Link>
                </Card>
                <div style={{ marginBottom: 24 }} />
                <Card loading={commentLoading} bodyStyle={{ paddingTop: 12, paddingBottom: 12 }}>
                  {comment && (
                    <List itemLayout="vertical">
                      <CommentItem
                        comment={comment}
                        onDelete={() => toQuestionDetailPage(question, false)}
                      />
                    </List>
                  )}
                </Card>
              </>
            ) : (
              <CommentList question={question} />
            )}
          </Col>
          <Col xl={8} lg={24} xs={24}>
            <Card title="题目信息" bodyStyle={{ paddingBottom: 8 }}>
              <p>浏览数：{(question.viewNum ?? 0) + 1}</p>
              {question.publishTime && (
                <p>发布时间：{formatPartDateTimeStr(question?.publishTime)}</p>
              )}
              <p>
                上传者：
                <Space>
                  <UserInfoCardPopover user={user}>
                    <Avatar src={user?.avatarUrl || DEFAULT_AVATAR} />
                  </UserInfoCardPopover>
                  <UserTitleBar user={user} />
                </Space>
              </p>
              <p>
                <span style={{ marginRight: 16 }}>遇到人数：{question.meetNum ?? 0}</span>
                <Button type="primary" size="small" onClick={() => doMeet()}>
                  我遇到过
                </Button>
              </p>
              {question && question.links?.length > 0 && (
                <>
                  <p>相关链接：</p>
                  <p>
                    {question.links.map((link) => {
                      return (
                        <Typography.Paragraph copyable={{ text: link }}>
                          <Space>
                            -
                            <a href={link} target="_blank" rel="noreferrer">
                              {link}
                            </a>
                          </Space>
                        </Typography.Paragraph>
                      );
                    })}
                  </p>
                </>
              )}
            </Card>
            <div style={{ marginBottom: 24 }} />
            <Card title="相似题目" bodyStyle={{ paddingTop: 12, paddingBottom: 12 }}>
              <SimilarQuestions question={question} />
            </Card>
            <div style={{ marginBottom: 24 }} />
            <Card bodyStyle={{ paddingBottom: 16 }}>
              <Card.Meta
                avatar={<Image width={72} src={YUPI_QR_CODE} />}
                title="关注站长公众号"
                description="帮助你更轻松地学编程"
              />
            </Card>
          </Col>
        </Row>

        {question && (
          <>
            <AddMeetQuestionModal
              questionId={questionId}
              visible={meetModalVisible}
              onClose={() => setMeetModalVisible(false)}
              onReload={(isEdit) => {
                if (!isEdit) {
                  question.meetNum = (question.meetNum ?? 0) + 1;
                }
                setQuestion({ ...question });
              }}
            />
            <ReportModal
              visible={showReportModal}
              reportType={REPORT_TYPE_ENUM.QUESTION}
              reportResourceId={question._id}
              reportedUserId={question.userId}
              onClose={() => setShowReportModal(false)}
            />
          </>
        )}
      </GridContent>
    </HelmetProvider>
  );
};

export default QuestionDetail;
