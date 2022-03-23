import { message, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useAccess } from 'umi';
import type { CommentUserType } from '@/models/comment';
import { NoAuth } from '@/components/NoAuth';
import { deleteComment, searchComments } from '@/services/comment';
import RichTextViewer from '@/components/RichTextViewer';

/**
 * 审核回答
 *
 * @constructor
 * @author liyupi
 */
const ManageComment: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();

  const columns: ProColumns<CommentUserType>[] = [
    {
      title: '_id',
      dataIndex: '_id',
      copyable: true,
      ellipsis: true,
      width: 100,
    },
    {
      title: '用户',
      dataIndex: 'userId',
      copyable: true,
      ellipsis: true,
      width: 100,
      render: (text, record) => {
        const url = `/ud/${record.userId}`;
        return (
          <a href={url} target="_blank" rel="noreferrer">
            {text}
          </a>
        );
      },
    },
    {
      title: '题目',
      dataIndex: 'questionId',
      render: (text, record) => {
        const url = `/qd/${record.questionId}`;
        return (
          <a href={url} target="_blank" rel="noreferrer">
            {text}
          </a>
        );
      },
      copyable: true,
      ellipsis: true,
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: '_createTime',
      valueType: 'dateTime',
      hideInSearch: true,
      width: 120,
    },
    {
      title: '内容',
      dataIndex: 'content',
      copyable: true,
      render: (text, record) => {
        return <RichTextViewer htmlContent={record.content} />;
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 100,
      render: (_, record) => (
        <div key={record._id}>
          <Popconfirm
            title="确认删除么，操作无法撤销"
            onConfirm={async () => {
              const res = await deleteComment(record._id);
              if (res) {
                message.success('操作成功');
                actionRef?.current?.reload();
              } else {
                message.error('操作失败');
              }
            }}
          >
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return access.canAdmin ? (
    <>
      <ProTable<CommentUserType>
        headerTitle="审核回答"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          filterType: 'light',
        }}
        request={(params) => {
          return searchComments({
            ...params,
            pageNum: params.current,
            orderKey: "_createTime",
          }).then((res) => {
            return {
              data: res.data,
              success: true,
              total: res.total,
            };
          });
        }}
        columns={columns}
      />
    </>
  ) : (
    <NoAuth />
  );
};

export default ManageComment;
