import { writeAdifFile } from '@ham-core/adif';
import { Qso } from '$lib/models/qso';
import type { ILog, IQso } from '$lib/supabase';

export function generateText(qsos: IQso[], logs: ILog[]): string {
	const res = qsos.map((q) => new Qso(q).toAdif(logs.find((l) => l.id === q.log_id)));
	const header = {
		ADIF_VER: '3.1.4',
		CREATED_TIMESTAMP: new Date()
			.toISOString()
			.slice(0, 19)
			.replace('T', ' ')
			.replaceAll(/-|:/g, ''),
		PROGRAMID: 'HamLog by S52KJ'
	};
	return writeAdifFile({ header, records: res });
}
