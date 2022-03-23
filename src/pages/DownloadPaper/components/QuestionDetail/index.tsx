import React from 'react';

import { Typography, Divider } from 'antd';

import RichTextViewer from '@/components/RichTextViewer';

function QuestionDetail({ question, index }) {
  return (
    <div>
      <Typography.Title level={5}>{`${index + 1}.${question.name}`}</Typography.Title>
      <div style={{ marginBottom: 16 }} />
      <RichTextViewer htmlContent={question.detail} />
      <div style={{ height: '100px' }}></div>
      <Divider dashed />
    </div>
  );
}

export default QuestionDetail;
