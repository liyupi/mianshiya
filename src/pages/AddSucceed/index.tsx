import { Button, Card, Result, Space } from 'antd';
import React from 'react';
import { history, Link } from 'umi';
import { GridContent } from '@ant-design/pro-layout';
import styles from './index.less';

/**
 * 题目添加成功
 * @constructor
 */
const AddSucceed: React.FC = () => {
  const questionId = history.location.query?.rid as string;

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
          extra={
            <Space direction="vertical" size={16}>
              <Link to="/addQuestion">
                <Button type="primary">继续上传</Button>
              </Link>
              <Link to={`/qd/${questionId}`}>
                <Button>查看题目</Button>
              </Link>
              <Link to="/account/info">
                <Button>返回主页</Button>
              </Link>
            </Space>
          }
        />
      </Card>
    </GridContent>
  );
};

export default AddSucceed;
