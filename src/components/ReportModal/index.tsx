import { Button, Col, Form, Input, message, Modal, Radio, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { addReport } from '@/services/report';
import type { ReportType } from '@/models/report';
import { REPORT_REASON_OPTIONS, REPORT_REASON_ENUM } from '@/constant/report';
import type { CurrentUser } from '@/models/user';
import { useModel } from '@@/plugin-model/useModel';

const FormItem = Form.Item;
const { TextArea } = Input;

interface ReportModalProps {
  reportType: number;
  reportResourceId?: string;
  reportedUserId?: string;
  visible: boolean;
  onClose: () => void;
}

const formItemLayout = {
  labelCol: {
    xs: {
      span: 4,
    },
  },
};

/**
 * 举报模态框
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const ReportModal: React.FC<ReportModalProps> = (props) => {
  const { visible, reportType, reportResourceId, reportedUserId, onClose } = props;

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible]);


  const doSubmit = async (values: ReportType) => {
    if (!currentUser._id) {
      message.error('请先登录！');
      return;
    }
    const { reportReason, reportDetail } = values;
    if (reportReason === REPORT_REASON_ENUM.OTHERS && !reportDetail) {
      message.error('请填写举报详情');
      return;
    }
    setSubmitting(true);
    const report = {
      reportResourceId,
      reportedUserId,
      reportType,
      reportReason,
      reportDetail,
    };
    const res = await addReport(report);
    if (res) {
      message.success('举报成功，万分感谢！');
      onClose();
    } else {
      message.error('操作失败');
    }
    setSubmitting(false);
  };

  const doCancel = () => {
    onClose();
  };

  return (
    <Modal title="举报与反馈" visible={visible} footer={null} destroyOnClose onCancel={doCancel}>
      <Form
        {...formItemLayout}
        form={form}
        name="report"
        labelAlign="left"
        initialValues={{
          reportReason: REPORT_REASON_ENUM.CONTENT_SAME,
        }}
        onFinish={doSubmit}
      >
        <FormItem label="原因" name="reportReason">
          <Radio.Group options={REPORT_REASON_OPTIONS} />
        </FormItem>
        <FormItem label="详情" name="reportDetail">
          <TextArea autoSize={{ minRows: 3, maxRows: 8 }} placeholder="请详细说明举报原因" />
        </FormItem>
        <FormItem>
          <Row gutter={24} justify="end">
            <Col>
              <Button
                htmlType="reset"
                block
                onClick={() => {
                  form.resetFields();
                  onClose();
                }}
              >
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

export default ReportModal;
