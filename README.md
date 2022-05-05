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

Then, run `yarn migrate` in another terminal.

### Start development process

In `/ui`

```
yarn dev
```

You can login with the link shown in the terminal.

### Translation

We are using crowdin + react-intl for translations. It works like this

1. Text is rendered using FormatMessage component which is imported from react-intl. The default message is the message which appears if a translation is missing.
2. The id of the text is generated using hash function.
3. `yarn extract` command extracts the default messages from the code and assign them an id. These are stored in en.json file.
4. The en.json file is uploaded to crowdin using `yarn crowdin:upload` command.
5. After translating text, translations can be downloaded using the command `yarn crowdin:download`

## License

Released under AGPL-3.0-or-later, with some additional terms. All of which are included in the file [LICENSE](LICENSE) in the git repository.
