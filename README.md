# Dreams

[Building a multi-tentant dreams platform](https://edgeryders.eu/t/rewrite-of-dreams-for-multi-tenancy-and-wider-adoption/11476)

## Tech stack

The project consists of two parts:

- `/api`: a GraphQL API built with Node.js, MongoDB and Apollo Server
- `/ui`: a front-end application built with React and Next.js

Everything on `master` is automatically deployed to [Now](https://zeit.co/) as [dreams.wtf](https://dreams.wtf)

## Development

### Prerequisites

- [Install and run](https://docs.docker.com/compose/install/) Docker-compose
- [Install Node.js](https://nodejs.org/en/) version >= 12.
  - Or run `nvm use` in this directory
- Install dependencies: `npm i`
  - This also installs dependencies in `/ui` and `/api`
- Copy `.env.default` to `.env`
- For `Firefox` browser - scroll to- to Subdomains section
- After running (Make sure you check #Postrequisites section below)

### Running the project

#### Option 1

Run the whole stack (db + code) from the root with:

```
export NODE_ENV=development && npm run dev
```

#### Option 2

Run the mongo db and the code separately using 2 terminals::

```
npm run db:up
```

```
export NODE_ENV=development && npm start
```

> This last command calls `now dev`.

This builds and serves both the API and the UI with one command, and provides hot reloading.
`now dev` simulates the serverless deployment platform [Now](https://zeit.co/) where the project is deployed.

# Postrequisites
After running for the first time add default organization
By visiting http://localhost:8081/db/test/organizations
Then add a new document with: 
```
{
  name: "Dev organization",
  subdomain: "dev-org"
}
```
Then navigate to http://dev-org.localhost:3000/

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

## License

Released under the AGPLv3+ which is included in the file [LICENSE](LICENSE) in the git repository
