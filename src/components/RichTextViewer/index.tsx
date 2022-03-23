import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import './index.less';

const modules = {
  syntax: true,
  toolbar: [
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
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};

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

interface RichTextViewerProps {
  htmlContent: string;
}

const RichTextViewer: React.FC<RichTextViewerProps> = (props) => {
  const { htmlContent } = props;

  return (
    <div className="editor-container rich-text-viewer">
      <ReactQuill theme="bubble" modules={modules} formats={formats} defaultValue={htmlContent} readOnly />
    </div>
  );
}

export default RichTextViewer;
