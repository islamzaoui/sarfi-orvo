import { redirect } from '@sveltejs/kit';

import { useService } from '@/server/container';

export const load = async () => {
	const { session } = useService('AuthService');
	if (!session) {
		redirect(302, '/signin');
	}
};
