import copy from 'copy-to-clipboard';
import { WEB_HOST } from '@/constant';
import { shareQuestion } from '@/services/question';
import { message } from 'antd';
import { history } from 'umi';
import type { QuestionType } from '@/models/question';
import { stringify } from 'querystring';
import BraftEditor from 'braft-editor';
import type { LevelType } from '@/constant/level';
import { LEVEL_LIST } from '@/constant/level';
import type { CurrentUser, SimpleUser } from '@/models/user';

/**
 * 跳转至题目详情页
 * @param question
 * @param newWindow 是否新窗口打开
 */
export const toQuestionDetailPage = (question?: QuestionType, newWindow = true) => {
  if (!question?._id) {
    return;
  }
  const link = `/qd/${question._id}`;
  if (newWindow) {
    window.open(link);
  } else {
    history.replace(link);
  }
};

/**
 * 重定向至登录页
 */
export const toLoginPage = () => {
  history.replace({
    pathname: '/user/login',
    search: stringify({
      redirect: window.location.href,
    }),
  });
};

/**
 * 获取题目显示标题
 * @param question
 */
export const getQuestionTitle = (question?: QuestionType): string => {
  if (!question) {
    return '';
  }
  // 有标题直接用标题
  if (question.name) {
    return question.name.trim();
  }
  // 没标题，用描述代替
  return BraftEditor.createEditorState(question.detail).toText().trim();
};

/**
 * 分享题目
 */
export const doShareQuestion = async (question?: QuestionType) => {
  // 复制到剪切板，分享数 +1
  if (question && question._id) {
    let questionTitle = getQuestionTitle(question);
    if (questionTitle.length > 40) {
      questionTitle = questionTitle.substring(0, 40) + '...';
    }
    copy(`我在面试鸭发现了这道题『 ${questionTitle} 』💎 快来看看 ${WEB_HOST}/qd/${question._id}`);
    shareQuestion(question._id);
    message.success('链接已复制，感谢分享！');
  }
};

/**
 * 获得题目阅读文字
 * @param question
 * @param showReference
 * @param index 题号
 */
export const getQuestionSpeakText = (
  question: QuestionType,
  showReference = false,
  index?: number,
): string => {
  const textQuestionDetail = BraftEditor.createEditorState(question.detail).toText().trim();
  const questionTitle = getQuestionTitle(question);
  let speakText;
  if (index) {
    speakText = `第${index}题：${questionTitle} \n`;
  } else {
    speakText = `题目：${questionTitle} \n`;
  }
  if (questionTitle != textQuestionDetail) {
    speakText += `描述：${textQuestionDetail} \n`;
  }
  if (question.params?.options) {
    const optionText = question.params.options.map(
      (option, idx) => `${String.fromCharCode(65 + idx)} \n${option} \n`,
    );
    speakText += `选项：${optionText} \n`;
  }
  if (showReference && (question.reference || question.params?.answer)) {
    speakText += `解析：`;
    if (question.params?.answer) {
      speakText += question.params.answer + ' ';
    }
    if (question.reference) {
      speakText += BraftEditor.createEditorState(question.reference).toText();
    }
  }
  return speakText;
};

/**
 * 获取题目详情页链接
 * @param question
 * @returns {string}
 */
export const getQuestionDetailLink = (question: QuestionType) => {
  if (!question) {
    return '';
  }
  return `/qd/${question._id}`;
};

/**
 * 根据积分获取等级
 * @param score
 */
export const getLevel = (score?: number): LevelType => {
  if (!score) {
    return LEVEL_LIST[0];
  }
  for (let i = 1; i < LEVEL_LIST.length; i += 1) {
    if (score < LEVEL_LIST[i].score) {
      return LEVEL_LIST[i - 1];
    }
  }
  return LEVEL_LIST[LEVEL_LIST.length - 1];
};

/**
 * 是否为管理员
 * @param user
 * @returns {boolean}
 */
export const isAdminUser = (user: SimpleUser | CurrentUser) => {
  if (!user) {
    return false;
  }
  if (!user._id || !user.authority) {
    return false;
  }
  return user.authority.includes('admin');
};
