import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import type { CurrentUser } from '@/models/user';
import { useModel } from '@@/plugin-model/useModel';
import { EXTRA_TAG_LIST } from '@/constant/tag';

interface TagTabsProps {
  activeKey: string;
  onTabClick?: (key: string) => void;
}

/**
 * 标签菜单列表
 *
 * @constructor
 * @author liyupi
 */
const TagTabList: React.FC<TagTabsProps> = (props) => {
  const { onTabClick, activeKey } = props;
  const [list, setList] = useState<string[]>([]);
  const { tagsMap } = useModel('tag');
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};

  const loadData = async () => {
    const { interests } = currentUser;
    let tagList: string[];
    if (interests && interests.length > 0) {
      tagList = interests;
    } else {
      tagList = tagsMap.hotTags;
    }
    if (tagList) {
      setList(tagList);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser, tagsMap]);

  // 补充菜单
  const allList = [...EXTRA_TAG_LIST, ...list];
  const handleTabClick = (tabKey: string) => {
    if (onTabClick) {
      onTabClick(tabKey);
    }
  };

  return (
    <>
      <Tabs
        tabPosition="top"
        type="card"
        className="tag-tabs"
        activeKey={activeKey}
        onTabClick={handleTabClick}
      >
        {allList.map((item) => {
          return <Tabs.TabPane key={item} tab={<span>{item}</span>} />;
        })}
      </Tabs>
    </>

  );
};

export default TagTabList;
