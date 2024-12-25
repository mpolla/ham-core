export class ByteReader {
	private static readonly qDataStreamNull = 0xffffffff;
	private static readonly textDecoder = new TextDecoder();

	private view: DataView;
	private pos = 0;

	constructor(buffer: Uint8Array) {
		this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
		this.pos = 0;
	}

	readUint8(): number {
		const v = this.view.getUint8(this.pos);
		this.pos += 1;
		return v;
	}

	readBoolean(): boolean {
		return this.readUint8() !== 0;
	}

	readUint32(): number {
		const v = this.view.getUint32(this.pos);
		this.pos += 4;
		return v;
	}

	readInt32(): number {
		const v = this.view.getInt32(this.pos);
		this.pos += 4;
		return v;
	}

	readUint64(): bigint {
		const v = this.view.getBigUint64(this.pos);
		this.pos += 8;
		return v;
	}

	readDouble(): number {
		const v = this.view.getFloat64(this.pos);
		this.pos += 8;
		return v;
	}

	readUtf8(): string {
		const length = this.readUint32();
		if (length === ByteReader.qDataStreamNull) {
			return '';
		}
		const v = ByteReader.textDecoder.decode(this.view.buffer.slice(this.pos, this.pos + length));
		this.pos += length;
		return v;
	}

	readQTime(): number {
		return this.readUint32();
	}

	readQDateTime(): Date {
		const date = this.readUint64();
		const msecs = this.readUint32();
		const isUtc = this.readBoolean();

		const epoch = (Number(date) - 2440588) * 86400000 + msecs;
		if (isUtc) {
			return new Date(epoch);
		} else {
			return new Date(epoch - new Date().getTimezoneOffset() * 60000);
		}
	}
}
