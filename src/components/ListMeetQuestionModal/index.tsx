import { Avatar, Button, List, message, Modal, Row, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { searchMeetQuestions } from '@/services/meetQuestion';
import type { MeetQuestionUserType } from '@/models/meetQuestion';
import type { QuestionType } from '@/models/question';
import type { PaperSearchParams } from '@/services/paper';
import { Link } from '@umijs/preset-dumi/lib/theme';
import type { TagType } from '@/models/tag';
import AddMeetQuestionModal from '@/components/AddMeetQuestionModal';
import { DEFAULT_AVATAR } from "@/constant";
import './style.less';

interface ListMeetQuestionModalProps {
  visible: boolean;
  question: QuestionType;
  onClose: () => void;
}

const DEFAULT_PAGE_PARAMS = {
  pageNum: 1,
  pageSize: 8,
};

/**
 * 遇到题目列表弹窗
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const ListMeetQuestionModal: React.FC<ListMeetQuestionModalProps> = (props) => {
  const { visible, question, onClose } = props;
  const [list, setList] = useState<MeetQuestionUserType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [addMeetModalVisible, setAddMeetModalVisible] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<PaperSearchParams>(DEFAULT_PAGE_PARAMS);

  const loadData = async () => {
    if (!question._id) {
      return;
    }
    setLoading(true);
    const queryParams = {
      questionId: question._id,
      ...searchParams,
    };
    const res = await searchMeetQuestions(queryParams);
    if (res) {
      setTotal(res.total);
      setList(res.data);
    } else {
      message.error('加载失败，请刷新重试');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!question?._id || !visible) {
      return;
    }
    loadData();
  }, [question, visible, searchParams]);

  const doCancel = () => {
    onClose();
  };

  /**
   * 标签列表
   * @param tags
   */
  const tagListView = (tags: TagType[]) => {
    return tags.map((tag: string) => {
      return (
        <Tag key={tag}>
          <Link to={`/tag/${tag}`} target="_blank">
            {tag}
          </Link>
        </Tag>
      );
    });
  };

  return (
    <>
      <Modal
        title={
          <Row justify="space-between">
            <div>{question.meetNum ?? 0}人遇到</div>
            <Button type="primary" size="small" style={{ marginRight: 32 }} onClick={() => {
              doCancel();
              setAddMeetModalVisible(true);
            }}>
              我遇到过
            </Button>
          </Row>
        }
        visible={visible}
        footer={null}
        destroyOnClose
        onCancel={() => doCancel()}
      >
        <List<MeetQuestionUserType>
          dataSource={list}
          loading={loading}
          split={false}
          pagination={{
            pageSize: searchParams.pageSize ?? DEFAULT_PAGE_PARAMS.pageSize,
            current: searchParams.pageNum ?? DEFAULT_PAGE_PARAMS.pageNum,
            showSizeChanger: false,
            total,
            onChange: (pageNum, pageSize) => {
              const params = {
                ...searchParams,
                pageSize,
                pageNum,
              };
              setSearchParams(params);
            },
          }}
          renderItem={(meetQuestion) => {
            return (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar size="large" src={meetQuestion.userInfo[0].avatarUrl || DEFAULT_AVATAR} />}
                  title={meetQuestion.userInfo[0].nickName}
                  description={tagListView(meetQuestion.tags)}
                />
              </List.Item>
            );
          }}
        />
      </Modal>
      <AddMeetQuestionModal
        questionId={question._id}
        visible={addMeetModalVisible}
        onClose={() => setAddMeetModalVisible(false)}
      />
    </>
  );
};

export default ListMeetQuestionModal;
