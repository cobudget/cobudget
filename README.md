# Cobudget

## Tech stack

Next.js, Urql, Apollo, Prisma, PostgreSQL

## Development

### Prerequisites

- [Install and run](https://docs.docker.com/compose/install/) Docker-compose
- [Install Node.js](https://nodejs.org/en/) version >= 14.
  - Or run `nvm use` in this directory
- Install dependencies in `/ui`
  - `yarn`
- In /ui, copy `.env.local.default` to `.env.local`

### Running the project

#### Start development databse

In `/ui`:

```
docker-compose up
```

### Start development process

In `/ui`

```
yarn dev
```

## License

Released under the AGPLv3+ which is included in the file [LICENSE](LICENSE) in the git repository
