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

  res.render('index', {errors, events: rows, registrations, title, user,  admin: false, validated });
}

/**     
 *  GET - Ná ein viðburð undir admin og birta uppfæra-siðu
 */
async function getVidburdur(req, res){
  const { slug } = req.params;
  const title = 'Viðburðasíðan';
  const validated = req.isAuthenticated();
  const user = { req };

  const sql = `
    SELECT * FROM 
      vidburdur 
    WHERE 
      vidburdur.slug = $1;
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
    const rows = await list(sql, [slug]); 
    const rowsUser = await list(sqlUser, [slug]); 

    res.render('vidburd', {errors, title, events : rows, users : rowsUser, user, formData, validated, admin : false });
  }
  catch(e){
    console.error(e); 
  }
}

/**
 *  POST - að skrá í skraning - table
 */
async function indexSlugPost(req, res){
  const user = [req.body.name, req.body.comment, req.body.id, req.id];
  
  console.log(user); 

 /*return res.redirect('/');

  const sql = `
    INSERT INTO 
      skraning(nameskra, comment, eventid, userid) 
    VALUES($1, $2, $3, $4);
  `;

  let success = true; 
  
  try {
    success = insert(sql, user);
  }
  catch(e){
    console.error(e); 
  }

  if(success){
    return res.redirect('/');
  }

  return success;*/

}

router.get('/', catchErrors(index));
router.get('/:slug', getVidburdur);
router.post('/:slug', userMiddleware, catchErrors(userCheck), catchErrors(indexSlugPost));