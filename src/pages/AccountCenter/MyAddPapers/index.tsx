import { Button, Card, Empty, List, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link } from 'umi';
import PaperItem from '@/components/PaperItem';
import type { PaperSearchParams } from '@/services/paper';
import { searchPapers } from '@/services/paper';
import type { CurrentUser } from '@/models/user';
import { LightFilter, ProFormSelect } from '@ant-design/pro-form';
import { useModel } from '@@/plugin-model/useModel';
import { PAPER_OWNERSHIP_ENUM } from '@/constant/paper';
import { parseInt } from 'lodash';

const DEFAULT_PAGE_PARAMS = {
  pageNum: 1,
  pageSize: 10,
};

/**
 * 我的试卷页
 *
 * @author liyupi
 */
const MyAddPapers: React.FC = () => {
  const [list, setList] = useState<PaperType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useState<PaperSearchParams>(DEFAULT_PAGE_PARAMS);
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
    const queryParams = { ...searchParams, userId: currentUser._id };
    const res = await searchPapers(queryParams);
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
    <Card title={`我的试卷（${total}）`}>
      <LightFilter
        bordered
        onFinish={async (values) => {
          if (values.ownership) {
            values.ownership = parseInt(values.ownership);
          }
          const params = {
            ...searchParams,
            ...values,
          };
          setSearchParams(params);
        }}
      >
        <ProFormSelect name="ownership" placeholder="范围" valueEnum={PAPER_OWNERSHIP_ENUM} />
      </LightFilter>
      <div style={{ marginTop: 16 }} />
      <List<PaperType>
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
            <PaperItem
              paper={item}
              showReview
              showEdit
              showActions
              onReload={() => setRefresh(!refresh)}
            />
          );
        }}
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="您还没有上传过试卷哦">
              <Link to="/addPaper">
                <Button type="primary" size="large">
                  上传试卷
                </Button>
              </Link>
            </Empty>
          ),
        }}
      />
    </Card>
  );
};

export default MyAddPapers;
