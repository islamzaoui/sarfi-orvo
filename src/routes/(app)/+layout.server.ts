import { redirect } from '@sveltejs/kit';

import { useService } from '@/server/di';
import { AuthServiceId } from '@/server/services/auth.service';

export const load = async () => {
	const { session } = useService(AuthServiceId);
	if (!session) {
		redirect(302, '/signin');
	}
};
