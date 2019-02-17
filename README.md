# King of the Board

Small project to keep track of board game scores between me and my friends.
Used it to learn some React and to get up to date on modern build tools, purposefully avoiding create-react-app in the end.

## Available Scripts

In the project directory, you can run:

### `npm run bootstrap`

Creates the sqlite database from the provided schema and generates a random password and jwt secret in an .env file. The password is required when adding scores on the board.

### `npm run dev`

Launches the backend server in development mode. The server is automatically restarted when backend files are edited and the webpack build is triggered when frontend files are changed.

### `npm run build`

Packages the app for production.

### `npm run start`

Runs the app in production.
