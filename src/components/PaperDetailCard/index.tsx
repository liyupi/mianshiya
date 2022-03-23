import React, { useState } from 'react';
import { Button, Card, Dropdown, List, Menu } from 'antd';
import Title from 'antd/es/typography/Title';
import { history } from '@@/core/history';
import type { QuestionType } from '@/models/question';
import QuestionDetailCard from '@/components/QuestionDetailCard';
import { getQuestionSpeakText } from '@/utils/businessUtils';
import './style.less';

/**
 * 试卷详情卡片
 * @param paper
 * @param user
 * @param editable
 * @param loading
 * @constructor
 */
const PaperDetailCard: React.FC = ({ paper, user, editable = false, loading = false }) => {
  const [showReference, setShowReference] = useState<boolean>(true);

  let questions: QuestionType[] = [];
  for (const key in paper.questions) {
    questions = questions.concat(paper.questions[key]);
  }

  const toDownLoad = () => {
    history.push({
      pathname: '/downloadPaper',
      query: {
        rid: paper._id,
        showReference: showReference ? '1' : '0',
      },
    });
  };

  /**
   * 语音读卷
   */
  const doSpeak = async () => {
    if (!paper?._id || questions?.length < 1) {
      return;
    }
    // 拼接朗读信息
    let speakText = paper.name;
    questions.forEach((question, index) => {
      speakText += getQuestionSpeakText(question, showReference, index + 1);
    });
    const utterThis = new window.SpeechSynthesisUtterance(speakText);
    await window.speechSynthesis.speak(utterThis);
  };

  const opMenu = (
    <Menu>
      <Menu.Item onClick={() => setShowReference(!showReference)}>
        {showReference ? '隐藏' : '显示'}解析
      </Menu.Item>
      <Menu.Item onClick={() => toDownLoad()}>下载试卷</Menu.Item>
      <Menu.Item onClick={() => doSpeak()}>语音读卷</Menu.Item>
    </Menu>
  );

  return (
    <div className="paper-detail-card">
      <Card
        title={<Title level={4}>{paper.name}</Title>}
        bordered={false}
        extra={
          <Dropdown overlay={opMenu}>
            <Button>操作</Button>
          </Dropdown>
        }
        loading={loading}
      >
        {paper.detail && <p>{paper.detail}</p>}
        <List
          rowKey="_id"
          itemLayout="vertical"
          dataSource={questions}
          pagination={false}
          split
          renderItem={(question, index) => {
            return (
              <List.Item key={question._id}>
                <QuestionDetailCard
                  question={question}
                  showReference={showReference}
                  showTitle={false}
                  index={index + 1}
                />
              </List.Item>
            );
          }}
        />
      </Card>
    </div>
  );
};

export default PaperDetailCard;
