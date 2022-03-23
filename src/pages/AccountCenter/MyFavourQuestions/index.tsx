import { Button, Card, Empty, Form, List, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'umi';
import type { QuestionType } from '@/models/question';
import type { CurrentUser } from '@/models/user';
import type { QuestionSearchParams } from '@/services/question';
import { searchUserFavourQuestions } from '@/services/question';
import SelectTags from '@/components/SelectTags';
import { useModel } from '@@/plugin-model/useModel';
import QuestionItem from '@/components/QuestionItem';

const DEFAULT_PAGE_PARAMS = {
  pageNum: 1,
  pageSize: 10,
};

/**
 * 我的收藏
 *
 * @constructor
 * @author liyupi
 */
const MyFavourQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<QuestionSearchParams>(DEFAULT_PAGE_PARAMS);

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const { tagsMap } = useModel('tag');

  /**
   * 搜索
   */
  const doSearch = async () => {
    setLoading(true);
    const res = await searchUserFavourQuestions(currentUser, searchParams);
    if (res) {
      setTotal(res.total);
      setQuestions(res.data);
    } else {
      message.error('加载数据失败，请刷新重试');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentUser._id) {
      doSearch();
    }
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [searchParams]);

  return (
    <Card title={`我的收藏（${total}）`}>
      <Form
        onValuesChange={async (values) => {
          setSearchParams({
            ...values,
            ...DEFAULT_PAGE_PARAMS,
          });
        }}
      >
        <Form.Item name="tags">
          <SelectTags
            allTags={tagsMap.allTags}
            groupTags={tagsMap.groupTags}
            placeholder="支持按标签搜索"
          />
        </Form.Item>
      </Form>
      <div style={{ marginTop: 16 }} />
      <List<QuestionType>
        itemLayout="vertical"
        loading={loading}
        pagination={{
          showSizeChanger: false,
          pageSize: searchParams.pageSize ?? DEFAULT_PAGE_PARAMS.pageSize,
          current: searchParams.pageNum ?? DEFAULT_PAGE_PARAMS.pageNum,
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
        dataSource={questions}
        renderItem={(item) => {
          return <QuestionItem question={item} />;
        }}
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="您还没有收藏的题目哦">
              <Link to="/recommend">
                <Button type="primary" size="large">
                  探索题目
                </Button>
              </Link>
            </Empty>
          ),
        }}
      />
    </Card>
  );
};

export default MyFavourQuestions;
