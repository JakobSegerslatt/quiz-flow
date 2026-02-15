import express from 'express';
import * as path from 'path';
import { createApp } from './app/create-app';

const app = createApp();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
