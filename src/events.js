import express from 'express';
import { body, validationResult } from 'express-validator';
import xss from 'xss';

import { list, insert } from './db_psql.js';
import { userCheck } from './check.js';
import { catchErrors, pagingInfo, PAGE_SIZE, setPagenumber } from './utils.js';

export const router = express.Router();

const userMiddleware = [
  body('nameskra')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('nameskra')
    .isLength({ max: 64 })
    .withMessage('Nafn má að hámarki vera 64 stafir'),
  body('comment')
    .isLength({ min: 1 })
    .withMessage('Vantar athugasemd'),
  body('comment')
    .isLength({ max: 400 })
    .withMessage('Athugasemd má að hámarki vera 400 stafir'),
];

// Viljum keyra sér og með validation, ver gegn „self XSS“
const xssSanitizationMiddleware = [
  body('name').customSanitizer((v) => xss(v)),
  body('nationalId').customSanitizer((v) => xss(v)),
  body('comment').customSanitizer((v) => xss(v)),
  body('anonymous').customSanitizer((v) => xss(v)),
];

const sanitizationMiddleware = [
  body('name').trim().escape(),
  body('nationalId').blacklist('-'),
];

async function index(req, res) {
  const validated = req.isAuthenticated();
  const title = 'Viðburðasíðan';
  
  console.log(validated); 

  const sqlVidburdur = `
    SELECT 
      *
    FROM 
      vidburdur, users 
    WHERE 
      vidburdur.userid=users.id 
  `;
  
  const rows = await list(sqlVidburdur);
  const registrations = [];
  const user = { req };
  const errors = [];

  
  const output = JSON.stringify({
    title,
    validated,
    rows,
    user,
  });

  //res.render('index', {errors, events: rows, registrations, title, user,  admin: false, validated });
  return res.send(output); 
}

/**     
 *  GET - Ná ein viðburð undir admin og birta uppfæra-siðu
 */
async function getVidburdur(req, res){
  const { id } = req.params;
  const title = 'Viðburðasíðan';
  const validated = req.isAuthenticated();
  const user = { req };

  const sql = `
    SELECT * FROM 
      vidburdur 
    WHERE 
      vidburdur.id = $1;
    `;

  const sqlUser = `
    SELECT * FROM 
      vidburdur, skraning 
    WHERE 
      vidburdur.id=skraning.eventid 
    AND 
      vidburdur.slug = $1;
    `;

  const errors = [];
  const formData = [];

  try {
    const rows = await list(sql, [id]); 
    const rowsUser = await list(sqlUser, [id]); 

    res.render('vidburd', { user, formData, errors, title, events : rows, users : rowsUser, admin : true, validated });

  }
  catch(e){
    console.error(e); 
  }
}

/**
 *  POST - notandi skráð viðburði. 
 */
async function userPostNewEvent(req, res){
  let success = true;   
  const validated = req.isAuthenticated();
  const { user } = req; 
  const nameSlug = req.body.namevidburdur.split(' ').join('-').toLowerCase();
  const info = [req.body.namevidburdur, nameSlug, req.body.comment, user.id];
  console.log(info); 
  console.log("Hello Pútin - þú ert geðsjúklingur!!");

  const sqlVidburdur = `
    INSERT INTO 
      vidburdur(namevidburdur, slug, description, userid) 
    VALUES($1, $2, $3, $4);
  `;

  try {
    success = await insert(sqlVidburdur, info);
  }
  catch(e){
    console.error(e); 
  }

  if(success){
    return res.redirect('/admin');
  }

  return res.render('error', {validated,  title: 'Gat ekki skráð' });
}

router.get('/', index);
router.get('/:id', getVidburdur);
//router.patch('/:id', getVidburdur);
//router.delete(d)
router.post('/', catchErrors(userPostNewEvent));
//router.post('/:id/register', catchErrors(userPostEvent));
