import React, { useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useAccess } from 'umi';

import { NoAuth } from '@/components/NoAuth';
import { deletePaper } from '@/services/paper';
import { message, Popconfirm, Space, Switch, Image } from 'antd';
import { banUser, searchUsers } from '@/services/user';
import type { CurrentUser } from '@/models/user';
import { DEFAULT_AVATAR } from '@/constant';

/**
 * 管理用户
 *
 * @constructor
 * @author liyupi
 */
const ManagePaper: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();

  const columns: ProColumns<CurrentUser>[] = [
    {
      title: '_id',
      dataIndex: '_id',
      copyable: true,
      ellipsis: true,
      width: 80,
      render: (text, record) => {
        const url = `/ud/${record._id}`;
        return (
          <a href={url} target="_blank" rel="noreferrer">
            {text}
          </a>
        );
      },
    },
    {
      title: '名称',
      dataIndex: 'nickName',
      copyable: true,
      width: 150,
    },
    {
      title: '头像',
      dataIndex: 'avatarUrl',
      width: 80,
      render: (text, record) => {
        return <Image width={32} src={record.avatarUrl || DEFAULT_AVATAR} />;
      },
    },
    {
      title: '简介',
      dataIndex: 'profile',
      copyable: true,
      hideInSearch: true,
    },
    {
      title: '权限',
      dataIndex: 'authority',
    },
    {
      title: '创建时间',
      dataIndex: '_createTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, user) => (
        <Space key={user._id} size="middle">
          <Switch
            checkedChildren="正常"
            unCheckedChildren="封号"
            defaultChecked={!user.authority?.includes('ban')}
            onClick={async () => {
              const res = await banUser(user._id);
              if (res) {
                message.success('操作成功');
              } else {
                message.error('操作失败');
              }
            }}
          />
          <Popconfirm
            title="确认删除么，操作无法撤销"
            onConfirm={async () => {
              const res = await deletePaper(user._id);
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
        </Space>
      ),
    },
  ];

  return access.canAdmin ? (
    <>
      <ProTable<CurrentUser>
        headerTitle="管理用户"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          filterType: 'light',
        }}
        request={(params) => {
          return searchUsers({
            ...params,
            pageNum: params.current,
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

export default ManagePaper;
