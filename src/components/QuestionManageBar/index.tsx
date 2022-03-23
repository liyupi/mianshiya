import { Button, message, Space } from 'antd';
import React, { useState } from 'react';
import type { QuestionType } from '@/models/question';
import { GOOD_QUESTION_PRIORITY } from '@/constant/question';
import { useAccess } from '@@/plugin-access/access';
import { useModel } from '@@/plugin-model/useModel';
import type { CurrentUser } from '@/models/user';
import { reviewQuestion, updateQuestion } from '@/services/question';
import reviewStatusEnum from '@/constant/reviewStatusEnum';
import QuestionRejectModal from '@/components/QuestionRejectModal';
import './index.less';

interface QuestionManageBarProps {
  question: QuestionType;
}

/**
 * 题目管理操作栏（仅管理员可用）
 * @param props
 * @constructor
 * @author liyupi
 */
const QuestionManageBar: React.FC<QuestionManageBarProps> = (props) => {
  const { question = {} as QuestionType } = props;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  // 用于修改题目状态后的视图更新
  const [questionState, setQuestionState] = useState<QuestionType>(question);
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const access = useAccess();

  if (!access.canAdmin) {
    return <></>;
  }

  const doPickGood = async (setGood: boolean) => {
    if (!currentUser._id) {
      message.error('提交失败，请刷新页面重试！');
      return;
    }
    if (!question._id) {
      return;
    }
    setSubmitting(true);
    const priority = setGood ? GOOD_QUESTION_PRIORITY : 0;
    const res = await updateQuestion(question._id, {
      priority,
    });
    if (res) {
      message.success('操作成功');
      setQuestionState({ ...questionState, priority });
    } else {
      message.error('操作失败');
    }
    setSubmitting(false);
  };

  const doPassReview = () => {
    if (!currentUser._id) {
      message.warning('请先登录');
      return;
    }
    setSubmitting(true);
    reviewQuestion(question._id, 5, reviewStatusEnum.PASS)
      .then((res) => {
        if (res) {
          message.success('已通过');
          setQuestionState({ ...questionState, reviewStatus: reviewStatusEnum.PASS });
        } else {
          message.error('操作失败');
        }
      })
      .finally(() => setSubmitting(false));
  };

  const doRejectReview = () => {
    setShowRejectModal(true);
  };

  return (
    <div className="question-manage-bar" style={{ marginTop: 16 }}>
      <Space size={16}>
        {questionState.priority !== GOOD_QUESTION_PRIORITY ? (
          <Button loading={submitting} onClick={() => doPickGood(true)}>
            加精
          </Button>
        ) : (
          <Button danger loading={submitting} onClick={() => doPickGood(false)}>
            取消加精
          </Button>
        )}
        {questionState.reviewStatus !== reviewStatusEnum.PASS && (
          <Button onClick={() => doPassReview()}>通过</Button>
        )}
        {questionState.reviewStatus !== reviewStatusEnum.REJECT && (
          <Button danger onClick={() => doRejectReview()}>拒绝</Button>
        )}
      </Space>
      <QuestionRejectModal
        visible={showRejectModal}
        questionId={question._id}
        onSucceed={() =>
          setQuestionState({ ...questionState, reviewStatus: reviewStatusEnum.REJECT })
        }
        onClose={() => setShowRejectModal(false)}
      />
    </div>
  );
};

export default QuestionManageBar;
