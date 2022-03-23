import { Button, Col, Form, message, Modal, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import type { CurrentUser } from '@/models/user';
import { useModel } from '@@/plugin-model/useModel';
import RichTextEditor from '@/components/RichTextEditor';
import BraftEditor from 'braft-editor';
import { addComment, getComment, updateComment } from '@/services/comment';
import { useAccess } from '@@/plugin-access/access';
import { CommentUserType } from '@/models/comment';
import './style.less';

interface AddCommentModalProps {
  visible: boolean;
  questionId: string;
  commentId?: string;
  onClose: () => void;
  onReload?: (comment: CommentUserType) => void;
}

/**
 * 创建或修改评论
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const AddCommentModal: React.FC<AddCommentModalProps> = (props) => {
  const { visible, questionId, commentId, onClose, onReload } = props;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [content, setContent] = useState<string>('');
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};
  const access = useAccess();

  const loadData = async () => {
    if (commentId) {
      const res = await getComment(commentId);
      if (!res) {
        message.error('加载失败，请刷新重试');
        return;
      }
      if (res.userId !== currentUser._id && !access.canAdmin) {
        message.error('只能修改自己的回答');
        onClose();
        return;
      }
      setContent(res.content);
    }
  };

  useEffect(() => {
    if (!visible || !questionId || !currentUser._id) {
      return;
    }
    loadData();
  }, [currentUser, questionId, commentId, visible]);

  const doSubmit = async () => {
    if (!content || BraftEditor.createEditorState(content).toText()?.trim().length < 1) {
      message.error('请输入回答内容');
      return;
    }
    if (!currentUser._id) {
      message.warning('请先登录');
      return;
    }
    setSubmitting(true);
    let res;
    // 修改
    if (commentId) {
      res = await updateComment(commentId, {
        content,
      });
      if (res) {
        message.success('修改成功');
      } else {
        message.error('修改失败，请重试！');
      }
    } else {
      // 新增
      res = await addComment({
        content,
        questionId,
        userId: currentUser._id,
      });
      if (res) {
        message.success('感谢您的回答');
      } else {
        message.error('回答失败，请重试！');
      }
    }
    // 操作成功
    if (res) {
      // 封装新评论
      const commentUser: CommentUserType = {
        // @ts-ignore
        _id: res,
        userId: currentUser._id,
        questionId,
        content,
        thumbNum: 0,
        _createTime: new Date(),
        _updateTime: new Date(),
        userInfo: [currentUser],
      };
      onReload?.(commentUser);
      setContent('');
      onClose();
    }
    setSubmitting(false);
  };

  const doCancel = () => {
    onClose();
    setContent('');
  };

  return (
    <Modal
      title={`${commentId ? '修改' : '写'}回答`}
      width="60vw"
      style={{ minWidth: 300 }}
      visible={visible}
      destroyOnClose
      maskClosable={false}
      footer={null}
      onCancel={() => doCancel()}
    >
      <Form.Item>
        <RichTextEditor value={content} onChange={(value: string) => setContent(value)} />
      </Form.Item>
      <Form.Item>
        <Row gutter={24} justify="end">
          <Col>
            <Button htmlType="reset" block onClick={() => doCancel()}>
              取消
            </Button>
          </Col>
          <Col span={8}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={submitting}
              disabled={submitting}
              onClick={() => doSubmit()}
            >
              {submitting ? '提交中' : '提交'}
            </Button>
          </Col>
        </Row>
      </Form.Item>
    </Modal>
  );
};

export default AddCommentModal;
