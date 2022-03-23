import { Button, Col, Form, message, Modal, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import type { CurrentUser } from '@/models/user';
import { useModel } from '@@/plugin-model/useModel';
import { addQuestionEdit, searchQuestionEdits, updateQuestionEdit } from '@/services/questionEdit';
import type { QuestionEditType } from '@/models/questionEdit';
import RichTextEditor from '@/components/RichTextEditor';
import TextArea from 'antd/es/input/TextArea';
import './style.less';
import BraftEditor from 'braft-editor';

const FormItem = Form.Item;

interface AddQuestionEditModalProps {
  visible: boolean;
  questionId: string;
  onClose: () => void;
  onReload?: () => void;
}

/**
 * 添加或修改题目编辑
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const AddQuestionEditModal: React.FC<AddQuestionEditModalProps> = (props) => {
  const { visible, questionId, onClose, onReload } = props;
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [questionEditId, setQuestionEditId] = useState<string>();
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};

  const loadData = async () => {
    if (questionId && currentUser._id) {
      const res = await searchQuestionEdits({
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
        setQuestionEditId(oldData._id);
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

  const doSubmit = async (values: Partial<QuestionEditType>) => {
    if (!currentUser._id) {
      message.warning('请先登录');
      return;
    }
    if (!questionId) {
      message.error('提交失败，请刷新页面重试！');
      return;
    }
    const { reference } = values;
    if (!reference || BraftEditor.createEditorState(reference).toText()?.trim().length < 1) {
      message.error('请输入解析内容');
      return;
    }
    setSubmitting(true);
    let res;
    // 修改
    if (questionEditId) {
      res = await updateQuestionEdit(questionEditId, {
        ...values,
      });
    } else {
      // 新增
      res = await addQuestionEdit({
        ...values,
        questionId,
      });
    }
    // 操作成功
    if (res) {
      message.success('提交成功');
      onReload?.();
      onClose();
    } else {
      message.error('提交失败，请重试！');
    }
    setSubmitting(false);
  };

  const doCancel = () => {
    onClose();
  };

  return (
    <Modal
      title="修改题目解析"
      visible={visible}
      footer={null}
      destroyOnClose
      onCancel={() => doCancel()}
    >
      <Form form={form} layout="vertical" scrollToFirstError onFinish={doSubmit}>
        <Form.Item
          label="描述"
          name="description"
          rules={[
            {
              required: true,
              message: '请输入描述',
            },
          ]}
        >
          <TextArea placeholder="请输入本次修改的介绍或原因" />
        </Form.Item>
        <Form.Item
          label="题目解析"
          name="reference"
          rules={[
            {
              required: true,
              message: '请输入题目解析',
            },
          ]}
        >
          <RichTextEditor />
        </Form.Item>
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

export default AddQuestionEditModal;
