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

### TODOS

- [ ] Logbooks
  - [x] Create logbook
  - [x] Edit logbook
  - [x] Delete logbook
  - [ ] Add more fields
- [ ] QSO
  - [x] Create QSO
  - [x] View QSO
  - [ ] Edit QSO
  - [x] Delete QSO
  - [ ] Add fields
    - [ ] SOTA, POTA, WWFF, IOTA, etc.
    - [ ] QSL card
    - [ ] QRZ, LOTW, eQSL, ClubLog, etc. upload status
    - [ ] Operator info (Name, Qth, etc.)
- [x] Export ADIF
- [x] Logbook analysis
  - [x] DXCC entities
  - [x] Continents
  - [x] Bands
- [x] Migrate QSL CSV generation to modal
- [ ] Add TRX and antenna fields to QSL CSV
- [ ] Add QRZ, LOTW, eQSL, ClubLog, etc. support
- [ ] Add operator lookup (QRZ, HamQTH, etc.)
- [ ] Add separate logbook and location information
- [x] Map
  - [x] Last N QSO on map
    - [ ] Handle unsure locations
  - [ ] Current QSO path on map
  - [x] Azimuthal map
  - [x] Locator grid
    - [ ] Grid labels
    - [ ] 4 and 6 digit grid squares
  - [ ] Better zoom and pan
  - [x] Night/day overlay
  - [ ] Sun position?
  - [x] Persist map settings
  - [ ] Pskreporter integration
  - [ ] Reverse beacon network integration
  - [ ] DXCC entities, CQ, ITU zones (maybe)
  - [ ] Find better map provider
- [ ] QSO statistics
  - [ ] Per band, mode, etc.
  - [ ] DXCC, continents, grids by band, mode
  - [ ] QSO per hour, month, year
  - [ ] By distance
- [ ] Offline support
- [ ] Contest mode
  - [ ] Cabrillo export
- [ ] SFI, SSN, A, K index meters
- [ ] Realtime QSO updates

#### Tauri

A list of things to implement when Tauri gets added

- [x] WSJT-X integration
- [ ] Rig control (Hamlib)
- [ ] N1MM integration
- [ ] Background QSO logging
- [x] Telnet Cluster integration

## References

- [D3 Map](https://d3js.org/d3-geo)
- [D3 Projection](https://d3js.org/d3-geo/projection)
- [D3 Map with sun](https://observablehq.com/@d3/solar-terminator)
- [Country borders](https://github.com/topojson/world-atlas)
