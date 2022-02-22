import express from 'express';
import { body } from 'express-validator';
import { catchErrors } from '../lib/catch-errors.js';
import { list, insert } from '../lib/db_psql.js';
import { userCheck } from '../lib/check.js';

export const indexRouter = express.Router();

const userMiddleware = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 64 })
    .withMessage('Nafn má að hámarki vera 64 stafir'),
  body('comment')
    .isLength({ min: 1 })
    .withMessage('Vantar athugasemd'),
  body('comment')
    .isLength({ max: 400 })
    .withMessage('Athugasemd má að hámarki vera 400 stafir'),
];

/**     
 *  GET 
 */
async function indexRoute(req, res) {
  const title = 'Viðburðasíðan';
  const sqlVidburdur = 'SELECT * FROM vidburdur';
  const rows = await list(sqlVidburdur);

  const admin = true; 
  const validated = req.isAuthenticated();

  res.render('index', {title, validated, admin, events : rows});
}

/**     
 *  GET 
 */
async function indexSlug(req, res){
  const title = 'Viðburðasíðan';

  const slug = [req.params.slug];
 
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
    const rows = await list(sql, slug); 
    const rowsUser = await list(sqlUser, slug); 

    res.render('vidburd', {errors, title, events : rows, users : rowsUser, formData });
  }
  catch(e){
    console.error(e); 
  }
}

/**
 *  POST - að skrá í skraning - table
 */
async function indexSlugPost(req, res){
  
  const user = [req.body.name, req.body.comment, req.body.id, req.body.id];

  const sql = `
    INSERT INTO 
      skraning(name, comment, userid, eventid) 
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

  return success;
}

/**
 *  GET  
 */
indexRouter.get('/', catchErrors(indexRoute));
indexRouter.get('/:slug', catchErrors(indexSlug));

/**
 * POST -  þáttendur skrá sig í námskeið. 
 */  
indexRouter.post('/:slug', 
  userMiddleware, 
  catchErrors(userCheck),
  catchErrors(indexSlugPost));
