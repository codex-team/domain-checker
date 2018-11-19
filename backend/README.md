# Backend for domain-checker

## Quick start

- **Rename `.env.sample` to `.env` and edit config**

#### Express server

- `yarn start`

#### Workers

- Install [pm2](https://github.com/Unitech/PM2/)
- `cd src/workers`
- Edit `ecosystem.config.js` if needed. E.g scaling.
- `pm2 start ecosystem.config.js`

## API

Endpoints:

- `GET /api/` - Hello world
- `GET /api/checkDomain/:domain` - Send request to check domain availability.
  Response in format:

  ```json
  { "sucess": 1, "data": { "channelId": "b6b418b1-f8bd-4dc7-af1a-48b482525e92" } }
  ```

  Return codes:

  - 200 if OK
  - 500 if server error occured

    You should connect to WebSocket endpoint `/api/ws/:id` to get response answers.

- `WS /api/ws/:id` - Get domain availability results.
  Response in format:

  ```ws
  OK
  com
  su
  io
  ```

  Close codes:

  - 1000 if OK
  - 1008 if invalid id
  - 1011 if server error occured
  - 3001 if timeout reached

## Env vars

- `HOST: 0.0.0.0` Ip to bind to. Example: 0.0.0.0 bind to all interfaces, 127.0.0.1 bind to loopback interface
- `PORT: 3000` Port to listen
