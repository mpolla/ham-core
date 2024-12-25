interface IEntity {
	adif: number;
	name: string;
	prefix: string;
	deleted: boolean;
	cqz?: number;
	cont?: string;
	long?: number;
	lat?: number;
	start?: string;
	end?: string;
	whitelist?: boolean;
	whitelist_start?: string;
	whitelist_end?: string;
}

interface IException {
	call: string;
	entity: number;
	adif: number;
	cqz?: number;
	cont?: string;
	long?: number;
	lat?: number;
	start?: string;
	end?: string;
}

interface IPrefix {
	call: string;
	entity: number;
	adif: number;
	cqz?: number;
	cont?: string;
	long?: number;
	lat?: number;
	start?: string;
	end?: string;
}

interface IInvalidOperation {
	call: string;
	start?: string;
	end?: string;
}

interface IZoneException {
	call: string;
	zone: number;
	start?: string;
	end?: string;
}

interface IClublog {
	entities: { entity: IEntity[] }[];
	exceptions: { exception: IException[] }[];
	prefixes: { prefix: IPrefix[] }[];
	invalid_operations: { operation: IInvalidOperation[] }[];
	zone_exceptions: { exception: IZoneException[] }[];
}

export interface IClublogFile {
	clublog: IClublog;
}
