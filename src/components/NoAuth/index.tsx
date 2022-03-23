import { Button, Result } from 'antd';
import React from 'react';
import { Link } from 'umi';
import { stringify } from 'qs';

export const NoAuth: React.FC = () => {
  return (
    <Result
      status={403}
      title="登录后即可访问"
      extra={
        <Button type="primary" size="large">
          <Link
            to={{
              pathname: '/user/login',
              search: stringify({
                redirect: window.location.href,
              }),
            }}
          >
            一键登录
          </Link>
        </Button>
      }
    />
  );
};
