import { message, Tabs, Tooltip } from 'antd';
import React, { useState } from 'react';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import type { LoginParamsType } from '@/services/login';
import { QrcodeOutlined, QuestionCircleOutlined } from '@ant-design/icons/lib';
import { QR_CODE } from '@/constant';
import styles from './index.less';
import { login } from '@/services/login';
import { useModel } from '@@/plugin-model/useModel';

/**
 * 用户登录
 *
 * @constructor
 * @author liyupi
 */
const Login: React.FC = () => {
  const [type, setType] = useState<string>('scan');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { initialState, setInitialState } = useModel('@@initialState');

  const handleSubmit = async (values: LoginParamsType) => {
    let { captcha = '' } = values;
    captcha = captcha.trim();
    if (!captcha || captcha.length !== 6) {
      message.error('请输入 6 位动态码！');
      return;
    }
    values.captcha = captcha;
    setSubmitting(true);
    const currentUser = await login(values);
    if (currentUser) {
      message.success('登录成功');
      await setInitialState({ ...initialState, currentUser });
    } else {
      message.error('登录失败，请检查验证码后重试！或联系微信 code_nav');
    }
    setSubmitting(false);
  };

  return (
    <div className={styles.main}>
      <ProForm
        isKeyPressSubmit
        submitter={{
          render: (_, dom) => dom.pop(),
          submitButtonProps: {
            loading: submitting,
            size: 'large',
            style: {
              width: '100%',
            },
          },
        }}
        onFinish={async (values) => {
          handleSubmit(values as LoginParamsType);
        }}
      >
        <Tabs activeKey={type} onChange={setType} centered>
          <Tabs.TabPane key="scan" tab="微信扫码关注『 面试鸭 』登录" />
        </Tabs>
        {type === 'scan' && (
          <>
            <img src={QR_CODE} className={styles.qrcode} alt="关注公众号『 面试鸭 』登录" />
            <ProFormText
              fieldProps={{
                size: 'large',
                prefix: <QrcodeOutlined className={styles.prefixIcon} />,
                addonAfter: (
                  <>
                    <Tooltip
                      title="进入公众号，点一键登录获取动态码"
                      placement="topRight"
                      defaultVisible
                    >
                      <QuestionCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                    </Tooltip>
                  </>
                ),
              }}
              name="captcha"
              placeholder="请输入动态码（6位）"
              rules={[
                {
                  required: true,
                  message: '动态码是必填项！',
                },
              ]}
            />
          </>
        )}
      </ProForm>
    </div>
  );
};

export default Login;
