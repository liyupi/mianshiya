import { DefaultFooter } from '@ant-design/pro-layout';
import { Tooltip } from 'antd';
import { BugOutlined, InfoCircleOutlined } from '@ant-design/icons';
import React from 'react';

const GlobalFooter: React.FC = () => {
  return (
    <DefaultFooter
      copyright="2021 面试鸭 | 沪ICP备19026706号-3"
      links={[
        {
          key: 'github',
          title: (
            <Tooltip title="欢迎提出建议和 Bug 反馈">
              <BugOutlined />  产品反馈
            </Tooltip>
          ),
          href: 'https://support.qq.com/products/370820?',
          blankTarget: true,
        },
        {
          key: 'info',
          title: (
            <Tooltip title="本站所有题目均来源于网络，仅供学习参考，如有侵权，非常抱歉，请立即联系作者删除">
              <InfoCircleOutlined /> 免责声明
            </Tooltip>
          ),
          href: 'https://doc.code-nav.cn/#%E5%85%8D%E8%B4%A3%E5%A3%B0%E6%98%8E',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default GlobalFooter;
