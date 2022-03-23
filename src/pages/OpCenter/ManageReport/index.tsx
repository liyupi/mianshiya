import { AutoComplete, Divider, message, Modal } from 'antd';
import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import type { ReportType } from '@/models/report';
import reviewStatusEnum, { REVIEW_STATUS_MAP } from '@/constant/reviewStatusEnum';
import { REPORT_REASON_MAP, REPORT_TYPE_ENUM } from '@/constant/report';
import { NoAuth } from '@/components/NoAuth';
import { reviewReport, searchReportByPage } from '@/services/report';
import { REPORT_TYPE_MAP } from '@/constant/report';
import { useModel } from '@@/plugin-model/useModel';
import { useAccess } from '@@/plugin-access/access';
import type { CurrentUser } from '@/models/user';

/**
 * 举报管理
 *
 * @author yupi
 */
const ManageReport: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [reviewMessage, setReviewMessage] = useState<string>('');
  const [rejectReportId, setRejectReportId] = useState<string>('');
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const access = useAccess();

  const columns: ProColumns<ReportType>[] = [
    {
      title: '_id',
      dataIndex: '_id',
      copyable: true,
      ellipsis: true,
      width: 50,
    },
    {
      title: '举报资源',
      dataIndex: 'reportResourceId',
      render: (text, record) => {
        // 根据资源类型跳转到不同页面
        let url;
        if (record.reportType === REPORT_TYPE_ENUM.QUESTION) {
          url = `/qd/${record.reportResourceId}`;
        } else if (record.reportType === REPORT_TYPE_ENUM.COMMENT) {
          url = `/cd/${record.reportResourceId}`;
        } else if (record.reportType === REPORT_TYPE_ENUM.PAPER) {
          url = `/pd/${record.reportResourceId}`;
        } else if (record.reportType === REPORT_TYPE_ENUM.USER) {
          url = `/ud/${record.reportResourceId}`;
        }
        return (
          <a href={url} target="_blank" rel="noreferrer">
            {text}
          </a>
        );
      },
      copyable: true,
      ellipsis: true,
      width: 80,
    },
    {
      title: '类型',
      dataIndex: 'reportType',
      width: 80,
      valueType: 'select',
      valueEnum: REPORT_TYPE_MAP,
      render: (_, record) => REPORT_TYPE_MAP[record.reportType]?.text || '类型错误',
    },
    {
      title: '被举报人',
      dataIndex: 'reportedUserId',
      copyable: true,
      ellipsis: true,
      width: 80,
      render: (text, record) => {
        const url = `/ud/${record.reportedUserId}`;
        return (
          <a href={url} target="_blank" rel="noreferrer">
            {text}
          </a>
        );
      },
    },
    {
      title: '举报人',
      dataIndex: 'reporterId',
      valueType: 'text',
      copyable: true,
      ellipsis: true,
      width: 80,
      render: (text, record) => {
        const url = `/ud/${record.reporterId}`;
        return (
          <a href={url} target="_blank" rel="noreferrer">
            {text}
          </a>
        );
      },
    },
    {
      title: '原因',
      dataIndex: 'reportReason',
      width: 80,
      valueType: 'select',
      valueEnum: REPORT_REASON_MAP,
      search: false,
      render: (_, record) => REPORT_REASON_MAP[record.reportType]?.text || '类型错误',
    },
    {
      title: '详情',
      dataIndex: 'reportDetail',
      search: false,
      ellipsis: true,
    },
    {
      title: '审核状态',
      dataIndex: 'reviewStatus',
      width: 80,
      valueType: 'select',
      valueEnum: REVIEW_STATUS_MAP,
      render: (_, record) => REVIEW_STATUS_MAP[record.reviewStatus] || '错误',
    },
    {
      title: '举报时间',
      width: 200,
      dataIndex: '_createTime',
      search: false,
      sorter: true,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      width: 100,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <div key={record._id}>
          <a
            onClick={() => {
              if (!currentUser._id) {
                message.error('请先登录');
                return;
              }
              reviewReport(record._id, reviewStatusEnum.PASS).then((res) => {
                if (res) {
                  message.success('已通过');
                } else {
                  message.error('操作失败');
                }
              });
            }}
          >
            通过
          </a>
          <Divider type="vertical" />
          <a
            style={{ color: 'red' }}
            onClick={() => {
              setShowRejectModal(true);
              setRejectReportId(record._id);
            }}
          >
            拒绝
          </a>
        </div>
      ),
    },
  ];

  return access.canAdmin ? (
    <>
      <ProTable<ReportType>
        headerTitle="审核举报"
        actionRef={actionRef}
        rowKey="_id"
        columns={columns}
        search={{
          filterType: 'light',
        }}
        form={{
          initialValues: {
            reviewStatus: '0',
          }
        }}
        request={(params) => {
          const condition: any = {
            ...params,
            pageNum: params.current,
          };
          if (condition.reportType) {
            condition.reportType = Number(condition.reportType);
          }
          if (condition.reviewStatus) {
            condition.reviewStatus = Number(condition.reviewStatus);
          }
          return searchReportByPage(condition).then((res) => {
            return {
              data: res.data,
              success: true,
              total: res.total,
            };
          });
        }}
      />
      <Modal
        title="请输入拒绝原因"
        visible={showRejectModal}
        onOk={() => {
          if (!currentUser._id) {
            message.error('请先登录');
            return;
          }
          reviewReport(rejectReportId, reviewStatusEnum.REJECT, reviewMessage).then((res) => {
            if (res) {
              message.success('已拒绝');
            } else {
              message.error('操作失败');
            }
            setShowRejectModal(false);
          });
        }}
        onCancel={() => setShowRejectModal(false)}
      >
        <AutoComplete
          options={[{ value: '举报不属实' }, { value: '恶意举报' }]}
          style={{ width: '100%' }}
          placeholder="请输入拒绝原因"
          value={reviewMessage}
          onChange={(data) => setReviewMessage(data)}
        />
      </Modal>
    </>
  ) : (
    <NoAuth />
  );
};

export default ManageReport;
