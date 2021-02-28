# Dreams

[Building a multi-tenant dreams platform](https://edgeryders.eu/t/rewrite-of-dreams-for-multi-tenancy-and-wider-adoption/11476)

## Tech stack

The project consists of two parts:

- `/api`: a GraphQL API built with Node.js, MongoDB and Apollo Server
- `/ui`: a front-end application built with React and Next.js

Everything on `master` is automatically deployed to [dreams.wtf](https://dreams.wtf)

## Development

### Prerequisites

- [Install and run](https://docs.docker.com/compose/install/) Docker-compose
- [Install Node.js](https://nodejs.org/en/) version >= 12.
- Install dependencies: `npm i`
  - This also installs dependencies in `/ui` and `/api`
- In /api, copy `.env.default` to `.env`
- In /ui, copy `.env.local.default` to `.env.local`
- For `Firefox` browser - scroll to- to Subdomains section
- After running (Make sure you check #Postrequisites section below)

### Requires a Keycloak server

You also need to set up a Keycloak server on your own. (TODO: add keycloak to development setup).

### Running the project

#### Option 1: single command

Run the whole stack (db + code) from the root with:

```
export NODE_ENV=development && npm run dev
```

#### Option 2: run db, api and ui separately

1. Run MongoDB either in Docker (with `npm run db:up` in the root) or [standalone](https://docs.mongodb.com/manual/installation/) (if you are running it standalone alter the url for mongo in `api/.env` to `MONGO_URL=mongodb://localhost/dreams`)
2. Run the API in one terminal: `cd api && npm run start`
3. Run the UI in another terminal: `cd ui && npm run dev`

# Postrequisites

After running for the first time, log in, add default organization
By visiting http://dev-org.localhost:3000/organizations/create
Make sure you fill the subdomain to be `dev-org` and dont set the `custom domain`
Then open the console and click the link to login to the new organization

### Resetting the db to its initial state

While the db is running, in a new terminal:

```
npm run db:reset
```

### Using the local mongodb admin UI

Just visit http://localhost:8081

### Subdomains

Currently when developing, Chrome is the only browser possible to support redirect sub.localhost:3000
To add support for firefox do the following:

1. Type in this url about:config search for network.dns.localDomains
2. Double click the "value" field.
3. Enter those urls seperated by commas dev-org.localhost,root.localhost

Now you can visit http://dev-org.localhost:3000 or http://root.localhost:3000

### Custom domains

A user can set a custom domain - it would always use `https` - make sure you set it like so under the `orgazniation` - add a `customDomain` field set to the custom domain. For example - `customdomain.com` OR `anothercustomdomain.com:3000` all lowercase

### Organizations

You can view local oragnizations by visiting `http://dev-org.localhost:3000/organizations`
Make sure you have the `isRootAdmin` set to your user

### Setting up your own deploy

#### Cloudinary

If you set up your own deploy - make sure you create a cloudinary account
also - make sure you create 2 presets named - "dreams" and "organization_logos"

## License

Released under the AGPLv3+ which is included in the file [LICENSE](LICENSE) in the git repository
