import { ByteReader } from './byte-reader';

export type WsjtMessage = WsjtHeartbeat | WsjtDecode | WsjtQsoLogged;

export class WsjtHeartbeat {
	constructor(
		public readonly id: string,
		public readonly maxSchemaVersion: number,
		public readonly schemaVersion: string,
		public readonly revision: string
	) {}
}

export class WsjtDecode {
	constructor(
		public readonly id: string,
		public readonly isNew: boolean,
		public readonly time: number,
		public readonly snr: number,
		public readonly deltaTime: number,
		public readonly deltaFrequency: number,
		public readonly mode: string,
		public readonly message: string,
		public readonly lowConfidence: boolean,
		public readonly offAir: boolean
	) {}
}

export class WsjtQsoLogged {
	constructor(
		public readonly id: string,
		public readonly dateTimeOff: Date,
		public readonly dxCall: string,
		public readonly dxGrid: string,
		public readonly txFrequency: bigint,
		public readonly mode: string,
		public readonly reportSent: string,
		public readonly reportReceived: string,
		public readonly txPower: string,
		public readonly comments: string,
		public readonly name: string,
		public readonly dateTimeOn: Date,
		public readonly operatorCall: string,
		public readonly myCall: string,
		public readonly myGrid: string,
		public readonly exchangeSent: string,
		public readonly exchangeReceived: string,
		public readonly adifPropagationMode: string
	) {}
}

export function parseWsjtMessage(message: Uint8Array): WsjtMessage | null {
	const reader = new ByteReader(message);

	const magic = reader.readUint32();
	if (magic !== 0xadbccbda) {
		return null;
	}

	const schemaVersion = reader.readUint32();
	if (schemaVersion !== 2) {
		return null;
	}

	const messageType = reader.readUint32();
	switch (messageType) {
		case 0:
			return new WsjtHeartbeat(
				reader.readUtf8(),
				reader.readUint32(),
				reader.readUtf8(),
				reader.readUtf8()
			);
		case 2:
			return new WsjtDecode(
				reader.readUtf8(),
				reader.readBoolean(),
				reader.readQTime(),
				reader.readInt32(),
				reader.readDouble(),
				reader.readUint32(),
				reader.readUtf8(),
				reader.readUtf8(),
				reader.readBoolean(),
				reader.readBoolean()
			);
		case 5:
			return new WsjtQsoLogged(
				reader.readUtf8(),
				reader.readQDateTime(),
				reader.readUtf8(),
				reader.readUtf8(),
				reader.readUint64(),
				reader.readUtf8(),
				reader.readUtf8(),
				reader.readUtf8(),
				reader.readUtf8(),
				reader.readUtf8(),
				reader.readUtf8(),
				reader.readQDateTime(),
				reader.readUtf8(),
				reader.readUtf8(),
				reader.readUtf8(),
				reader.readUtf8(),
				reader.readUtf8(),
				reader.readUtf8()
			);
		default:
			return null;
	}
}
