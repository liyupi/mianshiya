import React, { useEffect, useState } from 'react';
import { Affix, Button, Card, Col, Form, Input, message, Radio, Row, Space, Steps } from 'antd';
import SelectTags from '@/components/SelectTags';
import { history, useDispatch, useSelector } from 'umi';
import { toLoginPage } from '@/utils/businessUtils';
import QuestionQueryList from '@/components/QuestionQueryList';
import PickedQuestionList from '@/components/PickedQuestionList';
import PaperDetailCard from '@/components/PaperDetailCard';
import { useModel } from '@@/plugin-model/useModel';
import type { CurrentUser } from '@/models/user';
import { addPaper, getPaper, updatePaper } from '@/services/paper';
import type { QuestionType } from '@/models/question';
import './style.less';

const { Step } = Steps;

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
      span: 16,
    },
    md: {
      span: 12,
    },
  },
};

/**
 * 添加试卷
 * @constructor
 */
const AddPaper: React.FC = () => {
  const { pickedQuestions } = useSelector((state) => state.editPaper);
  const paperId = history.location.query?.rid as string;
  const [form] = Form.useForm();
  const [paperInfo, setPaperInfo] = useState({});
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { tagsMap } = useModel('tag');

  const dispatch = useDispatch();
  const setPickedQuestions = (q: Record<number, QuestionType[]>) =>
    dispatch({
      type: 'editPaper/setPickedQuestions',
      payload: q,
    });
  // 编辑的时候获取试卷信息
  const loadData = async () => {
    console.log(paperId);
    if (!paperId) {
      return;
    }
    setLoading(true);
    const res = await getPaper(paperId);
    if (res) {
      console.log(res);
      form.setFieldsValue(res);
      setPickedQuestions(res.questions);
    } else {
      message.error('题目加载失败，请刷新重试');
    }
    setLoading(false);
  };
  useEffect(() => {
    loadData();
  }, [paperId]);

  // 登录后才允许搜索
  if (!currentUser._id) {
    message.info('登录后才能创建试卷哦');
    toLoginPage();
    return <></>;
  }

  // 只存储问题 id
  let paperCount = 0;
  const parseQuestions = () => {
    const res = {};
    for (const key in pickedQuestions) {
      res[key] = pickedQuestions[key].map((q: QuestionType) => {
        return q._id;
      });
      paperCount += pickedQuestions[key].length;
    }
    return res;
  };
  const _addPaper = async () => {
    setLoading(true);
    const values = {
      ...paperInfo,
      userId: currentUser._id,
      questions: parseQuestions(),
    };
    if (paperCount < 3) {
      setLoading(false);
      message.error('题目数量需要大于3道！');
      return;
    }

    // 修改
    if (paperId) {
      const result = await updatePaper(paperId, values as PaperType);
      if (result) {
        history.replace({
          pathname: '/addPaperSucceed',
          query: {
            rid: paperId,
          },
        });
      } else {
        message.error('修改失败，请刷新页面重试！');
      }
    } else {
      const rid = await addPaper(values as PaperType);

      if (rid) {
        history.replace({
          pathname: '/addPaperSucceed',
          query: {
            rid,
          },
        });
      } else {
        message.error('提交失败，请刷新页面重试！');
      }
    }
    setLoading(false);
  };
  const nextStep = () => {
    form
      .validateFields()
      .then((values) => {
        setPaperInfo(values);
        if (step === 2) {
          _addPaper();
        } else {
          setStep(step + 1);
        }
      })
      .catch((errorInfo) => {
        console.log(errorInfo);
      });
  };
  const prevStep = () => {
    setStep(step - 1);
  };

  const changeStep = (newStep: number) => {
    if (newStep < step) {
      setStep(newStep);
    }
  };

  return (
    <div>
      <div className="steps">
        <Steps current={step} onChange={changeStep}>
          <Step title="试卷信息" />
          <Step title="选择题目" />
          <Step title="浏览试卷" />
          <Step title="完成" />
        </Steps>
      </div>

      <div style={{ display: step === 0 ? '' : 'none' }}>
        <Card bordered={false} bodyStyle={{ paddingBottom: 0 }}>
          <Form
            style={{
              marginTop: 8,
            }}
            form={form}
            name="paper"
            {...formItemLayout}
            labelAlign="left"
            scrollToFirstError
            initialValues={{
              ownership: 0,
            }}
          >
            <FormItem
              label="名称"
              name="name"
              rules={[
                {
                  required: true,
                  message: '请输入试卷名称',
                },
              ]}
            >
              <Input placeholder="如：腾讯前端一面" maxLength={40} allowClear />
            </FormItem>
            <FormItem label="描述" name="detail">
              <Input.TextArea
                placeholder="请对试卷进行简单描述"
                showCount
                maxLength={400}
                allowClear
              />
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
              label="权限"
              name="ownership"
              rules={[
                {
                  required: true,
                  message: '请选择权限',
                },
              ]}
            >
              <Radio.Group>
                <Radio value={0}>私有</Radio>
                <Radio value={1}>公开</Radio>
              </Radio.Group>
            </FormItem>
          </Form>
        </Card>
      </div>
      <div style={{ display: step === 1 ? '' : 'none' }}>
        <Row gutter={24}>
          <Col span={16}>
            <QuestionQueryList pickedQuestions={pickedQuestions} pickAble />
          </Col>
          <Col span={8}>
            <PickedQuestionList />
          </Col>
        </Row>
      </div>
      <div style={{ display: step === 2 ? '' : 'none' }}>
        <Row gutter={24}>
          <Col span={8}>
            <PickedQuestionList />
          </Col>
          <Col span={16}>
            <PaperDetailCard
              paper={{
                ...paperInfo,
                questions: pickedQuestions,
              }}
              editable
            />
          </Col>
        </Row>
      </div>
      <Affix offsetBottom={20}>
        <Card style={{ marginTop: 20, textAlign: 'center' }}>
          <Space size="large">
            {step !== 0 && <Button onClick={prevStep}>上一步</Button>}
            <Button type="primary" onClick={nextStep} loading={loading}>
              {step === 2 ? '完成' : '下一步'}
            </Button>
          </Space>
        </Card>
      </Affix>
    </div>
  );
};

export default AddPaper;
