// 试卷右侧答题情况
import React from 'react';
import classNames from 'classnames';
import { Typography } from 'antd';
const { Title } = Typography;
import type { QuestionType } from '@/models/question';

interface ExamQuestionListType {
  questions: {
    [key: string]: QuestionType[];
  };
  onValueChange: (question: QuestionType) => void;
  answer: {
    [key: string]: any;
  };
  current: QuestionType;
}
function ExamQuestionList(props: ExamQuestionListType) {
  const { questions, onValueChange, answer, current } = props;
  return (
    <div className="exam-question-list">
      {Object.keys(questions).map((key) => {
        return questions[key].length > 0 ? (
          <div className="type-card">
            <Title level={5}>{key}</Title>
            <div className="number-list">
              {questions[key].map((q, index) => {
                <div
                  className={classNames({
                    common: true,
                    current: current._id == q._id,
                    'already-down': !!answer[current._id],
                    default: !answer[current._id],
                  })}
                  onClick={() => onValueChange(q)}
                >
                  {index + 1}
                </div>;
              })}
            </div>
          </div>
        ) : null;
      })}
    </div>
  );
}

export default ExamQuestionList;
