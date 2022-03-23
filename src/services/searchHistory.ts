import { SEARCH_HISTORY_KEY } from '@/constant';
import axios from 'axios';

const SEARCH_HISTORY_MAX_LENGTH = 10;

/**
 * 添加搜索历史（本地）
 * @param searchText
 */
export function addSearchHistory(searchText: string) {
  if (!searchText) {
    return;
  }
  const historyList = listSearchHistory();
  const index = historyList.indexOf(searchText);
  // 没有搜索记录，把搜索值 push 进数组首位
  if (index < 0) {
    historyList.unshift(searchText);
  } else {
    // 有搜索记录，删除旧记录，重新push到数组首位
    historyList.splice(index, 1);
    historyList.unshift(searchText);
  }
  // 长度限制
  if (historyList.length > SEARCH_HISTORY_MAX_LENGTH) {
    historyList.splice(SEARCH_HISTORY_MAX_LENGTH, historyList.length - SEARCH_HISTORY_MAX_LENGTH);
  }
  updateSearchHistory(historyList);
  addSearchHistoryRemote(searchText);
}

/**
 * 添加搜索记录到远程
 *
 * @param searchText
 */
function addSearchHistoryRemote(searchText: string) {
  if (!searchText) {
    return false;
  }
  return axios
    .post('/search-history/add', {
      content: searchText,
    })
    .then((res: any) => {
      console.log(`addSearchHistoryRemote succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`addSearchHistoryRemote error`, e);
      return false;
    });
}

/**
 * 清空搜索历史
 */
export function deleteAllSearchHistory() {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
}

/**
 * 删除指定搜索历史
 * @param searchText
 */
export function deleteSearchHistory(searchText: string) {
  const historyList = listSearchHistory();
  const index = historyList.indexOf(searchText);
  if (index > -1) {
    historyList.splice(index, 1);
  }
  updateSearchHistory(historyList);
}

/**
 * 获取搜索历史
 */
export function listSearchHistory() {
  return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) ?? '[]');
}

/**
 * 更新搜索历史
 * @param historyList
 */
export function updateSearchHistory(historyList: string[]) {
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(historyList));
}

/**
 * 查询热搜列表
 */
export function listHotSearches() {
  return axios
    .post('/search-history/list/hot')
    .then((res: any) => {
      console.log(`listHotSearches succeed`, res);
      return res;
    })
    .catch((e: any) => {
      console.error(`listHotSearches error`, e);
      return [];
    });
}
