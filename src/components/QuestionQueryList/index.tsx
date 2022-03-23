import React, { useEffect, useState } from 'react';
import { Button, Card, Checkbox, Empty, Form, Input, List, message, Radio, Space } from 'antd';
import { Link } from 'umi';
import type { QuestionType } from '@/models/question';
import QuestionItem from '@/components/QuestionItem';
import type { QuestionSearchParams } from '@/services/question';
import { searchQuestions } from '@/services/question';
import reviewStatusEnum from '@/constant/reviewStatusEnum';
import { AppstoreAddOutlined, OrderedListOutlined, TagsOutlined } from '@ant-design/icons/lib';
import SelectTags from '@/components/SelectTags';
import { toLoginPage } from '@/utils/businessUtils';
import {
  GOOD_QUESTION_PRIORITY,
  QUESTION_DIFFICULTY_ENUM,
  QUESTION_TYPE_ENUM,
} from '@/constant/question';
import { useModel } from '@@/plugin-model/useModel';
import type { CurrentUser } from '@/models/user';
import './style.less';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
import type { GroupTagType } from '@/models/tag';
import { SearchOutlined } from '@ant-design/icons';

enum operation {
  pick = 'pick',
  delete = 'delete',
}

interface QuestionsProps {
  searchText?: string;
  tagKey?: string;
  pickedQuestions?: QuestionType[];
  pickAble?: boolean;
  pickOrDeleteQuestion?: (index: number, operation: operation) => void;
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
 * 题目查询列表
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const QuestionQueryList: React.FC<QuestionsProps> = (props) => {
  const { searchText, tagKey, pickAble } = props;
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const { tagsMap } = useModel('tag');

  const initSearchParams: QuestionSearchParams = {
    name: searchText ?? '',
    pageSize: DEFAULT_PAGE_SIZE,
    pageNum: 1,
    orderKey: searchText ? '_score' : 'publishTime',
    priority: undefined,
  };

  const [searchParams, setSearchParams] = useState<QuestionSearchParams>(initSearchParams);
  const [total, setTotal] = useState<number>(0);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [groupTags, setGroupTags] = useState<GroupTagType[]>(tagsMap.groupTags);
  const [form] = Form.useForm();

  const tabListNoTitle = [
    {
      key: 'publishTime',
      tab: '最新',
    },
    {
      key: 'viewNum',
      tab: '最热',
    },
    {
      key: 'favourNum',
      tab: '最多收藏',
    },
    {
      key: 'meetNum',
      tab: '最多被考',
    },
  ];

  const doSearch = () => {
    setQuestions([]);
    setLoading(true);
    searchQuestions({ ...searchParams, reviewStatus: reviewStatusEnum.PASS })
      .then((res) => {
        setQuestions(res.data);
        setTotal(res.total);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    window.scrollTo(0, 0);
    if (tagKey) {
      initSearchParams.tags = [tagKey];
      if (tagsMap.categoryTagsMap[tagKey]) {
        setGroupTags([
          {
            name: '推荐',
            tags: tagsMap.categoryTagsMap[tagKey].tags,
          },
          ...tagsMap.groupTags,
        ]);
      } else {
        setGroupTags(tagsMap.groupTags);
      }
    }
    setSearchParams(initSearchParams);
    form.setFieldsValue(initSearchParams);
  }, [searchText, tagKey]);

  useEffect(() => {
    doSearch();
  }, [searchParams]);

  // 登录后才允许搜索
  if (searchText !== undefined && !currentUser._id) {
    message.info('登录后才能搜索哦');
    toLoginPage();
    return <></>;
  }

  // 表单项改变
  const handleValuesChange = (changedValues: any) => {
    if (changedValues.name !== undefined) {
      return;
    }
    const params = { ...searchParams, ...changedValues, pageNum: 1 };
    setSearchParams(params);
  };

  // 多选项改变
  const handleCheckboxChange = (valueList: CheckboxValueType[]) => {
    const params = { ...searchParams, pageNum: 1 };
    params.priority = valueList.includes('priority') ? GOOD_QUESTION_PRIORITY : undefined;
    params.hasReference = valueList.includes('hasReference');
    setSearchParams(params);
  };

  // 点击搜索按钮
  const handleSearch = (name: any) => {
    const params = { ...searchParams, name, pageNum: 1 };
    setSearchParams(params);
  };

  return (
    <div className="question-query-list">
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
              placeholder="按名称搜索"
              maxLength={40}
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
              groupTags={groupTags}
              placeholder="类别、公司、方向"
              maxTagsNumber={5}
            />
          </Form.Item>
          <Form.Item
            label={
              <>
                <AppstoreAddOutlined /> <span style={{ marginLeft: 8 }}>题型</span>
              </>
            }
            name="type"
          >
            <Radio.Group buttonStyle="solid">
              {Object.keys(QUESTION_TYPE_ENUM).map((typeKey) => {
                return (
                  <Radio.Button
                    key={typeKey}
                    value={typeKey}
                    onClick={() => {
                      if (form.getFieldValue('type') == typeKey) {
                        form.setFieldsValue({
                          type: undefined,
                        });
                        setSearchParams({
                          ...searchParams,
                          type: undefined,
                        });
                      }
                    }}
                  >
                    {QUESTION_TYPE_ENUM[typeKey]}
                  </Radio.Button>
                );
              })}
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label={
              <>
                <OrderedListOutlined /> <span style={{ marginLeft: 8 }}>难度</span>
              </>
            }
            name="difficulty"
          >
            <Radio.Group buttonStyle="solid">
              {Object.keys(QUESTION_DIFFICULTY_ENUM).map((difficultyKey) => {
                return (
                  <Radio.Button
                    value={difficultyKey}
                    onClick={() => {
                      if (form.getFieldValue('difficulty') == difficultyKey) {
                        form.setFieldsValue({
                          difficulty: undefined,
                        });
                        setSearchParams({
                          ...searchParams,
                          difficulty: undefined,
                        });
                      }
                    }}
                  >
                    {QUESTION_DIFFICULTY_ENUM[difficultyKey]}
                  </Radio.Button>
                );
              })}
            </Radio.Group>
          </Form.Item>
        </Form>
      </Card>
      <br />
      <Card
        tabList={tabListNoTitle}
        activeTabKey={searchParams.orderKey}
        bodyStyle={{
          paddingTop: 8,
        }}
        tabBarExtraContent={
          <Checkbox.Group onChange={(value) => handleCheckboxChange(value)}>
            <Checkbox value="priority">精选</Checkbox>
            <Checkbox value="hasReference">有解</Checkbox>
          </Checkbox.Group>
        }
        onTabChange={(key) => {
          setSearchParams({
            ...searchParams,
            pageNum: 1,
            orderKey: key,
          });
        }}
      >
        <List<QuestionType>
          rowKey="_id"
          itemLayout="vertical"
          loading={loading}
          dataSource={questions}
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
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无题目">
                <Space size={24}>
                  <Link to="/addQuestion">
                    <Button type="primary" size="large">
                      上传题目
                    </Button>
                  </Link>
                </Space>
              </Empty>
            ),
          }}
          renderItem={(item) => {
            return <QuestionItem question={item} key={item._id} pickAble={pickAble} />;
          }}
        />
      </Card>
    </div>
  );
};

export default QuestionQueryList;
