import { sequence } from '@sveltejs/kit/hooks';

import { ServiceCollectionHandle } from '@/server/di';
import { AuthService } from '@/server/services/auth.service';

export const handle = sequence(ServiceCollectionHandle, AuthService.handle);
