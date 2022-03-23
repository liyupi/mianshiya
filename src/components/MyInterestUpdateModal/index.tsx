import { Button, Col, Form, message, Modal, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import type { CurrentUser } from '@/models/user';
import { getCurrentUser, updateUser } from '@/services/user';
import SelectTags from '@/components/SelectTags';
import { useModel } from '@@/plugin-model/useModel';
import { toLoginPage } from '@/utils/businessUtils';
import { MAX_INTERESTS_NUM } from '@/constant/user';

const FormItem = Form.Item;

interface MyInterestUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  reload?: () => void;
}

const formItemLayout = {
  labelCol: {
    xs: {
      span: 4,
    },
  },
};

/**
 * 修改用户兴趣
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const MyInterestUpdateModal: React.FC<MyInterestUpdateModalProps> = (props) => {
  const { visible, onClose, reload } = props;
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const { tagsMap } = useModel('tag');

  useEffect(() => {
    if (visible) {
      if (!currentUser._id) {
        message.warning('登录后才能操作哦！');
        toLoginPage();
        return;
      }
      form.setFieldsValue(currentUser);
    }
  }, [currentUser, visible]);

  const doSubmit = async (values: CurrentUser) => {
    if (!currentUser._id) {
      message.error('提交失败，请刷新页面重试！');
      return;
    }
    setSubmitting(true);
    const res = await updateUser(values);
    if (res.data) {
      message.success('操作成功');
      const newCurrentUser = await getCurrentUser();
      setInitialState({ ...initialState, currentUser: newCurrentUser });
      form.resetFields();
      onClose();
      if (reload) {
        reload();
      }
    } else {
      message.error('操作失败，' + res.message ?? '请重试');
    }
    setSubmitting(false);
  };

  const doCancel = () => {
    onClose();
    form.resetFields();
  };

  return (
    <Modal title="修改兴趣" visible={visible} footer={null} onCancel={() => doCancel()}>
      <Form
        style={{
          marginTop: 8,
        }}
        form={form}
        name="user"
        labelAlign="left"
        {...formItemLayout}
        scrollToFirstError
        onFinish={doSubmit}
      >
        <FormItem
          label="兴趣"
          name="interests"
          rules={[
            {
              max: MAX_INTERESTS_NUM,
              type: 'array',
              message: `至多选择 ${MAX_INTERESTS_NUM} 个`,
            },
          ]}
        >
          <SelectTags
            allTags={tagsMap.allTags}
            groupTags={tagsMap.groupTags}
            maxTagsNumber={MAX_INTERESTS_NUM}
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

export default MyInterestUpdateModal;
