import containerQueries from '@tailwindcss/container-queries';
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			container: {
				center: true,
				padding: '1rem'
			}
		}
	},
	daisyui: {
		logs: false,
		themes: ['dim']
	},
	plugins: [containerQueries, daisyui]
};
