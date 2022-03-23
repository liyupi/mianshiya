export interface LevelType {
  score: number;
  name: string;
  color: string;
}

/**
 * 等级列表
 */
export const LEVEL_LIST: LevelType[] = [{
  score: 0,
  name: 'V1',
  color: 'green',
}, {
  score: 30,
  name: 'V2',
  color: 'cyan',

}, {
  score: 100,
  name: 'V3',
  color: 'blue',
}, {
  score: 200,
  name: 'V4',
  color: 'geekblue',
}, {
  score: 500,
  name: 'V5',
  color: 'orange',
}, {
  score: 1000,
  name: 'V6',
  color: 'volcano',
}, {
  score: 2000,
  name: 'V7',
  color: 'red'
}, {
  score: 5000,
  name: 'V8',
  color: 'magenta'
}, {
  score: 10000,
  name: 'V9',
  color: 'purple',
}, {
  score: 30000,
  name: 'V10',
  color: 'gold',
}];
