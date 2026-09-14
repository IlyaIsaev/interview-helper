import { atom } from '@reatom/core';
import type { DeepReadonly } from 'es-toolkit/types';

import type { DemoUserCredentials } from '@/shared/api';

export type DemoCredentials = DeepReadonly<DemoUserCredentials>;

export const createdDemoUser = atom<DemoCredentials | null>(
  null,
  'createdDemoUser',
);
