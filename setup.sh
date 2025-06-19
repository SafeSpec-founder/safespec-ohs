#!/bin/bash
set -e

# Ensure Node.js v20 is available
if ! node -v | grep -q "^v20"; then
  npm install -g n
  n 20
fi

# Install frontend dependencies
npm ci

# Install functions dependencies
pushd functions
npm ci
popd

# Run linting
npm run lint
pushd functions
npm run lint || true
popd

# Run unit tests
npm test --if-present
