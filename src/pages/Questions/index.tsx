import React, { useEffect } from 'react';
import { message } from 'antd';
import { toLoginPage } from '@/utils/businessUtils';
import QuestionQueryList from '@/components/QuestionQueryList';
import { useModel } from '@@/plugin-model/useModel';
import type { CurrentUser } from '@/models/user';
import './style.less';

interface QuestionsProps {
  match: any;
  location: {
    pathname: string;
    query: {
      q?: string;
    };
  };
}

/**
 * 题目大全页
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const Questions: React.FC<QuestionsProps> = (props) => {
  const { location, match } = props;
  const searchText = location.query.q;
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const { key } = match.params;

  useEffect(() => {
    // eslint-disable-next-line no-restricted-globals
    window.scrollTo(0, 0);
  }, []);

  // 登录后才允许搜索
  if (searchText !== undefined && !currentUser._id) {
    message.info('登录后才能搜索哦');
    toLoginPage();
    return <></>;
  }

  return (
    <div className="questions">
      {/* 提取问题查找列表为单独组件 */}
      <QuestionQueryList searchText={searchText} tagKey={key} />
    </div>
  );
};

export default Questions;
