import { message } from 'antd';
import axios from 'axios';
import Compressor from 'compressorjs';

interface fileUploadRes {
  fileURL: any;
}

export function uploadFile(file: File): Promise<fileUploadRes> {
  console.log('start uploadFile', file);
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,
      success(result: File) {
        const reader = new FileReader();
        reader.readAsDataURL(result);
        reader.onloadend = () => {
          axios
            .post('/file/upload', {
              filename: result.name,
              file: reader.result,
            })
            .then((res) => {
              const _res = res as unknown as fileUploadRes;
              resolve(_res);
            })
            .catch((e) => {
              message.error('上传失败');
              console.error('uploadFile error', e);
              reject(e);
            });
        };
      },
      error(e) {
        console.error('uploadFile error', e);
      },
    });
  });
}
