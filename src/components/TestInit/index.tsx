import { useModel } from 'umi';
import { Button } from 'antd';
import type { CurrentUser } from '@/models/user';

/**
 * todo 模拟登录用，正式上线需移除
 */
export default () => {
  const { setInitialState } = useModel('@@initialState');

  return (
    <>
      <Button
        onClick={() =>
          setInitialState({
            currentUser: {
              authority: 'admin',
            } as CurrentUser,
          })
        }
      >
        登录
      </Button>
      <Button onClick={() => setInitialState({})}>注销</Button>
    </>
  );
};
