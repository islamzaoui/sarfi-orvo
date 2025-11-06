import { sequence } from '@sveltejs/kit/hooks';

import { serviceContainerHandle } from '@/server/container';
import { AuthService } from '@/server/services/auth.service';

export const handle = sequence(serviceContainerHandle, AuthService.handle);
