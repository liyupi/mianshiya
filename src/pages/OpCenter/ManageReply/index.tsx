import { message, Popconfirm } from 'antd';
import React, { useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ReplyUserType } from '@/models/reply';
import { NoAuth } from '@/components/NoAuth';
import { deleteReply, searchReplies } from '@/services/reply';
import { useModel } from '@@/plugin-model/useModel';
import { useAccess } from '@@/plugin-access/access';
import type { CurrentUser } from '@/models/user';

/**
 * 管理回复
 *
 * @constructor
 * @author liyupi
 */
const ManageReply: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const access = useAccess();

  const columns: ProColumns<ReplyUserType>[] = [
    {
      title: '_id',
      dataIndex: '_id',
      copyable: true,
      ellipsis: true,
      width: 50,
    },
    {
      title: '内容',
      dataIndex: 'content',
      copyable: true,
      hideInSearch: true,
    },
    {
      title: '题目',
      dataIndex: 'questionId',
      copyable: true,
      ellipsis: true,
      width: 100,
      render: (text, record) => {
        const url = `/qd/${record._id}`;
        return (
          <a href={url} target="_blank" rel="noreferrer">
            {text}
          </a>
        );
      },
    },
    {
      title: '回答',
      dataIndex: 'commentId',
      width: 100,
      ellipsis: true,
      copyable: true,
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
      title: '创建时间',
      dataIndex: '_createTime',
      valueType: 'dateTime',
      width: 200,
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 100,
      render: (_, record) => (
        <div key={record._id}>
          <Popconfirm
            title="是否删除本回复？"
            onConfirm={async () => {
              if (!currentUser._id) {
                message.warning('请先登录');
                return;
              }
              const res = await deleteReply(record._id);
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
      <ProTable<ReplyUserType>
        headerTitle="审核回复"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          filterType: 'light',
        }}
        request={(params) => {
          return searchReplies({
            ...params,
            pageNum: params.current,
            order: 'desc',
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

export default ManageReply;
