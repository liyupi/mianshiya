import { Button, Card, Empty, List, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'umi';
import type { QuestionType } from '@/models/question';
import QuestionItem from '@/components/QuestionItem';
import type { QuestionSearchParams } from '@/services/question';
import { searchQuestionsByPage } from '@/services/question';
import type { CurrentUser } from '@/models/user';
import { LightFilter, ProFormSelect } from '@ant-design/pro-form';
import { REVIEW_STATUS_MAP } from '@/constant/reviewStatusEnum';
import { useModel } from '@@/plugin-model/useModel';
import { QUESTION_DIFFICULTY_ENUM, QUESTION_TYPE_ENUM } from '@/constant/question';
import { parseInt } from 'lodash';

const DEFAULT_PAGE_PARAMS = {
  pageNum: 1,
  pageSize: 10,
};

/**
 * 我的题目页
 *
 * @author liyupi
 */
const MyAddQuestions: React.FC = () => {
  const [list, setList] = useState<QuestionType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useState<QuestionSearchParams>(DEFAULT_PAGE_PARAMS);
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
    const queryParams = { ...searchParams, userId: currentUser._id, orderKey: '_createTime' };
    const res = await searchQuestionsByPage(queryParams);
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
    <Card title={`上传记录（${total}）`}>
      <LightFilter
        bordered
        onFinish={async (values) => {
          if (values.reviewStatus) {
            // eslint-disable-next-line radix
            values.reviewStatus = parseInt(values.reviewStatus);
          }
          if (values.type) {
            values.type = parseInt(values.type);
          }
          if (values.difficulty) {
            values.difficulty = parseInt(values.difficulty);
          }
          const params = {
            ...DEFAULT_PAGE_PARAMS,
            ...values,
          };
          setSearchParams(params);
        }}
      >
        <ProFormSelect name="reviewStatus" placeholder="题目状态" valueEnum={REVIEW_STATUS_MAP} />
        <ProFormSelect name="type" placeholder="题型" valueEnum={QUESTION_TYPE_ENUM} />
        <ProFormSelect name="difficulty" placeholder="难度" valueEnum={QUESTION_DIFFICULTY_ENUM} />
      </LightFilter>
      <div style={{ marginTop: 16 }} />
      <List<QuestionType>
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
        renderItem={(item) => {
          return (
            <QuestionItem
              question={item}
              showReview
              showEdit
              showActions
              onReload={() => setRefresh(!refresh)}
            />
          );
        }}
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="您还没有上传过题目哦">
              <Link to="/addQuestion">
                <Button type="primary" size="large">
                  上传题目
                </Button>
              </Link>
            </Empty>
          ),
        }}
      />
    </Card>
  );
};

export default MyAddQuestions;
