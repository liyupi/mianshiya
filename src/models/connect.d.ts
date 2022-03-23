import type { MenuDataItem } from '@ant-design/pro-layout';
import type { UserModelState } from './user';
import type { TagModelState } from './tagsMap';
import type { QuestionModelState } from './question';
import type { editPaperModelState } from './editPaper';

export interface Loading {
  global: boolean;
  effects: Record<string, boolean | undefined>;
  models: {
    menu?: boolean;
    user?: boolean;
    question?: boolean;
    tag?: boolean;
  };
}

export interface ConnectState {
  loading: Loading;
  user: UserModelState;
  question: QuestionModelState;
  tag: TagModelState;
  editPaper: editPaperModelState;
}

export interface Route extends MenuDataItem {
  routes?: Route[];
}
