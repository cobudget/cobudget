#!/usr/bin/env bash

source ../ui/.env.local

export CROWDIN_PROJECT_ID=$CROWDIN_PROJECT_ID
export CROWDIN_API_TOKEN=$CROWDIN_API_TOKEN

npm run crowdin $1