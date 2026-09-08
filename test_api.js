const { v4: uuidv4 } = require('uuid');
const db = require('./dist/server.cjs').db; // wait, dist/server.cjs doesn't export db
