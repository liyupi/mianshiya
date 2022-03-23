import { Button, Result } from 'antd';
import React from 'react';
import { history } from 'umi';

// Q：404界面有俩header？  A:hack 方法，没找到具体咋修
const headerDom = document.getElementsByTagName('header')[0];
if (headerDom) {
  headerDom.hidden = true;
}

const NoFoundPage: React.FC<{}> = () => (
  <Result
    status="404"
    style={{ marginTop: 64 }}
    title="哎呀，走丢啦"
    extra={
      <Button type="primary" size="large" onClick={() => history.push('/')}>
        返回首页
      </Button>
    }
  />
);

export default NoFoundPage;
