import { Button, Card, Empty, List, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'umi';
import type { CommentSearchParams } from '@/services/comment';
import { searchComments } from '@/services/comment';
import type { CurrentUser } from '@/models/user';
import { useModel } from '@@/plugin-model/useModel';
import CommentItem from '@/components/CommentItem';
import type { CommentUserType } from '@/models/comment';

const DEFAULT_PAGE_PARAMS = {
  pageNum: 1,
  pageSize: 10,
};

/**
 * 我的回答页
 *
 * @author liyupi
 */
const MyAddComments: React.FC = () => {
  const [list, setList] = useState<CommentUserType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useState<CommentSearchParams>(DEFAULT_PAGE_PARAMS);
  const [refresh, setRefresh] = useState<boolean>(true);

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};

  /**
   * 搜索
   */
  const doSearch = async () => {
    if (!currentUser._id) {
      return;
    }
    setLoading(true);
    const queryParams = { ...searchParams, userId: currentUser._id, getQuestion: true };
    const res = await searchComments(queryParams);
    if (res) {
      setTotal(res.total);
      setList(res.data);
    } else {
      message.error('加载数据失败，请刷新重试');
    }
    setLoading(false);
  };

  useEffect(() => {
    doSearch();
  }, [searchParams, refresh]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchParams]);

  return (
    <Card title={`我的回答（${total}）`} bodyStyle={{ paddingTop: 0 }}>
      <List<CommentUserType>
        itemLayout="vertical"
        loading={loading}
        pagination={{
          pageSize: searchParams.pageSize ?? DEFAULT_PAGE_PARAMS.pageSize,
          current: searchParams.pageNum ?? DEFAULT_PAGE_PARAMS.pageNum,
          showSizeChanger: false,
          total,
          onChange: (pageNum, pageSize) => {
            const params = {
              ...searchParams,
              pageSize,
              pageNum,
            };
            setSearchParams(params);
          },
        }}
        dataSource={list}
        renderItem={(comment) => {
          return (
            <CommentItem
              comment={comment}
              key={comment._id}
              showQuestion
              onDelete={() => setRefresh(!refresh)}
            />
          );
        }}
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="您还没有写过回答哦">
              <Link to="/questions">
                <Button type="primary" size="large">
                  去回答问题
                </Button>
              </Link>
            </Empty>
          ),
        }}
      />
    </Card>
  );
};

export default MyAddComments;
