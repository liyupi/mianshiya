import {
  Avatar,
  Button,
  Col,
  List,
  message,
  Row,
  Space,
  Form,
  Pagination,
  Dropdown,
  Menu,
  Modal,
} from 'antd';
import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { CommentUserType } from '@/models/comment';
import type { CurrentUser } from '@/models/user';
import { useModel } from '@@/plugin-model/useModel';
import type { ReplySearchParams } from '@/services/reply';
import { addReply, deleteReply, searchReplies } from '@/services/reply';
import type { ReplyUserType } from '@/models/reply';
import TextArea from 'antd/es/input/TextArea';
import { formatDateTimeStr } from '@/utils/utils';
import { DEFAULT_AVATAR } from '@/constant';
import { useAccess } from '@@/plugin-access/access';
import ReportModal from '@/components/ReportModal';
import { REPORT_TYPE_ENUM } from '@/constant/report';
import UserInfoCardPopover from '@/components/UserInfoCardPopover';
import './index.less';

interface ReplyListProps {
  showQuestion?: boolean;
  comment: CommentUserType;
}

const DEFAULT_PAGE_PARAMS = {
  pageNum: 1,
  pageSize: 10,
};

// 默认展示的回复数，大于这个数量则显示回复更多
const DEFAULT_SHOW_REPLY_NUM = 3;

/**
 * 回复列表
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const ReplyList: React.FC<ReplyListProps> = forwardRef((props, ref) => {
  const { comment = {} as CommentUserType } = props;
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const [showReplyInput, setShowReplyInput] = useState<boolean>(false);
  const [replyId, setReplyId] = useState<string>('');
  const [replyUserId, setReplyUserId] = useState<string>('');
  const [replyTotal, setReplyTotal] = useState<number>(0);
  const [replySearchParams, setReplySearchParams] =
    useState<ReplySearchParams>(DEFAULT_PAGE_PARAMS);
  const [showMoreReply, setShowMoreReply] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');
  const [replySubmitting, setReplySubmitting] = useState<boolean>(false);
  const [replyListLoading, setReplyListLoading] = useState<boolean>(false);
  // 默认回复列表为回答关联查出的列表的前 3 个（用于判断是否有更多回复）
  const [replyList, setReplyList] = useState<ReplyUserType[]>(
    comment.replyList ? comment.replyList.slice(0, 3) : [],
  );
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportResourceId, setReportResourceId] = useState<string>('');
  const [reportedUserId, setReportedUserId] = useState<string>('');
  const topRef = useRef<HTMLDivElement>(null);
  const access = useAccess();

  /**
   * 设置回复状态
   * @param showInput
   * @param replyId
   * @param replyUserId
   */
  const setReplyInputState = (showInput: boolean, replyId: string, replyUserId: string) => {
    setShowReplyInput(showInput);
    setReplyId(replyId);
    setReplyUserId(replyUserId);
  };

  // 暴露给父组件调用
  useImperativeHandle(ref, () => ({
    setReplyInputState,
  }));

  /**
   * 查询回复列表
   */
  const searchReplyList = async () => {
    if (comment._id) {
      setReplyListLoading(true);
      const res = await searchReplies({
        commentId: comment._id,
        order: 'asc',
        ...replySearchParams,
      });
      if (res) {
        setReplyList(res.data);
        setReplyTotal(res.total);
      } else {
        message.error('加载失败，请重试');
      }
      setReplyListLoading(false);
    }
  };

  useEffect(() => {
    if (showMoreReply) {
      searchReplyList();
    }
  }, [replySearchParams, showMoreReply]);

  /**
   * 创建回复
   */
  const submitReply = async () => {
    if (!replyText) {
      return;
    }
    setReplySubmitting(true);
    const res = await addReply({
      questionId: comment.questionId,
      content: replyText,
      commentId: comment._id,
      replyId,
      replyUserId,
    });
    if (res) {
      message.success('发送成功');
      setReplyText('');
      searchReplyList();
    } else {
      message.error('发送失败，请重试');
    }
    setReplySubmitting(false);
  };

  /**
   * 删除回复
   * @param replyId
   */
  const doDeleteReply = async (replyId: string) => {
    if (!replyId) {
      return;
    }
    const res = await deleteReply(replyId);
    if (res) {
      message.success('删除成功');
      searchReplyList();
    } else {
      message.error('操作失败，请刷新重试');
    }
  };

  const replyOpMenu = (reply: ReplyUserType) => (
    <Menu>
      {(reply.userId === currentUser._id || access.canAdmin) && (
        <Menu.Item
          key={`delete${reply._id}`}
          icon={<DeleteOutlined />}
          danger
          onClick={() =>
            Modal.confirm({
              icon: <ExclamationCircleOutlined />,
              content: '是否确认删除？不可找回',
              onOk() {
                doDeleteReply(reply._id);
              },
            })
          }
        >
          删除
        </Menu.Item>
      )}
      <Menu.Item
        key={`report${reply._id}`}
        icon={<WarningOutlined />}
        onClick={() => {
          setReportResourceId(reply._id);
          setReportedUserId(reply.userId);
          setShowReportModal(true);
        }}
      >
        举报
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="reply-list" ref={topRef}>
      {replyList.length > 0 && (
        <List<ReplyUserType>
          className="reply-list"
          itemLayout="vertical"
          loading={replyListLoading}
          split={false}
          style={{ marginTop: 12, marginLeft: 56 }}
          dataSource={replyList}
          renderItem={(reply) => {
            return (
              <List.Item key={reply._id} className="reply-info">
                <List.Item.Meta
                  avatar={
                    <UserInfoCardPopover user={reply.userInfo[0]}>
                      <Avatar src={reply.userInfo[0]?.avatarUrl || DEFAULT_AVATAR} />
                    </UserInfoCardPopover>
                  }
                  title={
                    <Space size={8}>
                      <UserInfoCardPopover user={reply.userInfo[0]}>
                        {reply.userInfo[0]?.nickName}
                      </UserInfoCardPopover>
                      {reply.replyUserInfo?.length > 0 && (
                        <span>
                          回复 @
                          <UserInfoCardPopover user={reply.replyUserInfo[0]}>
                            {reply.replyUserInfo[0]?.nickName}
                          </UserInfoCardPopover>
                        </span>
                      )}
                    </Space>
                  }
                  description={reply.content}
                />
                <Row justify="space-between" align="middle" style={{ marginTop: -12 }}>
                  <Col>
                    <Space size={8}>
                      <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                        {formatDateTimeStr(reply._createTime, 'YYYY-MM-DD HH:mm')}
                      </span>
                      <Button
                        size="small"
                        type="text"
                        onClick={() => {
                          setReplyId(reply._id);
                          setReplyUserId(reply.userId);
                          setShowReplyInput(true);
                        }}
                      >
                        回复
                      </Button>
                    </Space>
                  </Col>
                  <Col>
                    <Dropdown
                      trigger={['click']}
                      overlay={() => replyOpMenu(reply)}
                      placement="bottomRight"
                      className="op-btn"
                    >
                      <MoreOutlined />
                    </Dropdown>
                  </Col>
                </Row>
              </List.Item>
            );
          }}
        >
          {showMoreReply ? (
            <Pagination
              pageSize={replySearchParams.pageSize ?? DEFAULT_PAGE_PARAMS.pageSize}
              current={replySearchParams.pageNum ?? DEFAULT_PAGE_PARAMS.pageNum}
              showSizeChanger={false}
              total={replyTotal}
              size="small"
              onChange={(pageNum, pageSize) => {
                const params = {
                  ...replySearchParams,
                  pageSize,
                  pageNum,
                };
                setReplySearchParams(params);
                // 回到回答区顶部
                if (topRef?.current) {
                  window.scrollTo(0, topRef.current.offsetTop);
                }
              }}
            />
          ) : (
            // 回复数 > 3 条，展示查看更多按钮
            comment?.replyList &&
            comment.replyList.length > DEFAULT_SHOW_REPLY_NUM && (
              <div>
                <Button
                  size="small"
                  style={{ padding: 0 }}
                  type="text"
                  onClick={() => setShowMoreReply(true)}
                >
                  查看更多
                </Button>
              </div>
            )
          )}
        </List>
      )}
      {showReplyInput && (
        <div style={{ marginTop: 16, marginLeft: 56 }}>
          <Form.Item>
            <TextArea
              rows={4}
              maxLength={600}
              showCount
              onChange={(e) => setReplyText(e.target.value)}
              value={replyText}
            />
          </Form.Item>
          <Form.Item>
            <Button
              style={{ width: 100, float: 'right' }}
              htmlType="submit"
              loading={replySubmitting}
              onClick={() => submitReply()}
              type="primary"
            >
              回复
            </Button>
          </Form.Item>
        </div>
      )}
      <ReportModal
        visible={showReportModal}
        reportType={REPORT_TYPE_ENUM.REPLY}
        reportResourceId={reportResourceId}
        reportedUserId={reportedUserId}
        onClose={() => setShowReportModal(false)}
      />
    </div>
  );
});

export default ReplyList;
