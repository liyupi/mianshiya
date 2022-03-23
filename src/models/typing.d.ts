type PaperType = {
  _id: string;
  name: string;
  detail: string;
  questions: string;
  viewNum: number;
  tags: string[];
  userId: string;
  ownership: number;
  priority?: number;
  publishTime: Date;
  _createTime: Date;
  _updateTime: Date;
};

type pickedQuestionsType = {
  [key: number]: QuestionType[];
};
