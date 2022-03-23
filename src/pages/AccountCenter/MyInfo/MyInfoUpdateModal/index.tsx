import { Button, Col, Form, Input, message, Modal, Radio, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import type { CurrentUser } from '@/models/user';
import { getCurrentUser, updateUser } from '@/services/user';
import SelectTags from '@/components/SelectTags';
import { useModel } from '@@/plugin-model/useModel';
import PicUploader from '@/components/PicUploader';
import { MAX_INTERESTS_NUM } from '@/constant/user';
import './style.less';

const FormItem = Form.Item;

interface MyInfoUpdateModalProps {
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
 * 修改用户信息
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const MyInfoUpdateModal: React.FC<MyInfoUpdateModalProps> = (props) => {
  const { visible, onClose, reload } = props;
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const { tagsMap } = useModel('tag');

  useEffect(() => {
    if (visible) {
      if (!currentUser._id) {
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
  };

  return (
    <Modal
      title="修改信息"
      visible={visible}
      footer={null}
      destroyOnClose
      onCancel={() => doCancel()}
    >
      <Form
        style={{
          marginTop: 8,
        }}
        form={form}
        requiredMark={false}
        name="user"
        labelAlign="left"
        {...formItemLayout}
        scrollToFirstError
        onFinish={doSubmit}
      >
        <FormItem
          label="昵称"
          name="nickName"
          rules={[
            {
              required: true,
              message: '请输入昵称',
            },
          ]}
        >
          <Input placeholder="最多 12 个字" maxLength={12} allowClear />
        </FormItem>
        <FormItem label="头像" name="avatarUrl">
          <PicUploader />
        </FormItem>
        <FormItem label="性别" name="gender">
          <Radio.Group>
            <Radio value="0">男</Radio>
            <Radio value="1">女</Radio>
          </Radio.Group>
        </FormItem>
        <FormItem label="简介" name="profile">
          <Input placeholder="请填写个人简介" maxLength={40} allowClear />
        </FormItem>
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
        <FormItem label="状态" name="jobStatus">
          <Radio.Group>
            <Radio value="0">在学校</Radio>
            <Radio value="1">求职中</Radio>
            <Radio value="2">已工作</Radio>
          </Radio.Group>
        </FormItem>
        <Form.Item name="email" label="邮箱" rules={[{ type: 'email' }]}>
          <Input allowClear />
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

export default MyInfoUpdateModal;
