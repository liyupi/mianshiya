import { Badge, Button, Card, List, message, Modal, Popconfirm, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import type { CurrentUser } from '@/models/user';
import type { MessageType } from '@/models/message';
import { LightFilter, ProFormSelect } from '@ant-design/pro-form';
import type { MessageSearchParams } from '@/services/message';
import {
  deleteAllMessages,
  deleteMessage,
  readAllMessages,
  readMessage,
  searchMessages,
} from '@/services/message';
import { MESSAGE_STATUS_ENUM, MESSAGE_STATUS_MAP, MESSAGE_TYPE_MAP } from '@/constant/message';
import { FilterOutlined } from '@ant-design/icons';
import { toLoginPage } from '@/utils/businessUtils';
import moment from '@/plugins/moment';
import { useModel } from '@@/plugin-model/useModel';
import './style.less';

const DEFAULT_PAGE_PARAMS = {
  pageNum: 1,
  pageSize: 8,
};

/**
 * 个人消息页
 *
 * @author liyupi
 */
const MyMessages: React.FC = () => {
  const [list, setList] = useState<MessageType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [refresh, setRefresh] = useState<boolean>(false);
  const initSearchParams = {
    ...DEFAULT_PAGE_PARAMS,
    status: MESSAGE_STATUS_ENUM.UNREAD,
  };
  const [searchParams, setSearchParams] = useState<MessageSearchParams>(initSearchParams);
  const [loading, setLoading] = useState<boolean>(true);
  const [readAllLoading, setReadAllLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});

  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};

  /**
   * 加载
   */
  const doSearch = () => {
    if (!currentUser._id) {
      message.warning('请您先登录！');
      toLoginPage();
      return;
    }
    setLoading(true);
    searchMessages(searchParams)
      .then((res) => {
        setTotal(res.total);
        setList(res.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    doSearch();
  }, [searchParams, refresh]);

  /**
   * 阅读消息
   * @param item
   * @param index
   */
  const doReadMessage = async (item: MessageType, index: number) => {
    const { _id, status } = item;
    if (status !== MESSAGE_STATUS_ENUM.UNREAD) {
      return;
    }
    list[index].status = MESSAGE_STATUS_ENUM.HAS_READ;
    setList([...list]);
    await readMessage(_id);
  };

  /**
   * 全部阅读
   */
  const doReadAll = async () => {
    setReadAllLoading(true);
    const res = await readAllMessages();
    if (res) {
      message.success('操作成功');
      setRefresh(!refresh);
    } else {
      message.error('操作失败，请重试');
    }
    setReadAllLoading(false);
  };

  const doClearAll = async () => {
    Modal.confirm({
      title: '确定要清空消息么？',
      onOk: async () => {
        const res = await deleteAllMessages();
        if (res) {
          message.success('操作成功');
          setRefresh(!refresh);
        } else {
          message.error('操作失败，请重试');
        }
      },
    });
  };

  /**
   * 删除消息
   * @param messageId
   * @param idx
   */
  const doDeleteMessage = async (messageId: string, idx: number) => {
    setDeleteLoading({ [messageId]: true });
    const res = await deleteMessage(messageId);
    const newList = list;
    if (res) {
      message.success('操作成功');
      newList.splice(idx, 1);
      setList(newList);
    } else {
      message.error('操作失败，请重试');
    }
    setDeleteLoading({ [messageId]: false });
  };

  return (
    <Card
      title={`我的消息（${total}）`}
      className="my-messages"
      extra={
        <Space size={16}>
          <Button onClick={doReadAll} loading={readAllLoading}>
            全部已读
          </Button>
          <Button onClick={doClearAll}>清空</Button>
        </Space>
      }
    >
      <LightFilter
        bordered
        collapseLabel={<FilterOutlined />}
        initialValues={{
          status: MESSAGE_STATUS_ENUM.UNREAD.toString(),
        }}
        onFinish={async (values) => {
          if (values.status) {
            // eslint-disable-next-line radix
            values.status = parseInt(values.status);
          }
          if (values.type) {
            // eslint-disable-next-line radix
            values.type = parseInt(values.type);
          }
          const params = {
            ...DEFAULT_PAGE_PARAMS,
            ...values,
          };
          setSearchParams(params);
        }}
      >
        <ProFormSelect name="type" placeholder="消息类型" valueEnum={MESSAGE_TYPE_MAP} />
        <ProFormSelect name="status" placeholder="消息状态" valueEnum={MESSAGE_STATUS_MAP} />
      </LightFilter>
      <div style={{ marginTop: 16 }} />
      <List<MessageType>
        loading={loading}
        itemLayout="horizontal"
        dataSource={list}
        renderItem={(item, index) => {
          const actions = [];
          actions.push(
            <Popconfirm
              title="确定删除该条消息么？"
              onConfirm={() => doDeleteMessage(item._id, index)}
              okText="确认"
              cancelText="取消"
            >
              <Button danger type="text" loading={deleteLoading[item._id]}>
                删除
              </Button>
            </Popconfirm>,
          );

          return (
            <List.Item
              key={item._id}
              actions={actions}
              className="message-list-item"
              onClick={() => doReadMessage(item, index)}
            >
              <List.Item.Meta
                title={
                  <>
                    {item.status === MESSAGE_STATUS_ENUM.UNREAD && <Badge color="red" />}
                    <Tag color="green">{MESSAGE_TYPE_MAP[item.type ?? 0]}</Tag>
                    <span dangerouslySetInnerHTML={{__html: item.title}} />
                  </>
                }
                description={<span dangerouslySetInnerHTML={{__html: item.content}} />}
              />
              <div style={{ fontSize: 14, color: '#aaa' }}>
                {moment(item._createTime).fromNow()}
              </div>
            </List.Item>
          );
        }}
        pagination={{
          pageSize: searchParams.pageSize ?? DEFAULT_PAGE_PARAMS.pageSize,
          current: searchParams.pageNum ?? 1,
          showSizeChanger: false,
          total,
          showTotal() {
            return `总数 ${total}`;
          },
          onChange: (pageNum, pageSize) => {
            const params = {
              ...searchParams,
              pageSize,
              pageNum,
            };
            setSearchParams(params);
          },
        }}
      />
    </Card>
  );
};

export default MyMessages;
