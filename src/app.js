import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';

import passport from './lib/login.js';

import { indexRouter } from './routes/index-routes.js';
import { adminRouter } from './routes/admin.js';

dotenv.config();

const { 
  HOST: hostname = '127.0.0.1',
  PORT: port = 3000, 
  SESSION_SECRET: sessionSecret,
  DATABASE_URL: connectionString,
} = process.env;

if (!sessionSecret || !connectionString) {
  console.error('Vantar .env gildi');
  process.exit(1);
}

const app = express();

app.use(express.urlencoded({ extended: true }));

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../public')));

app.set('views', join(path, '../views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

function isInvalid(field, errors = []) {
  return Boolean(errors.find((i) => i && i.param === field));
}

app.locals.isInvalid = isInvalid;

app.use('/admin', adminRouter);
app.use('/', indexRouter);

/**
 * Handler error 
 */
function notFounderHandler(req, res){
  const title = 'Síða fannst ekki';
  res.status(404).render('error', { title });
}

function errorHandler(err, req, res){
  console.error(err);
  const title = 'Villa kom upp';
  res.status(500).render('error', { title });
}

app.use(notFounderHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});
