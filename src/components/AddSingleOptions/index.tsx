import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Radio, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import './index.less';

const EditableCell = ({ changeOption, value, index }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<Input>(null);

  const [editValue, setEditValue] = useState(value);
  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    changeOption(index, editValue);
  };

  const save = async () => {
    try {
      toggleEdit();
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  return (
    <>
      <span style={{ width: 25, display: 'inline-block' }}>{`${String.fromCharCode(
        65 + index,
      )}`}</span>
      <Input
        value={editValue}
        placeholder="请输入选项"
        style={{
          width: '34vw',
          minWidth: 200,
        }}
        onChange={(e) => setEditValue(e.target.value)}
        ref={inputRef}
        onPressEnter={save}
        onBlur={save}
      />
    </>
  );
};

interface AddSingleOptionsProps {
  value?: {
    options: string[];
    answer: string;
  };
  onChange?: (params: any) => void;
}

const AddSingleOptions: React.FC<AddSingleOptionsProps> = ({
  value = {
    // 默认四个选项
    options: ['', '', '', ''],
    answer: '',
  },
  onChange,
}: AddSingleOptionsProps) => {
  const [options, setOptions] = useState([...value.options]);
  const [answer, setAnswer] = useState(value.answer || '');
  const onRadioChange = (e: any) => {
    setAnswer(e.target.value);
  };

  useEffect(() => {
    onChange?.({
      options,
      answer,
    });
  }, [answer, options]);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    const newOptions = options;
    newOptions.splice(index, 1);
    setOptions([...newOptions]);
  };

  const changeOption = (index: number, val: string) => {
    const newOptions = options;
    newOptions[index] = val;
    setOptions([...newOptions]);
  };
  return (
    <div>
      <Radio.Group onChange={onRadioChange} value={answer}>
        <Space direction="vertical">
          {options.map((option, index) => {
            const letter = String.fromCharCode(65 + index);
            return (
              <Radio value={letter} key={option}>
                <Space style={{ display: 'flex' }} align="baseline">
                  <EditableCell index={index} changeOption={changeOption} value={option} />
                  {options.length > 1 && (
                    <MinusCircleOutlined
                      onClick={(e) => {
                        removeOption(index);
                        e.preventDefault();
                      }}
                    />
                  )}
                </Space>
              </Radio>
            );
          })}
        </Space>
      </Radio.Group>
      <div style={{ margin: '10px 0' }}>{`正确答案：${answer}`}</div>
      <Button type="dashed" onClick={() => addOption()} block icon={<PlusOutlined />}>
        添加选项
      </Button>
    </div>
  );
};

export default AddSingleOptions;
