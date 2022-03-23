import React, { useEffect, useState } from 'react';
import { Avatar, message, Space, Tabs } from 'antd';
import { searchTopics } from '@/services/topic';
import type { TopicType } from '@/models/topic';
import type { TabPosition } from 'rc-tabs/lib/interface';
import { EXTRA_TOPIC } from '@/constant';

interface TopicTabsProps {
  onTabClick?: (key: string, topic: TopicType) => void;
}

/**
 * 专题菜单
 *
 * @constructor
 * @author liyupi
 */
const TopicTabs: React.FC<TopicTabsProps> = (props) => {
  const { onTabClick } = props;
  const [list, setList] = useState<TopicType[]>([]);
  const [mode, setMode] = useState<TabPosition>('left');

  const loadData = async () => {
    const res = await searchTopics({
      pageSize: 100,
      pageNum: 1,
    });
    if (res) {
      setList(res.data);
    } else {
      message.error('专区加载失败，请刷新重试');
    }
  };

  const resize = () => {
    setMode(window.innerWidth < 992 ? 'top' : 'left');
  };

  useEffect(() => {
    loadData();
    window.addEventListener('resize', resize);
    resize();
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  // 补充菜单
  const allList = [EXTRA_TOPIC, ...list];
  const handleTabClick = (tabKey: string) => {
    if (onTabClick) {
      const topic = allList.find((item) => item.key === tabKey);
      if (topic) {
        onTabClick(tabKey, topic);
      }
    }
  };

  return (
    <Tabs
      tabPosition={mode}
      type="card"
      style={{ display: 'block', marginTop: -4, marginLeft: -4 }}
      tabBarGutter={4}
      defaultActiveKey={EXTRA_TOPIC.key}
      onTabClick={handleTabClick}
    >
      {allList.map((item) => {
        return (
          <Tabs.TabPane
            key={item.key}
            tab={
              <Space size={12}>
                <Avatar src={item.icon} size="large" shape="square" />
                <span style={{ fontSize: 17 }}>{item.name}</span>
              </Space>
            }
          />
        );
      })}
    </Tabs>
  );
};

export default TopicTabs;
