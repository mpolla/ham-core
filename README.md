# Callsign Checker

An app for checking the format of a callsign and finding the country it belongs to.

## Downloading the country database

Data about countries can be downloaded from either [Amateur Radio Country Files by AD1C](https://www.country-files.com/) or [Clublog](https://clublog.freshdesk.com/support/solutions/articles/54902-downloading-the-prefixes-and-exceptions-as-xml).

### Obtaining the AD1C country database

Download any `cty.dat` file from the [Country Files](https://www.country-files.com/) website. I recommend using the [Big CTY](https://www.country-files.com/big-cty/) file.
Instead of `cty.dat` you can also use the `cty.csv` file.

Parsing of `cty.dat` or `cty.csv` can be done with the script [`cty-parser.ts`](./scripts/cty-dat-parser.ts).

`Note:` The `cty.dat` does not contain the `adif` DXCC number.

### Obtaining the Clublog prefix database `OBSOLETE`

Read how to obtain the Clublog prefix file [here](https://clublog.freshdesk.com/support/solutions/articles/54902-downloading-the-prefixes-and-exceptions-as-xml)

Parsing can be done with the script [`clublog-parser.ts`](./scripts/clublog-parser.ts).

## Deploying the app

The app can be deployed using the following command:

```bash
yarn install
yarn build
```

Deploy the contents of the `build` directory to your server.
