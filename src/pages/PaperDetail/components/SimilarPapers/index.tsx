import { List } from 'antd';
import React, { useEffect, useState } from 'react';
import PaperItem from '@/components/PaperItem';
import { searchPapers } from '@/services/paper';

interface SimilarPaperProps {
  paper?: PaperType;
}

/**
 * 相似试卷
 * @param props
 * @constructor
 */
const SimilarPapers: React.FC<SimilarPaperProps> = (props) => {
  const { paper } = props;

  const [papers, setPapers] = useState<PaperType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    if (paper?._id) {
      searchPapers({
        tags: [paper.tags[0]],
        pageSize: 3,
        ownership: 1,
      })
        .then((res) => {
          const resPaper = res.data;
          setPapers(resPaper.filter((p) => p._id != paper._id));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    loadData();
  }, [paper?._id]);

  return (
    <List<PaperType>
      itemLayout="vertical"
      dataSource={papers}
      loading={loading}
      renderItem={(item) => {
        return <PaperItem paper={item} key={item._id} />;
      }}
    />
  );
};

export default SimilarPapers;
