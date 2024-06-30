<script lang="ts">
    import { PUBLIC_ANALYTICS_URL, PUBLIC_ANALYTICS_ID } from '$env/static/public';

    export const ssr = false;
    export const prerender = false;
    export const csr = true;
</script>

{#if PUBLIC_ANALYTICS_URL && PUBLIC_ANALYTICS_ID}
    <script defer src={PUBLIC_ANALYTICS_URL} data-website-id={PUBLIC_ANALYTICS_ID}></script>
{/if}