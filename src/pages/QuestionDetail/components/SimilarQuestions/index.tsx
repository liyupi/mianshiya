import { List, message } from 'antd';
import React, { useEffect, useState } from 'react';
import type { QuestionType } from '@/models/question';
import QuestionItem from '@/components/QuestionItem';
import { searchQuestionsByPage } from '@/services/question';
import reviewStatusEnum from '@/constant/reviewStatusEnum';

interface SimilarQuestionsProps {
  // 参照题目
  question?: QuestionType;
}

/**
 * 相似题目
 * @param props
 * @constructor
 */
const SimilarQuestions: React.FC<SimilarQuestionsProps> = (props) => {
  const { question } = props;

  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    if (question?._id) {
      const res = await searchQuestionsByPage({
        tags: [question.tags[0]],
        pageSize: 3,
        reviewStatus: reviewStatusEnum.PASS,
        notId: question._id,
      });
      if (res) {
        setQuestions(res.data);
      } else {
        message.error('数据加载失败');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [question?._id]);

  return (
    <List<QuestionType>
      itemLayout="vertical"
      dataSource={questions}
      loading={loading}
      renderItem={(item) => {
        return <QuestionItem question={item} key={item._id} target="_self" />;
      }}
    />
  );
};

export default SimilarQuestions;
