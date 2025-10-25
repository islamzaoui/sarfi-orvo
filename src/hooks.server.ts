import 'reflect-metadata';
import { sequence } from '@sveltejs/kit/hooks';

import { DIHandle } from '@/server/di/hooks';

export const handle = sequence(DIHandle);
