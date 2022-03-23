import { Typography } from 'antd';
import React from 'react';
import type { QuestionType } from '@/models/question';
import { getQuestionTitle, toQuestionDetailPage } from '@/utils/businessUtils';
import RichTextViewer from '@/components/RichTextViewer';
import BraftEditor from 'braft-editor';
import { QUESTION_TYPE_ENUM } from '@/constant/question';
import './index.less';

interface QuestionDetailCardProps {
  question: QuestionType;
  showReference?: boolean; // 展示解析
  showTitle?: boolean; // 展示标题
  index?: number; // 题号
}

/**
 * 题目详细信息（只读，给试卷、题目详情等页面使用）
 * @param props
 * @constructor
 * @author liyupi
 */
const QuestionDetailCard: React.FC<QuestionDetailCardProps> = (props) => {
  const { question = {} as QuestionType, showReference = false, showTitle = true, index } = props;

  const textQuestionDetail = BraftEditor.createEditorState(question.detail).toText().trim();
  const questionTitle = getQuestionTitle(question);

  return (
    <div className="question-detail-card">
      {showTitle && question.name && (
        <Typography.Title level={4} style={{ marginBottom: 16 }}>
          {questionTitle}
        </Typography.Title>
      )}
      {(!showTitle || textQuestionDetail !== question.name?.trim()) && (
        <div style={{ fontSize: 15 }}>
          {index && (
            <p
              className="question-item-title"
              style={{ fontWeight: 'bold' }}
              onClick={() => toQuestionDetailPage(question)}
            >
              {index}. {QUESTION_TYPE_ENUM[question.type]}题
            </p>
          )}
          <RichTextViewer htmlContent={question.detail} />
        </div>
      )}
      {[1, 2].includes(question.type) && (
        <div style={{ fontSize: 15, marginTop: 16 }}>
          {question.params?.options.map((option, index) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <p key={index} style={{ wordBreak: 'break-all' }}>
                {String.fromCharCode(65 + index)}：{option}
              </p>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: 16, display: showReference ? 'initial' : 'none' }}>
        <p style={{ fontSize: 15 }}>解析：{question.params?.answer}</p>
        {question.reference && <RichTextViewer htmlContent={question.reference} />}
      </div>
    </div>
  );
};

export default QuestionDetailCard;
