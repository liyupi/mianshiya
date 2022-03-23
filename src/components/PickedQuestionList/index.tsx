import React from 'react';
import { Tag, Typography, Button } from 'antd';
import type { QuestionType } from '@/models/question';
import {
  QUESTION_TYPE_ENUM,
  QUESTION_DIFFICULTY_ENUM,
  QUESTION_DIFFICULTY_COLOR_ENUM,
} from '@/constant/question';
import { useSelector, Link, useDispatch } from 'umi';
import ProTable, { DragSortTable } from '@ant-design/pro-table';
import './index.less';

const { Paragraph } = Typography;

const expandedRowRender = (onSortChange, deletePickedQuestions) => (row) => {
  const handleDragSortEnd = (newDataSource: any) => {
    onSortChange(newDataSource);
  };

  return (
    <div className="class-question-list" key={row.questions.length}>
      <DragSortTable
        dragSortKey="sort"
        onDragSortEnd={handleDragSortEnd}
        columns={[
          {
            title: '排序',
            dataIndex: 'sort',
            width: 30,
            key: 'sort',
            // render: (_, record) => <></>,
          },
          {
            title: '题目',
            dataIndex: 'name',
            key: 'name',
            width: 240,
            render: (_, record) => (
              <Link to={`/qd/${record._id}`} target="_blank">
                <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#1890ff' }}>
                  <span dangerouslySetInnerHTML={{ __html: record.name || record.detail || '' }} />
                </Paragraph>
              </Link>
            ),
          },
          {
            title: '难度',
            dataIndex: 'difficulty',
            key: 'difficulty',
            render: (_, record) => (
              <Tag color={QUESTION_DIFFICULTY_COLOR_ENUM[record.difficulty]}>
                {QUESTION_DIFFICULTY_ENUM[record.difficulty]}
              </Tag>
            ),
          },
          {
            title: '操作',
            dataIndex: 'action',
            key: 'action',
            render: (_, record) => (
              <div>
                <Button
                  type="primary"
                  onClick={() => deletePickedQuestions(record)}
                  size="small"
                  danger
                >
                  移出
                </Button>
              </div>
            ),
          },
        ]}
        rowKey="_id"
        headerTitle={false}
        search={false}
        options={false}
        dataSource={row.questions}
        pagination={false}
      />
    </div>
  );
};

function PickedQuestionList({ showTitle = true }) {
  const dispatch = useDispatch();
  const changePickedQuestionsOrder = (questions: QuestionType) =>
    dispatch({
      type: 'editPaper/changePickedQuestionsOrder',
      payload: {
        questions,
      },
    });
  const deletePickedQuestions = (question: QuestionType) =>
    dispatch({
      type: 'editPaper/deletePickedQuestions',
      payload: question,
    });
  const { pickedQuestions } = useSelector((state) => state.editPaper);

  return (
    <div>
      <div className="picked-questions-list">
        <ProTable
          columns={[
            {
              title: '题型',
              dataIndex: 'type',
            },
            {
              title: '数量',
              dataIndex: 'count',
            },
          ]}
          rowKey="type"
          expandable={{
            expandedRowRender: expandedRowRender(changePickedQuestionsOrder, deletePickedQuestions),
          }}
          pagination={false}
          dataSource={Object.keys(pickedQuestions).map((key) => {
            return {
              type: QUESTION_TYPE_ENUM[key],
              count: pickedQuestions[key].length,
              key,
              questions: pickedQuestions[key],
            };
          })}
          search={false}
          dateFormatter="string"
          headerTitle={showTitle ? '试题篮' : null}
          options={false}
        />
      </div>
    </div>
  );
}

export default PickedQuestionList;
