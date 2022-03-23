import {
  Avatar,
  Button,
  Col,
  List,
  message,
  Row,
  Space,
  Tag,
  Typography,
  Dropdown,
  Menu,
  Modal,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  LikeFilled,
  LikeOutlined,
  MoreOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { CommentUserType } from '@/models/comment';
import { deleteComment, thumbUpComment, updateCommentPriority } from '@/services/comment';
import type { CurrentUser } from '@/models/user';
import { useModel } from '@@/plugin-model/useModel';
import {
  DEFAULT_COMMENT_PRIORITY,
  GOOD_COMMENT_PRIORITY,
  STANDARD_COMMENT_PRIORITY,
} from '@/constant/comment';
import RichTextViewer from '@/components/RichTextViewer';
import AddCommentModal from '@/pages/QuestionDetail/components/AddCommentModal';
import { getQuestionTitle, toLoginPage } from '@/utils/businessUtils';
import { formatPartDateTimeStr } from '@/utils/utils';
import { DEFAULT_AVATAR } from '@/constant';
import { useAccess } from '@@/plugin-access/access';
import ReportModal from '@/components/ReportModal';
import { REPORT_TYPE_ENUM } from '@/constant/report';
import UserInfoCardPopover from '@/components/UserInfoCardPopover';
import ReplyList from '@/components/ReplyList';
import UserTitleBar from '@/components/UserTitleBar';
import './index.less';
import { Link } from 'umi';

interface CommentItemProps {
  showQuestion?: boolean;
  comment: CommentUserType;
  onDelete: () => void;
}

/**
 * 单个回答展示
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const CommentItem: React.FC<CommentItemProps> = (props) => {
  const { comment = {} as CommentUserType, onDelete, showQuestion = false } = props;
  // 用于修改回答后的视图更新
  const [commentState, setCommentState] = useState<CommentUserType>(comment);
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const [isThumb, setIsThumb] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [thumbLoading, setThumbLoading] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportResourceId, setReportResourceId] = useState<string>('');
  const replyListRef = useRef(null);
  const access = useAccess();

  useEffect(() => {
    const thumbCommentIds = currentUser.thumbCommentIds ?? [];
    setIsThumb(thumbCommentIds.includes(comment._id));
  }, [currentUser, comment._id]);

  const doThumbUp = async (id: string) => {
    if (!currentUser?._id) {
      toLoginPage();
      message.warning('登录后才能点赞哦');
      return;
    }
    if (thumbLoading) {
      return;
    }
    setThumbLoading(true);
    const res = await thumbUpComment(id);
    if (res === 1 || res === -1) {
      comment.thumbNum = (comment.thumbNum ?? 0) + res;
      const thumbCommentIds = currentUser.thumbCommentIds ?? [];
      if (res > 0) {
        thumbCommentIds.push(comment._id);
      } else {
        thumbCommentIds.splice(thumbCommentIds.indexOf(comment._id), 1);
      }
      const newCurrentUser = { ...currentUser, thumbCommentIds };
      setInitialState({ ...initialState, currentUser: newCurrentUser });
    } else {
      message.error('操作失败，请刷新重试');
    }
    setThumbLoading(false);
  };

  /**
   * 修改回答优先级
   */
  const doUpdateCommentPriority = async (priority: number) => {
    if (!comment) {
      return;
    }
    const res = await updateCommentPriority(comment._id, priority);
    if (res) {
      setCommentState({ ...commentState, priority });
      message.success('操作成功');
    } else {
      message.error('操作失败');
    }
  };

  /**
   * 删除回答
   */
  const doDelete = async (commentId: string) => {
    const res = await deleteComment(commentId);
    if (res) {
      message.success('操作成功');
      onDelete();
    } else {
      message.error('操作失败');
    }
  };

  const commentOpMenu = (comment: CommentUserType) => (
    <Menu>
      {(comment.userId === currentUser._id || access.canAdmin) && (
        <Menu.Item
          key={`delete${comment._id}`}
          icon={<DeleteOutlined />}
          danger
          onClick={() =>
            Modal.confirm({
              icon: <ExclamationCircleOutlined />,
              content: '是否确认删除？不可找回',
              onOk() {
                doDelete(comment._id);
              },
            })
          }
        >
          删除
        </Menu.Item>
      )}
      <Menu.Item
        key={`report${comment._id}`}
        icon={<WarningOutlined />}
        onClick={() => {
          setReportResourceId(comment._id);
          setShowReportModal(true);
        }}
      >
        举报
      </Menu.Item>
    </Menu>
  );

  const question = comment.question?.[0];
  const questionTitle = getQuestionTitle(question);

  // @ts-ignore
  return (
    <List.Item className="comment-item">
      {showQuestion && (
        <Typography.Title
          level={5}
          ellipsis={{ rows: 2 }}
          style={{ fontSize: 18, marginBottom: 16 }}
          className="question-item-title"
        >
          {questionTitle ? (
            <Link
              to={`/qd/${question?._id}/c/${comment?._id}`}
              style={{ color: 'rgba(0, 0, 0, 0.85)' }}
            >
              {questionTitle}
            </Link>
          ) : (
            '题目已删除'
          )}
        </Typography.Title>
      )}
      <List.Item.Meta
        avatar={
          <UserInfoCardPopover user={commentState.userInfo?.[0]}>
            <Avatar size="large" src={commentState.userInfo?.[0].avatarUrl || DEFAULT_AVATAR} />
          </UserInfoCardPopover>
        }
        title={
          <Row justify="space-between">
            <div>
              <UserTitleBar user={commentState.userInfo?.[0]} />
            </div>
            <>
              {commentState.priority === STANDARD_COMMENT_PRIORITY && (
                <Tag color="red" style={{ marginRight: 0 }}>
                  参考
                </Tag>
              )}
              {commentState.priority === GOOD_COMMENT_PRIORITY && (
                <Tag color="green" style={{ marginRight: 0 }}>
                  精选
                </Tag>
              )}
            </>
          </Row>
        }
        description={formatPartDateTimeStr(commentState._createTime)}
      />
      {commentState.content && (
        <RichTextViewer
          key={commentState._id + commentState._updateTime?.toString()}
          htmlContent={commentState.content}
        />
      )}
      <Row justify="space-between" align="middle" style={{ marginTop: 12 }}>
        <Col>
          <Space>
            <Button
              icon={isThumb ? <LikeFilled /> : <LikeOutlined />}
              onClick={() => doThumbUp(comment._id)}
            >
              <span>{comment.thumbNum ?? 0}</span>
            </Button>
            <Button
              size="small"
              type="text"
              onClick={() => {
                // @ts-ignore
                replyListRef?.current?.setReplyInputState(true, '', '');
              }}
            >
              回复
            </Button>
          </Space>
        </Col>
        <Col>
          <Space>
            {(comment.userId === currentUser._id || access.canAdmin) && (
              <Button
                size="small"
                type="text"
                onClick={() => {
                  setModalVisible(true);
                }}
              >
                修改
              </Button>
            )}
            {access.canAdmin && (
              <>
                <Button
                  size="small"
                  type="text"
                  danger={commentState.priority === GOOD_COMMENT_PRIORITY}
                  onClick={() => {
                    doUpdateCommentPriority(
                      commentState.priority === GOOD_COMMENT_PRIORITY
                        ? DEFAULT_COMMENT_PRIORITY
                        : GOOD_COMMENT_PRIORITY,
                    );
                  }}
                >
                  {commentState.priority === GOOD_COMMENT_PRIORITY ? '取消' : ''}精选
                </Button>
                <Button
                  size="small"
                  type="text"
                  danger={commentState.priority === STANDARD_COMMENT_PRIORITY}
                  onClick={() => {
                    doUpdateCommentPriority(
                      commentState.priority === STANDARD_COMMENT_PRIORITY
                        ? DEFAULT_COMMENT_PRIORITY
                        : STANDARD_COMMENT_PRIORITY,
                    );
                  }}
                >
                  {commentState.priority === STANDARD_COMMENT_PRIORITY ? '取消' : ''}参考
                </Button>
              </>
            )}
            <Dropdown
              trigger={['click']}
              overlay={() => commentOpMenu(comment)}
              placement="bottomRight"
            >
              <MoreOutlined />
            </Dropdown>
          </Space>
        </Col>
      </Row>
      {/* @ts-ignore */}
      <ReplyList ref={replyListRef} comment={comment} />
      <AddCommentModal
        questionId={comment.questionId}
        commentId={comment._id}
        visible={modalVisible}
        onReload={(commentUser) => setCommentState({ ...commentUser })}
        onClose={() => setModalVisible(false)}
      />
      <ReportModal
        visible={showReportModal}
        reportType={REPORT_TYPE_ENUM.COMMENT}
        reportResourceId={reportResourceId}
        reportedUserId={comment.userId}
        onClose={() => setShowReportModal(false)}
      />
    </List.Item>
  );
};

export default CommentItem;
