import { loadFlash } from 'sveltekit-flash-message/server';

import { useService } from '@/server/di';
import { AuthServiceId } from '@/server/services/auth.service';

export const load = loadFlash(() => ({
	session: useService(AuthServiceId).getClientSession(),
}));
