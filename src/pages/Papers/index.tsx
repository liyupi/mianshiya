import React, { useEffect, useState } from 'react';
import { Button, Card, Empty, Form, List, message, Space, Input, Radio } from 'antd';
import { Link } from 'umi';
import PaperItem from '@/components/PaperItem';
import type { PaperSearchParams } from '@/services/paper';
import { searchPapers } from '@/services/paper';
import { TagsOutlined, SearchOutlined, OrderedListOutlined } from '@ant-design/icons';
import SelectTags from '@/components/SelectTags';
import { toLoginPage } from '@/utils/businessUtils';
import { useModel } from '@@/plugin-model/useModel';
import type { CurrentUser } from '@/models/user';
import { DEFAULT_PAPER_PRIORITY, STANDARD_PAPER_PRIORITY } from '@/constant/paper';
import './style.less';

interface QuestionsProps {
  match: any;
  location: {
    pathname: string;
    query: {
      q?: string;
    };
  };
}

const formItemLayout = {
  labelCol: {
    sm: {
      span: 4,
    },
    lg: {
      span: 3,
    },
    xl: {
      span: 2,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
  },
};

const DEFAULT_PAGE_SIZE = 12;

/**
 * 题目大全页
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const Papers: React.FC<QuestionsProps> = (props) => {
  const { location } = props;
  const searchText = location.query.q;
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const { tagsMap } = useModel('tag');

  const initSearchParams: PaperSearchParams = {
    name: searchText ?? '',
    pageSize: DEFAULT_PAGE_SIZE,
    pageNum: 1,
    orderKey: 'publishTime',
    priority: STANDARD_PAPER_PRIORITY,
  };

  const [searchParams, setSearchParams] = useState<PaperSearchParams>(initSearchParams);
  const [total, setTotal] = useState<number>(0);
  const [papers, setPapers] = useState<PaperType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [form] = Form.useForm();

  const doSearch = () => {
    setPapers([]);
    setLoading(true);
    searchPapers({
      ...searchParams,
      ownership: 1,
    })
      .then((res) => {
        setPapers(res.data);
        setTotal(res.total);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    window.scrollTo(0, 0);
    form.setFieldsValue(initSearchParams);
  }, [location.query.q]);

  useEffect(() => {
    doSearch();
  }, [searchParams]);

  const handleValuesChange = (changedValues: any) => {
    if (changedValues.name !== undefined) {
      return;
    }
    const params = { ...searchParams, ...changedValues, pageNum: 1 };
    setSearchParams(params);
  };

  // 登录后才允许搜索
  if (searchText !== undefined && !currentUser._id) {
    message.info('登录后才能搜索哦');
    toLoginPage();
    return <></>;
  }

  // 点击搜索按钮触发
  const handleSearch = (name: any) => {
    const params = { ...searchParams, name, pageNum: 1 };
    setSearchParams(params);
  };

  const tabListNoTitle = [
    {
      key: 'publishTime',
      tab: '最新',
    },
    {
      key: 'viewNum',
      tab: '最热',
    },
  ];

  return (
    <>
      <Card bordered={false} bodyStyle={{ paddingBottom: 0 }}>
        <Form
          {...formItemLayout}
          form={form}
          onValuesChange={handleValuesChange}
          labelAlign="left"
          colon={false}
        >
          <Form.Item
            label={
              <>
                <SearchOutlined /> <span style={{ marginLeft: 8 }}>搜索</span>
              </>
            }
            name="name"
          >
            <Input.Search
              style={{ maxWidth: 640 }}
              placeholder="输入试卷名搜索"
              enterButton
              allowClear
              onSearch={handleSearch}
            />
          </Form.Item>
          <Form.Item
            label={
              <>
                <TagsOutlined /> <span style={{ marginLeft: 8 }}>筛选</span>
              </>
            }
            name="tags"
            labelAlign="left"
          >
            <SelectTags
              allTags={tagsMap.allTags}
              groupTags={tagsMap.groupTags}
              placeholder="类别、公司、方向"
              maxTagsNumber={5}
            />
          </Form.Item>
          <Form.Item
            label={
              <>
                <OrderedListOutlined /> <span style={{ marginLeft: 8 }}>来源</span>
              </>
            }
            name="priority"
          >
            <Radio.Group buttonStyle="solid">
              <Radio.Button value={STANDARD_PAPER_PRIORITY}>官方</Radio.Button>
              <Radio.Button value={DEFAULT_PAPER_PRIORITY}>用户</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Card>
      <br />
      <Card
        tabList={tabListNoTitle}
        activeTabKey={searchParams.orderKey}
        tabBarExtraContent={
          <Link to="/addPaper">
            <Button type="primary">创建试卷</Button>
          </Link>
        }
        onTabChange={(key) => {
          setSearchParams({
            ...searchParams,
            orderKey: key,
          });
        }}
      >
        <List<PaperType>
          rowKey="_id"
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 4,
            lg: 4,
            xl: 4,
            xxl: 6,
          }}
          loading={loading}
          dataSource={papers}
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
            },
          }}
          locale={{
            emptyText: (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无试卷">
                <Space size={24}>
                  <Link to="/addPaper">
                    <Button type="primary" size="large">
                      创建试卷
                    </Button>
                  </Link>
                </Space>
              </Empty>
            ),
          }}
          renderItem={(item) => {
            return <PaperItem paper={item} key={item._id} horizontal />;
          }}
        />
      </Card>
    </>
  );
};

export default Papers;
