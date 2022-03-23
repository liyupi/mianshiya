import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Radio,
  Row,
} from 'antd';
import React, { useEffect, useState } from 'react';
import type { QuestionType } from '@/models/question';
import {
  getQuestion,
  QuestionSearchParams,
  reviewQuestion,
  searchQuestionsByPage,
  updateQuestion,
} from '@/services/question';
import { history } from 'umi';
import reviewStatusEnum, {
  REVIEW_STATUS_MAP,
  reviewStatusInfoMap,
} from '@/constant/reviewStatusEnum';
import { NoAuth } from '@/components/NoAuth';
import { LightFilter, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { formatDateTimeStr, formatPartDateTimeStr } from '@/utils/utils';
import { getUserSimpleInfo } from '@/services/user';
import SelectTags from '@/components/SelectTags';
import QuestionRejectModal from '@/components/QuestionRejectModal';
import { useModel } from '@@/plugin-model/useModel';
import { useAccess } from '@@/plugin-access/access';
import type { CurrentUser, SimpleUser } from '@/models/user';
import RichTextEditor from '@/components/RichTextEditor';
import AddSingleOptions from '@/components/AddSingleOptions';
import AddMultipleOptions from '@/components/AddMultipleOptions';
import { QUESTION_DIFFICULTY_ENUM, QUESTION_TYPE_ENUM } from '@/constant/question';
import { toNumber } from 'lodash';
import BraftEditor from 'braft-editor';
import { DEFAULT_AVATAR } from '@/constant';
import { getQuestionTitle } from '@/utils/businessUtils';
import { TagType } from '@/models/tag';
import CommentList from '@/pages/QuestionDetail/components/CommentList';
import QuestionList from '@/components/QuestionList';

const FormItem = Form.Item;

const DEFAULT_PAGE_SIZE = 10;

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 4,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 20,
    },
  },
};

const submitFormLayout = {
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
      offset: 4,
    },
  },
};

/**
 * 题目管理
 *
 * @constructor
 */
const ManageQuestion: React.FC = () => {
  const [total, setTotal] = useState<number>(0);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formValue, setFormValue] = useState<Partial<QuestionType>>({});
  const [user, setUser] = useState<SimpleUser>();
  const [questionId, setQuestionId] = useState<string>(history.location.query?.id as string);
  const [currQuestion, setCurrQuestion] = useState<QuestionType>();
  const [commentDrawerVisible, setCommentDrawerVisible] = useState<boolean>(false);
  const [similarSearchParams, setSimilarSearchParams] = useState<QuestionSearchParams>();

  const [form] = Form.useForm();

  const { tagsMap } = useModel('tag');
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const access = useAccess();

  // 搜否可以访问该页面
  let canVisit = false;
  // 管理员可访问
  if (access.canAdmin) {
    canVisit = true;
  }
  // 版主拥有的标签权限
  const extraAuthorityTags = currentUser.extraAuthority?.tags ?? [];
  // 有对应标签权限也可访问
  if (extraAuthorityTags.length > 0) {
    canVisit = true;
  }
  // 版主只可见部分标签
  const allTags = access.canAdmin ? tagsMap.allTags : extraAuthorityTags;
  const groupTags = access.canAdmin
    ? tagsMap.groupTags
    : [{ name: '推荐', tags: extraAuthorityTags }];

  let defaultOrTags: TagType[] = [];
  // 默认为版主填充或标签
  if (!access.canAdmin) {
    defaultOrTags = extraAuthorityTags;
  }

  const [searchParams, setSearchParams] = useState<QuestionSearchParams>({
    reviewStatus: reviewStatusEnum.REVIEWING,
    orTags: extraAuthorityTags,
    pageSize: DEFAULT_PAGE_SIZE,
    orderKey: '_createTime',
  });

  const loadData = async () => {
    if (currentUser._id && questionId) {
      form.resetFields();
      const res = await getQuestion(questionId);
      if (!res) {
        message.error('加载失败，请刷新重试');
        return;
      }
      setCurrQuestion(res);
      form.setFieldsValue(res);
      const userRes = await getUserSimpleInfo(res.userId);
      setUser(userRes);
    }
  };

  useEffect(() => {
    if (canVisit) {
      searchQuestionsByPage(searchParams)
        .then((res) => {
          setQuestions(res.data);
          setTotal(res.total);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [searchParams, canVisit]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, [questionId, currentUser]);

  /**
   * 相似检测
   * @param text
   */
  const doSimilarSearch = async (text: string) => {
    setSimilarSearchParams({
      name: text,
      reviewStatus: reviewStatusEnum.PASS,
      type: form.getFieldValue('type'),
    });
  };

  const doSubmit = async (values: Record<string, any>) => {
    if (!currentUser._id) {
      message.error('提交失败，请刷新页面重试！');
      return;
    }
    if (!questionId) {
      return;
    }
    if (!BraftEditor.createEditorState(values.reference)?.toText()) {
      values.reference = '';
    }
    setSubmitting(true);
    const res = await updateQuestion(questionId, values);
    if (res) {
      message.success('更新成功');
    } else {
      message.error('更新失败');
    }
    setSubmitting(false);
  };

  const onValuesChange = (changedValues: Record<string, any>, allValues: Record<string, any>) => {
    setFormValue(allValues);
  };

  const doPassReview = () => {
    if (!currentUser._id) {
      message.warning('请先登录');
      return;
    }
    setSubmitting(true);
    reviewQuestion(questionId, form.getFieldValue('score'), reviewStatusEnum.PASS)
      .then((res) => {
        if (res) {
          message.success('已通过');
        } else {
          message.error('操作失败');
        }
      })
      .finally(() => setSubmitting(false));
  };

  const doRejectReview = () => {
    setShowRejectModal(true);
  };

  // 题目类型选项组
  const typeRadioGroupOptions = Object.keys(QUESTION_TYPE_ENUM).map((key) => {
    return {
      label: QUESTION_TYPE_ENUM[key],
      value: toNumber(key),
    };
  });

  const questionFilter = (
    <LightFilter
      collapse
      bordered
      labelAlign="left"
      initialValues={{
        reviewStatus: reviewStatusEnum.REVIEWING.toString(),
        orTags: defaultOrTags,
      }}
      onFinish={async (values) => {
        if (values.reviewStatus) {
          values.reviewStatus = parseInt(values.reviewStatus, 10);
        }
        setSearchParams({ ...searchParams, ...values, pageNum: 1 });
      }}
    >
      <ProFormText name="name" label="题目名" />
      <ProFormSelect name="reviewStatus" label="审核状态" valueEnum={REVIEW_STATUS_MAP} />
      <ProFormText name="userId" label="用户id" />
      {access.canAdmin && (
        <FormItem label="与标签" name="tags">
          <SelectTags allTags={allTags} groupTags={groupTags} />
        </FormItem>
      )}
      <FormItem label="或标签" name="orTags">
        <SelectTags allTags={allTags} groupTags={groupTags} disabled={!access.canAdmin} />
      </FormItem>
    </LightFilter>
  );

  return canVisit ? (
    <>
      <Row gutter={[24, 24]}>
        <Col md={5} xs={24}>
          <Card title="题目列表（点右边筛选）" extra={questionFilter}>
            <List<QuestionType>
              rowKey="_id"
              loading={loading}
              dataSource={questions}
              pagination={{
                pageSize: DEFAULT_PAGE_SIZE,
                current: searchParams.pageNum ?? 1,
                showSizeChanger: false,
                showQuickJumper: true,
                total,
                showTotal() {
                  return `总数 ${total}`;
                },
                onChange(pageNum) {
                  const params = {
                    ...searchParams,
                    pageNum,
                  };
                  setSearchParams(params);
                },
              }}
              renderItem={(item) => {
                const reviewStatusInfo = reviewStatusInfoMap[item.reviewStatus];
                return (
                  <List.Item key={item._id}>
                    <List.Item.Meta
                      title={
                        <a
                          style={{ color: reviewStatusInfo.color }}
                          onClick={() => setQuestionId(item._id)}
                        >
                          {'题目：' + getQuestionTitle(item)}
                        </a>
                      }
                      description={formatPartDateTimeStr(item._createTime)}
                    />
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>
        <Col md={13} xs={24}>
          <Card
            title="题目信息 / 修改"
            key={questionId}
            extra={
              currQuestion && (
                <Button type="primary" size="small" onClick={() => setCommentDrawerVisible(true)}>
                  查看回答
                </Button>
              )
            }
          >
            <Form
              style={{
                marginTop: 8,
              }}
              form={form}
              name="question"
              {...formItemLayout}
              labelAlign="left"
              initialValues={{
                score: 5,
              }}
              scrollToFirstError
              onFinish={doSubmit}
              onValuesChange={onValuesChange}
            >
              <FormItem
                label="题型"
                name="type"
                rules={[
                  {
                    required: true,
                    message: '请选择题目类型',
                  },
                ]}
              >
                <Radio.Group options={typeRadioGroupOptions} />
              </FormItem>
              <FormItem
                label="难度"
                name="difficulty"
                rules={[
                  {
                    required: true,
                    message: '请选择题目难度',
                  },
                ]}
              >
                <Radio.Group>
                  {Object.keys(QUESTION_DIFFICULTY_ENUM).map((key) => {
                    return (
                      <Radio key={key} value={toNumber(key)}>
                        {QUESTION_DIFFICULTY_ENUM[key]}
                      </Radio>
                    );
                  })}
                </Radio.Group>
              </FormItem>
              <FormItem
                label="标签"
                name="tags"
                rules={[
                  {
                    required: true,
                    message: '至少填写 1 个标签',
                  },
                  {
                    max: 5,
                    type: 'array',
                    message: '至多选择 5 个标签',
                  },
                ]}
              >
                <SelectTags
                  allTags={tagsMap.allTags}
                  groupTags={tagsMap.groupTags}
                  maxTagsNumber={20}
                />
              </FormItem>
              <FormItem
                label="题目"
                name="detail"
                rules={[
                  {
                    required: true,
                    message: '请完善题目',
                  },
                ]}
              >
                {/* @ts-ignore */}
                <RichTextEditor
                  placeholder="请输入题目内容，尽量准确清晰，不用刻意加粗"
                  onBlur={(_, __, editor) => {
                    // 相似检测
                    doSimilarSearch(editor.getText());
                  }}
                />
              </FormItem>
              {formValue.type === 1 ? (
                <FormItem label="题目选项" name="params">
                  <AddSingleOptions />
                </FormItem>
              ) : null}
              {formValue.type === 2 ? (
                <FormItem label="题目选项" name="params">
                  <AddMultipleOptions />
                </FormItem>
              ) : null}
              <FormItem label="参考题解" name="reference">
                {/* @ts-ignore */}
                <RichTextEditor placeholder="请输入参考题解，可不填" />
              </FormItem>
              <FormItem label="标题备注" name="name">
                <Input placeholder="建议用题目考察要点命名，可不填" maxLength={100} allowClear />
              </FormItem>
              <FormItem label="优先级" name="priority">
                <InputNumber min={0} placeholder="999 表示加精" />
              </FormItem>
              <FormItem label="奖励积分" name="score">
                <InputNumber min={0} max={8} />
              </FormItem>
              <FormItem
                {...submitFormLayout}
                style={{
                  marginTop: 32,
                }}
              >
                <Row gutter={24}>
                  <Col span={6}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      ghost
                      block
                      loading={submitting}
                      disabled={submitting || !questionId}
                    >
                      {submitting ? '操作中' : '修改'}
                    </Button>
                  </Col>
                  <Col span={6}>
                    <Button
                      type="primary"
                      block
                      loading={submitting}
                      disabled={submitting || !questionId}
                      onClick={doPassReview}
                    >
                      {submitting ? '操作中' : '通过'}
                    </Button>
                  </Col>
                  <Col span={6}>
                    <Button
                      type="primary"
                      danger
                      block
                      loading={submitting}
                      disabled={submitting || !questionId}
                      onClick={doRejectReview}
                    >
                      {submitting ? '操作中' : '拒绝'}
                    </Button>
                  </Col>
                </Row>
              </FormItem>
            </Form>
          </Card>
        </Col>
        <Col md={6} xs={24}>
          <Card title="题目信息" bodyStyle={{ paddingBottom: 12 }}>
            {currQuestion ? (
              <Descriptions column={1}>
                <Descriptions.Item label="推荐人">
                  <Avatar src={user?.avatarUrl || DEFAULT_AVATAR} style={{ marginRight: 5 }} />
                  {user?.nickName}
                </Descriptions.Item>
                <Descriptions.Item label="浏览数">{currQuestion.viewNum}</Descriptions.Item>
                <Descriptions.Item label="回答数">{currQuestion.commentNum}</Descriptions.Item>
                <Descriptions.Item label="收藏数">{currQuestion.favourNum}</Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {formatDateTimeStr(currQuestion._createTime)}
                </Descriptions.Item>
                <Descriptions.Item label="修改时间">
                  {formatDateTimeStr(currQuestion._updateTime)}
                </Descriptions.Item>
                <Descriptions.Item label="审核时间">
                  {formatDateTimeStr(currQuestion.reviewTime)}
                </Descriptions.Item>
                <Descriptions.Item label="发布时间">
                  {formatDateTimeStr(currQuestion.publishTime)}
                </Descriptions.Item>
                <Descriptions.Item label="审核信息">{currQuestion.reviewMessage}</Descriptions.Item>
              </Descriptions>
            ) : (
              '请在最左侧列表点击题目'
            )}
          </Card>
          <Card title="相似题目（请勿重复上传）" style={{ marginTop: 24 }} bodyStyle={{ paddingTop: 12 }}>
            {similarSearchParams?.name?.trim() ? (
              <QuestionList searchParams={similarSearchParams} />
            ) : (
              <div>输入题目后将自动检测</div>
            )}
          </Card>
        </Col>
      </Row>
      <QuestionRejectModal
        visible={showRejectModal}
        questionId={questionId}
        onClose={() => setShowRejectModal(false)}
      />
      {currQuestion && (
        <Drawer
          title="回答列表"
          placement="right"
          width="80%"
          contentWrapperStyle={{ maxWidth: 800 }}
          onClose={() => setCommentDrawerVisible(false)}
          visible={commentDrawerVisible}
        >
          <CommentList question={currQuestion} />
        </Drawer>
      )}
    </>
  ) : (
    <NoAuth />
  );
};

export default ManageQuestion;
