// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			showQslModal?: boolean;
			showAdiModal?: boolean;
			logbookModal?: 'edit' | 'new';
			showQsoModal?: number;
			showConfirmModal?: boolean;
		}
		// interface Platform {}
	}
}

export {};
