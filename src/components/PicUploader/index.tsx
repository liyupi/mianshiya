import { message, Upload } from 'antd';
import React, { useState } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
// @ts-ignore
import type { RcCustomRequestOptions, UploadChangeParam } from 'antd/lib/upload/interface';
import { uploadFile } from './service';
import './index.less';
import { useModel } from '@@/plugin-model/useModel';
import { CurrentUser } from '@/models/user';
import { toLoginPage } from '@/utils/businessUtils';

function beforeUpload(file: File) {
  const isFileTypeValid =
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    file.type === 'image/svg+xml' ||
    file.type === 'image/webp';
  if (!isFileTypeValid) {
    message.error('只能上传 JPG/PNG/SVG/WEBP 格式的文件!');
  }
  const isLt1M = file.size / 1024 / 1024 < 1;
  if (!isLt1M) {
    message.error('图片必须小于 1MB!');
  }
  return isFileTypeValid && isLt1M;
}

interface PicUploaderProps {
  onChange?: (url: string) => void;
  value?: string;
}

/**
 * 图片上传组件
 *
 * @author yupi
 */
const PicUploader: React.FC<PicUploaderProps> = (props) => {
  const { value, onChange } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const { initialState } = useModel('@@initialState');
  const { currentUser = {} as CurrentUser } = initialState || {};

  /**
   * 上传状态变更
   * @param info
   * @return {Promise<void>}
   */
  const handleChange = async (info: UploadChangeParam) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      console.log('img upload succeed');
    }
  };

  /**
   * 自实现上传
   * @param fileObj
   * @return {Promise<void>}
   */
  const doUpload = async (fileObj: RcCustomRequestOptions) => {
    if (!currentUser?._id) {
      message.error('请先登录！');
      toLoginPage();
      return;
    }
    const res = await uploadFile(fileObj.file);
    if (!res || !res.fileURL) {
      return;
    }
    const result = res.fileURL;
    if (result) {
      setLoading(false);
      if (onChange) {
        onChange(result);
      }
      fileObj.onSuccess(result, fileObj.file);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Upload
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      customRequest={doUpload}
    >
      {value ? <img src={value} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
    </Upload>
  );
};

export default PicUploader;
