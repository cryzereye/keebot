//import { ConfigRepository } from './repo/ConfigRepository';

//export const repo = new ConfigRepository();

const express = require('express');
const app = express();
const port = 3000;

app.use(require('./controller/ServerRoutes'));
app.use(require('./controller/ChannelRoutes'));
app.use(require('./controller/RoleRoutes'));
app.use(require('./controller/FilterRoutes'));

app.listen(port, () => {
  console.log(`Config service on port ${port}`);
});