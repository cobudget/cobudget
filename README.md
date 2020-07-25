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

### Running the project

#### Option 1

Run the whole stack (db + code) from the root with:

```
npm run dev
```

#### Option 2

Run the mongo db and the code separately using 2 terminals::

```
npm run db:up
```

```
npm start
```

> This last command calls `now dev`.

This builds and serves both the API and the UI with one command, and provides hot reloading.
`now dev` simulates the serverless deployment platform [Now](https://zeit.co/) where the project is deployed.

### Resetting the db to its initial state

While the db is running, in a new terminal:

```
npm run db:reset
```

### Using the local mongodb admin UI

Just visit http://localhost:8081

## Migrations
Until we have a proper migrations system - make sure you run migrations from `api/migrations` when instructed in the PR

## License

Released under the AGPLv3+ which is included in the file [LICENSE](LICENSE) in the git repository
