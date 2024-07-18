# Ham Log by S52KJ

A web-based ham radio logbook application in Svelte. Uses Supabase for authentication and database.

## Development

1. Prepare the Supabase database with the schema from [`schema.sql`](supabase/schema.sql)
2. Clone the repository
3. Install dependencies: `yarn install`
4. Create a `.env` file in the root of the project with the following content:
   ```
   PUBLIC_SUPABASE_URL=https://<your-supabase-url>.supabase.co
   PUBLIC_SUPABASE_ANON=<your-supabase-anon-key>
   ```
5. Run the development server: `yarn dev`
