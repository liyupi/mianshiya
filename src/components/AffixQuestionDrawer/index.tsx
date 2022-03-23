import React, { useState } from 'react';
import { Button, Space, Affix, Drawer } from 'antd';
import { Link } from 'umi';
import PickedQuestionList from '@/components/PickedQuestionList';
import './index.less';

const AffixQuestionDrawer: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);

  return (
    <div className="affix-question-drawer">
      {drawerVisible ? null : (
        <Affix className="affix">
          <Button
            style={{
              height: 'auto',
              padding: 4,
            }}
            type="primary"
            onClick={() => setDrawerVisible(true)}
          >
            <div>试</div>
            <div>题</div>
            <div>篮</div>
          </Button>
        </Affix>
      )}
      <Drawer
        title="试题篮（仅本地保存）"
        placement="right"
        width="80%"
        contentWrapperStyle={{ maxWidth: 800 }}
        bodyStyle={{ padding: 0 }}
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
      >
        <PickedQuestionList showTitle={false} />
        <div style={{ textAlign: 'center' }}>
          <Space size={16}>
            <Link to={`/addPaper`} target="_blank">
              <Button type="primary">组卷</Button>
            </Link>
            <Link to={`/downloadPaper`} target="_blank">
              <Button type="primary">下载</Button>
            </Link>
          </Space>
        </div>
      </Drawer>
    </div>
  );
};

export default AffixQuestionDrawer;
