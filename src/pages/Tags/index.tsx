import React, { useEffect, useState } from 'react';
import { Button, Col, Input, List, message, Row } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import type { TagSearchParams } from '@/services/tag';
import { searchTags } from '@/services/tag';
import TagCard from '@/components/TagCard';
import { useModel } from '@@/plugin-model/useModel';
import type { TagType } from '@/models/tag';
import MyInterestUpdateModal from '@/components/MyInterestUpdateModal';
import './style.less';

const listGrid = {
  gutter: 16,
  xs: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 4,
  xxl: 4,
};

const DEFAULT_PAGE_SIZE = 20;

/**
 * 标签大全列表页
 *
 * @constructor
 * @author liyupi
 */
const Topics: React.FC = () => {
  const initSearchParams: TagSearchParams = {
    name: '',
    pageSize: DEFAULT_PAGE_SIZE,
    pageNum: 1,
  };

  const [total, setTotal] = useState<number>(0);
  const [list, setList] = useState<TagType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { tagsMap } = useModel('tag');
  const [searchParams, setSearchParams] = useState<TagSearchParams>(initSearchParams);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const loadData = async () => {
    if (!tagsMap.allTags) {
      return;
    }
    setLoading(true);
    const res = await searchTags(searchParams, tagsMap.allTags);
    if (res) {
      const newDataList = [...list, ...res.data];
      setList(newDataList);
      setTotal(res.total);
    } else {
      message.error('加载失败，请刷新重试');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [searchParams, tagsMap]);

  // 点击搜索按钮触发
  const handleSearch = (name: any) => {
    const params = { ...searchParams, name, pageNum: 1 };
    setList([]);
    setSearchParams(params);
  };

  // 加载更多
  const onLoadMore = () => {
    const pageNum = (searchParams.pageNum ?? 1) + 1;
    setSearchParams({
      ...searchParams,
      pageNum,
    });
  };

  const loadMore =
    list.length < total ? (
      <div
        style={{
          textAlign: 'center',
          marginTop: 16,
        }}
      >
        <Button type="primary" onClick={onLoadMore}>
          加载更多
        </Button>
      </div>
    ) : null;

  return (
    <PageContainer
      title="标签大全"
      content={
        <Row justify="space-between">
          <Col>
            <Input.Search placeholder="搜索标签" size="large" enterButton onSearch={handleSearch} />
          </Col>
          <Col>
            <Button type="primary" size="large" onClick={() => setModalVisible(true)}>
              我关注的
            </Button>
          </Col>
        </Row>
      }
    >
      <List<TagType>
        loading={loading}
        dataSource={list}
        loadMore={loadMore}
        grid={listGrid}
        renderItem={(item) => {
          return (
            <List.Item key={item}>
              <TagCard tag={item} loading={loading} />
            </List.Item>
          );
        }}
      />
      <MyInterestUpdateModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </PageContainer>
  );
};

export default Topics;
