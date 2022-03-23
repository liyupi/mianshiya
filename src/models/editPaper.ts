import type { Reducer } from 'umi';
import type { QuestionType } from './question';

export interface editPaperModelState {
  pickedQuestions: pickedQuestionsType;
  // 本地缓存用户选择的题目
}

export interface editPaperModelType {
  namespace: 'editPaper';
  state: editPaperModelState;
  effects: {};
  reducers: {
    setPickedQuestions: Reducer<editPaperModelState>;
    addPickedQuestions: Reducer<editPaperModelState>;
    deletePickedQuestions: Reducer<editPaperModelState>;
    changePickedQuestionsOrder: Reducer<editPaperModelState>;
  };
}

const getLocalPickedQuestions: () => pickedQuestionsType = () => {
  const localPickedQuestions = localStorage.getItem('localPickedQuestions');
  if (!localPickedQuestions) {
    return {
      1: [],
      2: [],
      3: [],
      0: [],
      4: [],
    };
  }
  return JSON.parse(localPickedQuestions);
};

const UserModel: editPaperModelType = {
  namespace: 'editPaper',
  state: {
    pickedQuestions: getLocalPickedQuestions(),
  },
  reducers: {
    setPickedQuestions(state, action) {
      localStorage.setItem('localPickedQuestions', JSON.stringify(action.payload));
      return {
        ...state,
        pickedQuestions: action.payload || [],
      };
    },
    addPickedQuestions(state, action) {
      const question: QuestionType = action.payload;
      const pickedQuestions = state?.pickedQuestions || [];
      pickedQuestions[question.type].push(question);
      localStorage.setItem('localPickedQuestions', JSON.stringify(pickedQuestions));
      return {
        ...state,
        pickedQuestions: pickedQuestions || [],
      };
    },
    deletePickedQuestions(state, action) {
      const question: QuestionType = action.payload;
      const pickedQuestions = state?.pickedQuestions || [];
      pickedQuestions[question.type] = pickedQuestions[question.type].filter(
        (q) => q._id !== question._id,
      );
      localStorage.setItem('localPickedQuestions', JSON.stringify(pickedQuestions));
      return {
        ...state,
        pickedQuestions: pickedQuestions || [],
      };
    },
    changePickedQuestionsOrder(state, action) {
      const { questions } = action.payload;
      const pickedQuestions = state?.pickedQuestions || [];
      const type = questions[0].type;
      pickedQuestions[type] = questions;
      localStorage.setItem('localPickedQuestions', JSON.stringify(pickedQuestions));
      return {
        ...state,
        pickedQuestions: pickedQuestions || [],
      };
    },
    // changePickedQuestionsOrder(state, action) {
    //   const { question, index } = action.payload;
    //   const pickedQuestions = state?.pickedQuestions || [];
    //   pickedQuestions[question.type] = pickedQuestions[question.type].filter(
    //     (q) => q._id !== question._id,
    //   );
    //   pickedQuestions[question.type].splice(index, 0, question);
    //   localStorage.setItem('localPickedQuestions', JSON.stringify(pickedQuestions));
    //   return {
    //     ...state,
    //     pickedQuestions: pickedQuestions || [],
    //   };
    // },
  },
  effects: {},
};

export default UserModel;
