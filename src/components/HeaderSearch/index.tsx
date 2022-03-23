import { AutoComplete, Input, Modal, Space } from 'antd';
import { CSSProperties, useEffect } from 'react';
import React, { useState } from 'react';
import { history, useLocation } from 'umi';
import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  addSearchHistory,
  deleteAllSearchHistory,
  deleteSearchHistory,
  listHotSearches,
  listSearchHistory,
} from '@/services/searchHistory';
import styles from './index.less';
import RankOrder from '@/components/RankOrder';

export type HeaderSearchProps = {
  onSearch?: (value?: string) => void;
  onChange?: (value: string) => void;
  defaultValue?: string;
  value?: string;
  style?: CSSProperties;
  placeholder?: string;
};

/**
 * 顶部搜索
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const HeaderSearch: React.FC<HeaderSearchProps> = (props) => {
  const { style, placeholder, value, onChange } = props;
  const [searchHistoryList, setSearchHistoryList] = useState<string[]>(listSearchHistory());
  const [hotList, setHotList] = useState<string[]>([]);
  const location = useLocation();

  // 获取热搜列表
  const loadData = async () => {
    const res = await listHotSearches();
    setHotList(res);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = (name: string) => {
    if (location.pathname === '/questions' || location.pathname.startsWith('/tag')) {
      history.push({
        pathname: '/questions',
        query: {
          q: name,
        },
      });
    } else {
      window.open(`/questions?q=${name}`);
    }
    addSearchHistory(name);
    setSearchHistoryList(listSearchHistory());
  };

  /**
   * 清空搜索历史
   */
  const clearAll = () => {
    if (searchHistoryList.length > 0) {
      Modal.confirm({
        title: '确定要清空搜索历史么？',
        onOk() {
          deleteAllSearchHistory();
          setSearchHistoryList(listSearchHistory());
        },
      });
    }
  };

  /**
   * 删除搜索历史
   * @param e
   * @param text
   */
  const delSearchHistory = (e: React.MouseEvent<HTMLAnchorElement>, text: string) => {
    deleteSearchHistory(text);
    setSearchHistoryList(listSearchHistory());
    e.stopPropagation();
  };

  /**
   * 渲染搜索历史标题
   */
  const renderSearchHistoryTitle = () => (
    <span>
      搜索历史
      <a style={{ float: 'right' }} onClick={clearAll}>
        <Space>
          <DeleteOutlined />
          清空
        </Space>
      </a>
    </span>
  );

  /**
   * 渲染搜索历史项
   * @param item
   */
  const renderSearchHistoryItem = (item: string) => ({
    value: `${item} `,
    label: (
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
        key={`his-${item}`}
      >
        {item}
        <a onClick={(e) => delSearchHistory(e, item)} style={{ fontSize: 10 }}>
          <CloseOutlined />
        </a>
      </div>
    ),
  });

  const renderHotSearchItem = (item: string, index: number) => ({
    value: item,
    label: (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
        key={`hot-${item}`}
      >
        <Space>
          <RankOrder index={index} />
          {item}
        </Space>
      </div>
    ),
  });
  /**
   * 选项组
   */
  const options = [
    {
      label: <span>热门搜索</span>,
      options:
        hotList?.length > 0 ? hotList.map((text, index) => renderHotSearchItem(text, index)) : [],
    },
    {
      label: renderSearchHistoryTitle(),
      options: searchHistoryList.map((text) => renderSearchHistoryItem(text)),
    },
  ];

  return (
    <div className={styles.headerSearch} style={style}>
      <AutoComplete
        value={value}
        options={options}
        style={{ width: '100%' }}
        onChange={(v) => {
          if (onChange && v.length < 40) {
            onChange(v);
          }
        }}
      >
        <Input.Search
          placeholder={placeholder}
          size="large"
          maxLength={40}
          enterButton
          onSearch={handleSearch}
        />
      </AutoComplete>
    </div>
  );
};

export default HeaderSearch;
