import { Divider, List, Space, Typography, Button, Popconfirm, message, Card } from 'antd';
import React from 'react';
import { history, Link } from 'umi';
import { deletePaper } from '@/services/paper';
import TagList from '@/components/TagList';
import { formatDateStr, getCompanyImg } from '@/utils/utils';
import './index.less';
import { FireOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface PaperItemProps {
  paper: PaperType;
  horizontal?: boolean; // 是否用于水平展示
  showReview?: boolean; // 显示审核状态
  showEdit?: boolean; // 显示修改
  showActions?: boolean; // 展示操作栏
  onReload?: () => void;
}

/**
 * 单个题目展示
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const PaperItem: React.FC<PaperItemProps> = (props) => {
  const {
    paper = {} as PaperType,
    showEdit,
    onReload,
    horizontal = false,
  } = props;

  const doEdit = () => {
    history.push({
      pathname: '/addPaper',
      query: {
        rid: paper._id,
      },
    });
  };

  /**
   * 删除
   */
  const doDelete = async () => {
    const res = await deletePaper(paper._id);
    if (res) {
      message.success('操作成功');
      if (onReload) {
        onReload();
      }
    } else {
      message.error('操作失败');
    }
  };

  const companyImg = getCompanyImg(paper);

  const paperItemView = (
    <>
      <Link to={`/pd/${paper._id}`} target="_blank">
        <Title
          level={5}
          ellipsis={{ rows: 2 }}
          className="paper-item-title"
          style={{ height: horizontal ? 48 : 'auto' }}
        >
          <span>{paper.name}</span>
        </Title>
        {horizontal && (
          <div style={{ textAlign: 'center', marginTop: 12, marginBottom: 12 }}>
            <img src={companyImg} width={64} alt={paper.name} />
          </div>
        )}
      </Link>
      <p style={{ fontSize: 12, color: '#aaa' }}>
        <Space split={<Divider type="vertical" />}>
          <span>{formatDateStr(paper.publishTime)}</span>
          <span>
            <FireOutlined /> {paper.viewNum}
          </span>
        </Space>
      </p>
      <div className="tags-row" style={{ height: horizontal ? 52 : 'auto' }}>
        <TagList question={paper} />
        {showEdit ? (
          <Space>
            <Popconfirm title="确认删除么，操作无法撤销" onConfirm={() => doDelete()}>
              <Button type="primary" danger onClick={() => {}}>
                删除
              </Button>
            </Popconfirm>

            <Button type="primary" onClick={doEdit}>
              编辑
            </Button>
          </Space>
        ) : null}
      </div>
    </>
  );

  return (
    <List.Item className="paper-item" key={paper.name}>
      {horizontal ? <Card>{paperItemView}</Card> : paperItemView}
    </List.Item>
  );
};

export default PaperItem;
