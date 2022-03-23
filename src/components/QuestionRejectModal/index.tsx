import { AutoComplete, message, Modal } from 'antd';
import React, { useState } from 'react';
import { useAccess } from 'umi';
import { reviewQuestion } from '@/services/question';
import reviewStatusEnum from '@/constant/reviewStatusEnum';

interface QuestionRejectModalProps {
  questionId: string;
  visible: boolean;
  onSucceed?: () => void;
  onClose: () => void;
}

/**
 * 题目拒绝模态框
 * @param props
 * @constructor
 */
const QuestionRejectModal: React.FC<QuestionRejectModalProps> = (props) => {
  const { visible, questionId, onClose, onSucceed } = props;

  const [reviewMessage, setReviewMessage] = useState<string>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const access = useAccess();

  const doSubmit = async () => {
    // 仅管理员可操作
    if (!access.canAdmin) {
      message.warning('请先登录');
      return;
    }
    if (!questionId) {
      return;
    }
    // 执行操作
    setSubmitting(true);
    const res = await reviewQuestion(questionId, 0, reviewStatusEnum.REJECT, reviewMessage);
    if (res) {
      message.success('已下架');
      onSucceed?.();
      onClose();
    } else {
      message.error('操作失败');
    }
    setSubmitting(false);
  };

  return (
    <Modal
      title="请输入拒绝原因"
      visible={visible}
      confirmLoading={submitting}
      onOk={doSubmit}
      onCancel={onClose}
    >
      <AutoComplete
        options={[
          { value: '已有相同题目' },
          { value: '题目信息不完整' },
          { value: '题目标签不正确' },
          { value: '涉嫌引流，请联系微信 code_nav' },
        ]}
        style={{ width: '100%' }}
        placeholder="请输入拒绝原因"
        value={reviewMessage}
        onChange={(data) => setReviewMessage(data)}
      />
    </Modal>
  );
};

export default QuestionRejectModal;
