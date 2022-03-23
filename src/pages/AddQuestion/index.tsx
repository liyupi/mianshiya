import { Button, Card, Col, Form, Input, message, Radio, Row } from 'antd';
import { history } from 'umi';
import React, { useEffect, useState } from 'react';
import type { CurrentUser } from '@/models/user';
import type { QuestionType } from '@/models/question';
import type { QuestionSearchParams } from '@/services/question';
import { addQuestion, getQuestion, updateQuestion } from '@/services/question';
import reviewStatusEnum from '@/constant/reviewStatusEnum';
import { NoAuth } from '@/components/NoAuth';
import SelectTags from '@/components/SelectTags';
import RichTextEditor from '@/components/RichTextEditor';
import AddSingleOptions from '@/components/AddSingleOptions';
import AddMultipleOptions from '@/components/AddMultipleOptions';
import { useModel } from '@@/plugin-model/useModel';
import { QUESTION_DIFFICULTY_ENUM, QUESTION_TYPE_ENUM } from '@/constant/question';
import { toNumber } from 'lodash';
import BraftEditor from 'braft-editor';
import { useAccess } from '@@/plugin-access/access';
import QuestionList from '@/components/QuestionList';
import './style.less';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 5,
    },
    md: {
      span: 4,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 19,
    },
    md: {
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
      offset: 5,
    },
    md: {
      span: 8,
      offset: 4,
    },
    lg: {
      span: 7,
      offset: 4,
    },
  },
};

/**
 * 添加或修改题目
 * @constructor
 */
const AddQuestion: React.FC = () => {
  const [form] = Form.useForm();
  const questionId = history.location.query?.rid as string;
  const [disabled, setDisabled] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formValue, setFormValue] = useState<Partial<QuestionType>>({});
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const { tagsMap } = useModel('tag');
  const [similarSearchParams, setSimilarSearchParams] = useState<QuestionSearchParams>();
  const access = useAccess();

  const loadData = async () => {
    if (currentUser._id && questionId) {
      const res = await getQuestion(questionId);
      if (!res) {
        message.error('加载失败，请刷新重试');
        return;
      }
      if (res.userId !== currentUser._id && !access.canAdmin) {
        message.error('只能修改自己的题目');
        setDisabled(true);
        return;
      }
      form.setFieldsValue(res);
    }
  };

  // 修改题目
  useEffect(() => {
    loadData();
  }, [questionId, currentUser]);

  const doSubmit = async (values: Record<string, any>) => {
    if (!currentUser || !currentUser._id) {
      message.error('提交失败，请刷新页面重试！');
      return;
    }
    if (!BraftEditor.createEditorState(values.detail).toText().trim()) {
      message.error('请输入题目信息');
      return;
    }
    if (!BraftEditor.createEditorState(values.reference).toText().trim()) {
      values.reference = '';
    }
    values.userId = currentUser._id;
    values.reviewStatus = reviewStatusEnum.REVIEWING;
    setSubmitting(true);
    // 修改
    if (questionId) {
      const result = await updateQuestion(questionId, values);
      if (result) {
        history.replace({
          pathname: '/addSucceed',
          query: {
            rid: questionId,
          },
        });
      } else {
        message.error('修改失败，请刷新页面重试！');
      }
    } else {
      // 新增
      const rid = await addQuestion(values as QuestionType);
      if (rid) {
        history.replace({
          pathname: '/addSucceed',
          query: {
            rid,
          },
        });
      } else {
        message.error('提交失败，请刷新页面重试！');
      }
    }
    setSubmitting(false);
  };

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

  // 题目类型选项组
  const typeRadioGroupOptions = Object.keys(QUESTION_TYPE_ENUM).map((key) => {
    return {
      label: QUESTION_TYPE_ENUM[key],
      value: toNumber(key),
    };
  });

  return currentUser._id ? (
    <Row gutter={[24, 24]}>
      <Col lg={16} sm={24}>
        <Card
          title="上传题目"
          extra={
            <span>
              欢迎分享面试题，
              <a href="https://docs.qq.com/doc/DUGF6V0xKSG9Mamps" target="_blank" rel="noreferrer">
                获取积分
              </a>
            </span>
          }
          bordered={false}
        >
          <Form
            style={{
              marginTop: 8,
            }}
            form={form}
            name="question"
            {...formItemLayout}
            labelAlign="left"
            onValuesChange={(value, allValue) => {
              setFormValue(allValue);
            }}
            scrollToFirstError
            onFinish={doSubmit}
            initialValues={{
              type: 0,
              difficulty: 0,
            }}
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
                  return <Radio value={toNumber(key)}>{QUESTION_DIFFICULTY_ENUM[key]}</Radio>;
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
                maxTagsNumber={5}
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
            <FormItem
              {...submitFormLayout}
              style={{
                marginTop: 32,
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
                disabled={submitting || disabled}
              >
                {submitting ? '提交中' : '提交'}
              </Button>
            </FormItem>
          </Form>
        </Card>
      </Col>
      <Col lg={8} xs={24}>
        <Card title="相似题目（请勿重复上传）" bodyStyle={{ paddingTop: 12 }}>
          {similarSearchParams?.name?.trim() ? (
            <QuestionList searchParams={similarSearchParams} />
          ) : (
            <div>输入题目后将自动检测</div>
          )}
        </Card>
      </Col>
    </Row>
  ) : (
    <NoAuth />
  );
};

export default AddQuestion;
