import React, { useState, useEffect } from 'react';
import { message, Col, Card, Space, Avatar, Row } from 'antd';
import type { SimpleUser } from '@/models/user';
import PaperDetailCard from '@/components/PaperDetailCard';
import { getUserSimpleInfo } from '@/services/user';
import { getPaper, viewPaper } from '@/services/paper';
import TagList from '@/components/TagList';
import { DEFAULT_AVATAR } from '@/constant';
import SimilarPapers from './components/SimilarPapers';
import { formatPartDateTimeStr } from '@/utils/utils';
import UserInfoCardPopover from '@/components/UserInfoCardPopover';
import UserTitleBar from '@/components/UserTitleBar';

interface PaperDetailProps {
  match: any;
}

/**
 * 试卷详情
 * @param props
 * @constructor
 */
const PaperDetail: React.FC<PaperDetailProps> = (props) => {
  const { match } = props;
  const [paper, setPaper] = useState<PaperType>({} as PaperType);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<SimpleUser>();

  const paperId = match?.params?.id;

  const loadData = async () => {
    if (!paperId) {
      return;
    }
    setLoading(true);
    const res = await getPaper(paperId);
    if (res) {
      setPaper(res);
      getUserSimpleInfo(res.userId)?.then((tmpUser) => {
        setUser(tmpUser);
      });
    } else {
      message.error('加载失败，请刷新重试');
    }
    setLoading(false);
    // 浏览量 +1
    viewPaper(paperId);
  };

  useEffect(() => {
    loadData();
  }, [paperId]);

  const publishTimeStr = formatPartDateTimeStr(paper?.publishTime);

  return (
    <div id="PaperDetailCard">
      <Row gutter={[24, 24]}>
        <Col xl={16} lg={24} xs={24}>
          <PaperDetailCard paper={paper} user={user} loading={loading} />
        </Col>
        <Col xl={8} lg={24} xs={24}>
          <Card title="试卷信息" bodyStyle={{ paddingTop: 16, paddingBottom: 8 }}>
            <p>浏览数：{(paper?.viewNum ?? 0) + 1}</p>
            <p>
              <Space>
                标签：
                <TagList question={paper} />
              </Space>
            </p>
            <p>发布时间：{publishTimeStr}</p>
            <p>
              上传者：
              <Space>
                <UserInfoCardPopover user={user}>
                  <Avatar src={user?.avatarUrl || DEFAULT_AVATAR} />
                </UserInfoCardPopover>
                <UserTitleBar user={user} />
              </Space>
            </p>
          </Card>
          <div style={{ marginBottom: 24 }} />
          <Card title="相似试卷" bodyStyle={{ paddingTop: 0, paddingBottom: 12 }}>
            <SimilarPapers paper={paper} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PaperDetail;
