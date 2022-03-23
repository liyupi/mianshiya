import { Button, Col, Form, message, Modal, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import type { CurrentUser } from '@/models/user';
import SelectTags from '@/components/SelectTags';
import { useModel } from '@@/plugin-model/useModel';
import { addMeetQuestion, searchMeetQuestions, updateMeetQuestion } from '@/services/meetQuestion';
import type { MeetQuestionType } from '@/models/meetQuestion';
import './style.less';

const FormItem = Form.Item;

interface AddMeetQuestionModalProps {
  visible: boolean;
  questionId: string;
  onClose: () => void;
  onReload?: (isEdit: boolean) => void;
}

// 最大标签数
const MAX_TAG_NUM = 5;

/**
 * 添加遇到题目
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const AddMeetQuestionModal: React.FC<AddMeetQuestionModalProps> = (props) => {
  const { visible, questionId, onClose, onReload } = props;
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [meetQuestionId, setMeetQuestionId] = useState<string>();
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const { tagsMap } = useModel('tag');

  const loadData = async () => {
    if (questionId && currentUser._id) {
      const res = await searchMeetQuestions({
        userId: currentUser._id,
        questionId,
        pageSize: 1,
      });
      if (!res) {
        message.error('加载失败，请刷新重试');
        return;
      }
      // 已有数据，修改
      if (res.total > 0 && res.data.length > 0) {
        const oldData = res.data[0];
        setMeetQuestionId(oldData._id);
        form.setFieldsValue(oldData);
      }
    }
  };

  useEffect(() => {
    if (!visible || !questionId || !currentUser._id) {
      return;
    }
    loadData();
  }, [currentUser, questionId, visible]);

  const doSubmit = async (values: Partial<MeetQuestionType>) => {
    if (!currentUser._id) {
      message.warning('请先登录');
      return;
    }
    if (!questionId) {
      message.error('提交失败，请刷新页面重试！');
      return;
    }
    setSubmitting(true);
    let res;
    // 修改
    if (meetQuestionId) {
      res = await updateMeetQuestion(meetQuestionId, {
        tags: values.tags,
      });
      if (res) {
        message.success('修改成功');
        onReload?.(true);
      } else {
        message.error('修改失败，请重试！');
      }
    } else {
      // 新增
      res = await addMeetQuestion({
        tags: values.tags,
        questionId,
      });
      if (res) {
        message.success('操作成功');
        onReload?.(false);
      } else {
        message.error('操作失败，请重试！');
      }
    }
    // 操作成功
    if (res) {
      onClose();
    }
    setSubmitting(false);
  };

  const doCancel = () => {
    onClose();
  };

  // 只能筛选公司标签
  const groupTags = tagsMap?.groupTags?.filter((group) => ['公司', '目标'].includes(group.name));
  const allTags = groupTags?.[0]?.tags;

  return (
    <Modal
      title="在哪里见过这道题呢？"
      visible={visible}
      footer={null}
      destroyOnClose
      onCancel={() => doCancel()}
    >
      <Form
        form={form}
        requiredMark={false}
        name="user"
        labelAlign="left"
        layout="vertical"
        scrollToFirstError
        onFinish={doSubmit}
      >
        <FormItem
          name="tags"
          rules={[
            {
              max: MAX_TAG_NUM,
              type: 'array',
              message: `至多选择 ${MAX_TAG_NUM} 个`,
            },
            {
              min: 1,
              type: 'array',
              message: `至少选择 1 个标签`,
            },
          ]}
        >
          <SelectTags
            style={{ marginTop: 8 }}
            allTags={allTags}
            groupTags={groupTags}
            maxTagsNumber={MAX_TAG_NUM}
          />
        </FormItem>
        <FormItem
          style={{
            marginTop: 32,
          }}
        >
          <Row gutter={24} justify="end">
            <Col>
              <Button htmlType="reset" block onClick={() => doCancel()}>
                取消
              </Button>
            </Col>
            <Col span={12}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={submitting}
                disabled={submitting}
              >
                {submitting ? '提交中' : '提交'}
              </Button>
            </Col>
          </Row>
        </FormItem>
      </Form>
    </Modal>
  );
};

export default AddMeetQuestionModal;
