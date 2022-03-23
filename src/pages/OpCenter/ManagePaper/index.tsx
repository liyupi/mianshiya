import React, { useRef } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { useAccess } from 'umi';

import { NoAuth } from '@/components/NoAuth';
import { deletePaper, searchPapers, updatePaper } from '@/services/paper';
import { message, Popconfirm, Space, Switch } from 'antd';
import {
  DEFAULT_PAPER_PRIORITY,
  PAPER_OWNERSHIP_PRIVATE,
  PAPER_OWNERSHIP_PUBLIC,
  STANDARD_PAPER_PRIORITY,
} from '@/constant/paper';

/**
 * 管理试卷
 *
 * @constructor
 * @author liyupi
 */
const ManagePaper: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const access = useAccess();

  const columns: ProColumns<PaperType>[] = [
    {
      title: '_id',
      dataIndex: '_id',
      copyable: true,
      ellipsis: true,
      render: (text, record) => {
        const url = `/pd/${record._id}`;
        return (
          <a href={url} target="_blank" rel="noreferrer">
            {text}
          </a>
        );
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
      copyable: true,
    },
    {
      title: '描述',
      dataIndex: 'detail',
      copyable: true,
      hideInSearch: true,
    },
    {
      title: '用户',
      dataIndex: 'userId',
      copyable: true,
      ellipsis: true,
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
      title: '发布时间',
      dataIndex: 'publishTime',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 200,
      render: (_, paper) => (
        <Space key={paper._id} size="middle">
          <Switch
            checkedChildren="公开"
            unCheckedChildren="私有"
            defaultChecked={paper.ownership === PAPER_OWNERSHIP_PUBLIC}
            onClick={async (checked) => {
              const ownership = checked ? PAPER_OWNERSHIP_PUBLIC : PAPER_OWNERSHIP_PRIVATE;
              const res = await updatePaper(paper._id, {
                ownership,
              });
              if (res) {
                message.success('操作成功');
              } else {
                message.error('操作失败');
              }
            }}
          />
          <Switch
            checkedChildren="官方"
            unCheckedChildren="用户"
            defaultChecked={paper.priority === STANDARD_PAPER_PRIORITY}
            onClick={async (checked) => {
              const priority = checked ? STANDARD_PAPER_PRIORITY : DEFAULT_PAPER_PRIORITY;
              const res = await updatePaper(paper._id, {
                priority,
              });
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
              const res = await deletePaper(paper._id);
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
      <ProTable<PaperType>
        headerTitle="审核试卷"
        actionRef={actionRef}
        rowKey="_id"
        search={{
          filterType: 'light',
        }}
        request={(params) => {
          return searchPapers({
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
        rowSelection={{
          // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
          defaultSelectedRowKeys: [1],
        }}
        tableAlertRender={({ selectedRowKeys, selectedRows, onCleanSelected }) => (
          <Space size={24}>
            <span>
              已选 {selectedRowKeys.length} 项
              <a style={{ marginLeft: 8 }} onClick={onCleanSelected}>
                取消选择
              </a>
            </span>
          </Space>
        )}
        tableAlertOptionRender={() => {
          return (
            <Space size={16}>
              <a onClick={() => alert('暂时不支持')}>批量删除</a>
            </Space>
          );
        }}
      />
    </>
  ) : (
    <NoAuth />
  );
};

export default ManagePaper;
