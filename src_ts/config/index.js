import ServerRoutes from './controller/ServerRoutes';
import ChannelRoutes from './controller/ChannelRoutes';
import RoleRoutes from './controller/RoleRoutes';
import FilterRoutes from './controller/FilterRoutes';

const express = require('express');
const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})

module.export = { app };