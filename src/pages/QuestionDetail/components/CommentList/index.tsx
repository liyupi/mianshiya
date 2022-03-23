import { Button, Card, List, message, Radio, Space } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import type { QuestionType } from '@/models/question';
import { CommentSearchParams, searchComments } from '@/services/comment';
import type { CommentUserType } from '@/models/comment';
import reviewStatusEnum from '@/constant/reviewStatusEnum';
import CommentItem from '@/components/CommentItem';
import AddCommentModal from '@/pages/QuestionDetail/components/AddCommentModal';
import { EditOutlined } from '@ant-design/icons';
import { toLoginPage } from '@/utils/businessUtils';
import { useModel } from '@@/plugin-model/useModel';
import { CurrentUser } from '@/models/user';
import './index.less';

interface CommentListProps {
  question: QuestionType;
}

const DEFAULT_PAGE_SIZE = 8;

/**
 * 回答列表
 * @param props
 * @constructor
 */
const CommentList: React.FC<CommentListProps> = (props) => {
  const { question } = props;
  const topRef = useRef<HTMLDivElement>(null);

  const initSearchParams: CommentSearchParams = {
    pageSize: DEFAULT_PAGE_SIZE,
    pageNum: 1,
    orderKey: 'thumbNum',
  };

  const [searchParams, setSearchParams] = useState<CommentSearchParams>(initSearchParams);
  const [list, setList] = useState<CommentUserType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};

  /**
   * 加载数据
   */
  const loadData = async () => {
    if (!question._id) {
      return;
    }
    setLoading(true);
    const res = await searchComments({
      questionId: question._id,
      reviewStatus: reviewStatusEnum.PASS,
      getReplyList: true,
      ...searchParams,
    });
    if (res) {
      setList(res.data);
      setTotal(res.total);
    } else {
      message.error('加载失败，请刷新重试');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (question?._id) {
      loadData();
    }
  }, [searchParams, question]);

  if (!question) {
    return <></>;
  }

  // 跳转至回答
  const doAnswer = () => {
    if (!currentUser?._id) {
      toLoginPage();
      message.warning('登录后才能写回答哦');
      return;
    }
    setAddModalVisible(true);
  };

  return (
    <>
      <div ref={topRef} />
      <Card
        className="comment-list"
        title={
          <Space size="large">
            <div>
              {question?.commentNum && question.commentNum > 0 ? question.commentNum : 0}个回答
            </div>
            <Radio.Group
              buttonStyle="solid"
              defaultValue="thumbNum"
              style={{ fontWeight: 'normal' }}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  orderKey: e.target.value,
                  pageNum: 1,
                })
              }
            >
              <Radio.Button value="thumbNum">最热</Radio.Button>
              <Radio.Button value="_createTime">最新</Radio.Button>
            </Radio.Group>
          </Space>
        }
        bodyStyle={{ paddingTop: 8 }}
        extra={
          <Button type="primary" icon={<EditOutlined />} onClick={() => doAnswer()}>
            写回答
          </Button>
        }
      >
        <List<CommentUserType>
          itemLayout="vertical"
          dataSource={list}
          loading={loading}
          renderItem={(comment) => {
            return (
              <CommentItem
                comment={comment}
                key={comment._id}
                onDelete={() => {
                  const index = list.findIndex((item) => item._id === comment._id);
                  if (index > -1) {
                    list.splice(index, 1);
                    setList([...list]);
                  }
                }}
              />
            );
          }}
          pagination={{
            pageSize: searchParams.pageSize ?? DEFAULT_PAGE_SIZE,
            current: searchParams.pageNum ?? 1,
            showSizeChanger: false,
            total,
            showTotal() {
              return `总数 ${total ?? 0}`;
            },
            onChange(pageNum, pageSize) {
              if (pageNum > 1 && !currentUser._id) {
                message.info('请您先登录');
                toLoginPage();
                return;
              }
              const params = {
                ...searchParams,
                pageSize,
                pageNum,
              };
              setSearchParams(params);
              // 回到回答区顶部
              if (topRef?.current) {
                window.scrollTo(0, topRef.current.offsetTop);
              }
            },
          }}
        />
        {/* 写新回答的模态框 */}
        {question && (
          <AddCommentModal
            questionId={question._id}
            visible={addModalVisible}
            onClose={() => setAddModalVisible(false)}
            onReload={(comment) => {
              const newCommentList = [comment, ...list];
              setList(newCommentList);
            }}
          />
        )}
      </Card>
    </>
  );
};

export default CommentList;
