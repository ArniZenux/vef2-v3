import express from 'express';
import bcrypt from 'bcrypt';

import { body } from 'express-validator';
import { list, insert } from './db_psql.js';
import passport, { ensureLoggedIn } from './login.js';
import { catchErrors } from './utils.js';

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
  const { user } = req;
  return res.render('notendur', 
    { events: rows, 
      title, 
      user, 
      validated, 
      BirtaOne : false 
    });
}

async function einnNotandi(req, res){
  const title = 'Viðburðasíðan';
  const id = [req.params.id];

  const sql = `
    SELECT 
      *
    FROM 
      users, vidburdur
    WHERE
      users.id=$1 AND vidburdur.userid=users.id
    `;

  const validated = req.isAuthenticated();
  const { user } = req;
  const rows = await list(sql, id);
  return res.render('notendur', 
    { events: rows, 
      title, 
      user, 
      validated, 
      BirtaOne : true 
    });
}

async function myInfo(req, res){
  res.send('Upplýsingar um sjálf notanda');
}

async function nySkra(req, res) {
  
  const hashedPassword = await bcrypt.hash(req.body.password, 11);
  const info = [req.body.nameskra, req.body.username, hashedPassword, false];
    
  let success = true;   

  const sqlUser = `
    INSERT INTO 
      users(nameuser, username, password, admin) 
    VALUES($1, $2, $3, $4);
  `;
  
  try {
    success = await insert(sqlUser, info);
  }
  catch(e){
    console.error(e); 
  }

  if(success){
    return res.redirect('/');
  }
}

router.get('/', listNotenda);
router.get('/:id', einnNotandi);
router.get('/me', myInfo);
router.post('/register', catchErrors(nySkra));