import { Empty, List, message } from 'antd';
import React, { useEffect, useState } from 'react';
import type { QuestionType } from '@/models/question';
import type { QuestionSearchParams } from '@/services/question';
import { searchQuestions } from '@/services/question';
import QuestionItem from '@/components/QuestionItem';
import type { PageSearchParams } from '@/services/common';
import './style.less';

interface QuestionListProps {
  searchParams: QuestionSearchParams;
}

const DEFAULT_PAGE_PARAMS = {
  pageNum: 1,
  pageSize: 4,
};

/**
 * 题目列表组件
 * @constructor
 * @author yupi
 */
const QuestionList: React.FC<QuestionListProps> = (props) => {
  const { searchParams } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<QuestionType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [pageSearchParams, setPageSearchParams] = useState<PageSearchParams>(DEFAULT_PAGE_PARAMS);

  const loadData = async () => {
    setLoading(true);
    const res = await searchQuestions({
      ...searchParams,
      ...pageSearchParams,
    });
    if (res) {
      setList(res.data);
      setTotal(res.total);
    } else {
      message.error('查询相似题目列表失败');
    }
    setLoading(false);
  };

  // 修改题目
  useEffect(() => {
    loadData();
  }, [searchParams, pageSearchParams]);

  return (
    <List<QuestionType>
      rowKey="_id"
      itemLayout="vertical"
      dataSource={list}
      loading={loading}
      renderItem={(item, index) => <QuestionItem index={index} key={item._id} question={item} />}
      pagination={{
        pageSize: pageSearchParams.pageSize ?? DEFAULT_PAGE_PARAMS.pageSize,
        current: pageSearchParams.pageNum ?? DEFAULT_PAGE_PARAMS.pageNum,
        showSizeChanger: false,
        total,
        onChange: (pageNum, pageSize) => {
          const params = {
            pageSize,
            pageNum,
          };
          setPageSearchParams(params);
        },
      }}
      locale={{
        emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无题目" />,
      }}
    />
  );
};

export default QuestionList;
