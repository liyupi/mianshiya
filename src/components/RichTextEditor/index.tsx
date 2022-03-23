import React, { useState, useEffect, useRef } from 'react';
import { Tooltip, message } from 'antd';
import type { Range, UnprivilegedEditor } from 'react-quill';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { ExpandOutlined } from '@ant-design/icons';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import './index.less';
import { uploadFile } from '@/components/PicUploader/service';
//https://github.com/chenjuneking/quill-image-drop-and-paste
import QuillImageDropAndPaste from 'quill-image-drop-and-paste';
// @ts-ignore
import BlotFormatter from 'quill-blot-formatter/dist/BlotFormatter';
// @ts-ignore
import ImageSpec from 'quill-blot-formatter/dist/specs/ImageSpec';
import type { Sources } from 'quill';

Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste);
Quill.register('modules/blotFormatter', BlotFormatter);
// formats 用于控制允许的输入格式，与 toolbar 是独立的
const formats = [
  'bold',
  //'color', 先不要五颜六色的字体吧
  'code',
  'italic',
  'link',
  'size',
  'strike',
  'script',
  'underline',
  'blockquote',
  'header',
  'indent',
  'list',
  'align',
  'direction',
  'code-block',
  'image',
];

interface RichTextEditorProps {
  value?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  onBlur?: (previousSelection: Range, source: Sources, editor: UnprivilegedEditor) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = (props) => {
  const { value = '', placeholder, onChange, onBlur } = props;
  const [quillValue, setQuillValue] = useState('');
  const handle = useFullScreenHandle();
  const [changeCount, setChangeCount] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const quillRef = useRef(ReactQuill);

  useEffect(() => {
    // 只在初始化的时候回填 quillValue ，否则会导致光标跳转
    if (changeCount > 2) return;
    setQuillValue(value);
  }, [value]);

  const handleEditorChange = (html: string) => {
    setQuillValue(html);
    setChangeCount(changeCount + 1);
    onChange?.(html);
  };

  const toggleFull = () => (fullScreen ? handle.exit() : handle.enter());

  const uploadImageAddInsert = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    if (!/^image\/.*/.test(file.type)) {
      message.error('只能上传图片文件！');
      return;
    }
    // @ts-ignore
    const quillEditor = quillRef.current.getEditor();
    const res = await uploadFile(file);
    if (!res || !res.fileURL) {
      return;
    }
    const result = res.fileURL;
    if (result) {
      const range = quillEditor.getSelection();
      console.log(range);
      quillEditor.insertEmbed(range?.index || 0, 'image', result);
    }
  };

  const imageHandler = () => {
    //debugger;
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      uploadImageAddInsert(file);
    };
  };

  const pastImageHandler = async (dataUrl: string, type: string, imageData: any) => {
    const file = imageData.toFile();
    uploadImageAddInsert(file);
  };
  // 加上 imageHandler 之后，输入卡顿，一次只能输入一个字符。类似问题：https://github.com/quilljs/quill/issues/2034
  // 这个地方真是绝了，😬这BUG离谱 https://github.com/quilljs/quill/issues/1940#issuecomment-379536850
  // before： const modules = {}
  const [modules] = useState({
    syntax: true,
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        [
          'bold',
          'italic',
          'link',
          'underline',
          'strike',
          { script: 'sub' },
          { script: 'super' },
          'blockquote',
          'image',
          'code-block',
          { list: 'ordered' },
          { list: 'bullet' },
          // { indent: '-1' },
          // { indent: '+1' },
          // { align: [] },
        ],
      ],
      handlers: {
        image: imageHandler,
      },
    },
    imageDropAndPaste: {
      handler: pastImageHandler,
    },
    blotFormatter: {
      specs: [ImageSpec],
    },
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
  });

  return (
    <FullScreen handle={handle} onChange={(state) => setFullScreen(state)} className="full-screen">
      <div className="editor-container rich-text-editor">
        <Tooltip placement="left" title="全屏编辑">
          <ExpandOutlined onClick={toggleFull} className="full-screen-toggle" />
        </Tooltip>
        <ReactQuill
          // @ts-ignore
          ref={quillRef}
          theme="snow"
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          value={quillValue}
          onChange={handleEditorChange}
          onBlur={onBlur}
        />
      </div>
    </FullScreen>
  );
};
export default RichTextEditor;
