# dreams

[Building a multi-tentant dreams platform](https://edgeryders.eu/t/rewrite-of-dreams-for-multi-tenancy-and-wider-adoption/11476)

## Tech stack

The project consists of two parts:

- `/api`: a GraphQL API built with Node.js, MongoDB and Apollo Server
- `/ui`: a front-end application built with React and Next.js

Everything on `master` is automatically deployed to [Now](https://zeit.co/) as [dreams.wtf](https://dreams.wtf)

## Development

### Prerequisites

- [Install and run](https://docs.mongodb.com/manual/administration/install-community/) MongoDB
- [Install Node.js](https://nodejs.org/en/) version >= 10.
- Install Now CLI: `npm i -g now`
- Copy or rename `.env.default` to `.env`

### Running the project

Run the project from the root with

```
now dev
```

This will build and serve both the API and the UI with one command, and provide hot reloading.
`now dev` simulates the serverless deployment platform [Now](https://zeit.co/) where the project is deployed.
