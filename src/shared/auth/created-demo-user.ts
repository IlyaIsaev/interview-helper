import { atom } from '@reatom/core';
import type { DeepReadonly } from 'es-toolkit/types';

export type DemoCredentials = DeepReadonly<{
  email: string;
  password: string;
}>;

export const createdDemoUser = atom<DemoCredentials | null>(
  null,
  'createdDemoUser',
);
