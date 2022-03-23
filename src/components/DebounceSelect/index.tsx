import React from 'react';
import { Select, Spin } from 'antd';
import debounce from 'lodash/debounce';

interface DebounceSelectProps {
  fetchOptions: any;
  debounceTimeout: number;
  placeholder: string;
}

/**
 * 搜索防抖下拉选择
 *
 * @param props
 * @constructor
 * @author liyupi
 */
const DebounceSelect: React.FC<DebounceSelectProps> = (props) => {
  const { debounceTimeout, fetchOptions, placeholder } = props;

  const [fetching, setFetching] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const fetchRef = React.useRef(0);

  const debounceFetcher = React.useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then((newOptions: any) => {
        if (fetchId !== fetchRef.current) {
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  return (
    <Select
      {...props}
      showSearch
      placeholder={placeholder}
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      options={options}
    />
  );
}; // Usage of DebounceSelect

export default DebounceSelect;
