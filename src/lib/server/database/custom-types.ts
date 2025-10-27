import { customType } from 'drizzle-orm/sqlite-core';

export const uint8Array = customType<{
	data: Uint8Array;
	driverData: ArrayBufferLike;
}>({
	dataType() {
		return 'BLOB';
	},
	toDriver(value: Uint8Array): ArrayBufferLike {
		return value.buffer;
	},
	fromDriver(value: ArrayBufferLike): Uint8Array {
		return new Uint8Array(value);
	},
});
