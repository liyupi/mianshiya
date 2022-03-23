import React, { useState } from 'react';
import { Select, Drawer } from 'antd';
import TagTree from '@/components/TagTree';
interface FormTagTreeProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
}

function FormTagTree({ onChange, value = [] }: FormTagTreeProps) {
  const [visible, setVisible] = useState(false);

  const closeDrawer = () => setVisible(false);
  const openDrawer = () => setVisible(true);
  return (
    <div>
      <Select
        mode="multiple"
        value={value}
        placeholder="请选择知识点"
        onChange={(value1: string[]) => {
          onChange?.(value1);
        }}
        onFocus={openDrawer}
        style={{ width: '100%' }}
      />
      <Drawer title="知识树" width={520} onClose={closeDrawer} visible={visible}>
        <TagTree onChange={onChange} value={value} />
      </Drawer>
    </div>
  );
}

export default FormTagTree;
