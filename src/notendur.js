import express from 'express';
import xss from 'xss';

import { body } from 'express-validator';
import { list } from './db_psql.js';
import passport, { ensureLoggedIn } from './login.js';
import { nyskraCheck } from './check.js';
import { catchErrors, pagingInfo, PAGE_SIZE } from './utils.js';

export const router = express.Router();

const nySkraMiddleware = [
  body('nameskra')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('nameskra')
    .isLength({ max: 64 })
    .withMessage('Nafn má að hámarki vera 64 stafir'),
  body('username')
    .isLength({ min: 1 })
    .withMessage('Notanid má ekki vera tómt'),
  body('username')
    .isLength({ max: 64 })
    .withMessage('Notandi má að hámarki vera 64 stafir'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Lyklaorð má ekki vera tómt'),
  body('password')
    .isLength({ max: 400 })
    .withMessage('Lyklaorð má að hámarki vera 256 stafir'),
];

async function listNotenda(req, res){
  const title = 'Viðburðasíðan';
  const sql = `
    SELECT 
      *
    FROM 
      users
    WHERE
      admin=false;
    `;

  const validated = req.isAuthenticated();
  const rows = await list(sql);
  return res.render('notendur', { events: rows, title, validated, BirtaOne : false });
}

async function einnNotandi(req, res){
  const title = 'Viðburðasíðan';
  const id = [req.params.id];

  const sql = `
    SELECT 
      *
    FROM 
      users
    WHERE
      users.id=$1;
    `;

  const validated = req.isAuthenticated();
  const rows = await list(sql, id);
  return res.render('notendur', { events: rows, title, validated, BirtaOne : true });
}

async function nySkra(req, res) {
  const info = [req.body.nameskra, req.body.username, req.body.password];
  console.log(info);
  console.log("Hello nýr notandi");
}

router.get('/', listNotenda);
router.get('/:id', einnNotandi);

router.post('/register', nySkraMiddleware, catchErrors(nyskraCheck), catchErrors(nySkra));