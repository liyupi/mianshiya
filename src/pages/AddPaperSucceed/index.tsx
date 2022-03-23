import { Button, Card, Result, Space, Modal } from 'antd';
import React, { useEffect } from 'react';
import { Link, useDispatch } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import styles from './index.less';

const extra = (
  <Space size="middle">
    <Link to="/addPaper">
      <Button type="primary">继续创建</Button>
    </Link>
    <Link to="/account/info">
      <Button>返回主页</Button>
    </Link>
  </Space>
);

/**
 * 添加试卷成功页
 * @constructor
 */
const AddPaperSucceed: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    Modal.confirm({
      title: '试卷创建成功',
      content: '要清空试题篮吗？',
      okText: '清空',
      onOk: () => {
        localStorage.removeItem('localPickedQuestions');
        dispatch({
          type: 'editPaper/setPickedQuestions',
          payload: {
            1: [],
            2: [],
            3: [],
            0: [],
            4: [],
          },
        });
      },
    });
  }, []);
  return (
    <GridContent className={styles.addSucceed}>
      <Card style={{ marginBottom: '16px' }}>
        <Result
          status="success"
          title="提交成功"
          subTitle={
            <div>
              感谢您的推荐，我们将尽快审核
              <br />
              通过后自动发布并奖励积分
            </div>
          }
          extra={extra}
        />
      </Card>
    </GridContent>
  );
};

export default AddPaperSucceed;
