import { loadFlash } from 'sveltekit-flash-message/server';

import { useService } from '@/server/container';

export const load = loadFlash(() => ({
	session: useService('AuthService').getClientSession(),
}));
