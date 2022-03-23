import { Row, Tag } from 'antd';
import type { CSSProperties } from 'react';
import React from 'react';
import moment from 'moment';
import type { QuestionType } from '@/models/question';
import styles from './index.less';
import { GOOD_QUESTION_PRIORITY } from '@/constant/question';
import { Link } from '@umijs/preset-dumi/lib/theme';

interface TagListProps {
  question?: QuestionType | PaperType;
  style?: CSSProperties;
}

/**
 * 标签列表
 * @param props
 * @constructor
 * @author liyupi
 */
const TagList: React.FC<TagListProps> = (props) => {
  const { question, style } = props;
  let tagListView;
  // 额外标签
  const extraTags = [];

  if (!question) {
    return null;
  }

  if (!question.tags) {
    question.tags = [];
  }

  tagListView = question.tags.map((tag: string) => {
    return (
      <Tag key={tag}>
        <Link to={`/tag/${tag}`} target="_blank">
          {tag}
        </Link>
      </Tag>
    );
  });

  if (question.priority === GOOD_QUESTION_PRIORITY) {
    extraTags.push(
      <Tag key="good" color="green">
        精选
      </Tag>
    );
  }

  if (moment(new Date()).diff(moment(question.publishTime), 'days') <= 3) {
    extraTags.push(
      <Tag key="new" color="green">
        最新
      </Tag>
    );
  }

  if (extraTags.length > 0) {
    tagListView = [...extraTags, ...tagListView];
  }

  return (
    <Row className={styles.tagList} style={style} gutter={[0, 8]}>
      {tagListView}
    </Row>
  );
};

export default TagList;
