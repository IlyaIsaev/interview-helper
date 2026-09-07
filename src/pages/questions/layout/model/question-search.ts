import { action, reatomString, sleep, withAbort, wrap } from '@reatom/core';

import { refetchQuestions } from '@/entities/question';

export const questionSearch = reatomString('', 'questionSearch');

export const searchQuestions = action(async () => {
  await wrap(sleep(300));

  await wrap(refetchQuestions());
}, 'searchQuestions').extend(withAbort());
