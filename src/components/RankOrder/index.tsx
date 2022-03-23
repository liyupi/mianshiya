import React from 'react';
import classnames from 'classnames';
import './index.less';

function RankOrder({ index }) {
  return (
    <span>
      <div className="HotItem-index">
        <div
          className={classnames({
            'HotItem-rank': true,
            'HotItem-hot': index < 3,
          })}
        >
          {index + 1}
        </div>
      </div>
    </span>
  );
}

export default RankOrder;
