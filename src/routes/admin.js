import express from 'express';
import passport from 'passport'; 

import { body } from 'express-validator';
import { list, insert, update } from '../lib/db_psql.js';
import { vidburdCheck, adgangCheck, updateCheck } from '../lib/check.js';
import { ensureLoggedIn } from '../lib/login.js';
import { catchErrors } from '../lib/catch-errors.js';

export const adminRouter = express.Router();

const adgangMiddleware = [
  body('username')
    .isLength({ min: 1 })
    .withMessage('Notandi má ekki vera tómt'),
  body('username')
    .isLength({ max: 64 })
    .withMessage('Notandi má að hámarki vera 64 stafir'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Vantar lyklaorð'),
  body('password')
    .isLength({ max: 256 })
    .withMessage('Hámark 256 stafir'),
];

const vidburdMiddleware = [
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 64 })
    .withMessage('Nafn má að hámarki vera 64 stafir'),
  body('comment')
    .isLength({ min: 1 })
    .withMessage('Vantar lýsing'),
  body('comment')
    .isLength({ max: 400 })
    .withMessage('Hámarki vera 400 stafir'),
];

/**     
 *  GET 
 */
async function adminIndex(req, res){
  const title = 'Viðburðasíðan';
  const errors = [];  
  const formData = [];

  const sqlVidburdur = `
    SELECT * FROM 
      vidburdur;
    `;
  
  const boss = true; 

  const rows = await list(sqlVidburdur);

  res.render('admin', {errors, boss, title, formData, events : rows });
}

/**     
 *  GET 
 */
async function adminLogin(req, res){
  const validated = req.isAuthenticated();
  if (validated) {
    return res.redirect('/');
  }

  let message = '';
  const errors = [];
  
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.render('login', {validated, errors, message, title: 'Innskráning' });
} 

/**     
 *  GET 
 */
async function adminSlug(req, res){
  const sluq = [req.params.slug];
  const errors = [];
  const formData = [];

  const sql = `
    SELECT 
      *
    FROM 
      vidburdur 
    WHERE 
      vidburdur.slug = $1;
  `;

  try {
    const rows = await list(sql, sluq);

    res.render('update', { errors, title: 'Uppfæra viðburð', events : rows, formData});
  }
  catch(e){
    console.error(e); 
  }
}

/**
 *  POST  
 */
async function adminPost(req, res){
  const title = 'Viðburðasíðan';

  const errors = [];
  const formData = [];
  
  const sqlVidburdur = `
    SELECT * FROM 
      vidburdur;
  `;
  
  const boss = true; 

  const rows = await list(sqlVidburdur);

  res.render('admin', {errors, boss,  title, formData, events : rows });
}

/**
 *  POST - stjórandi skrá nýjan viðburði. 
 */
async function adminVidburdurPost(req, res){

  let success = true;   
  
  const nameSlug = req.body.name.split(' ').join('-').toLowerCase();
  
  const info = [req.body.name, nameSlug, req.body.comment];
  
  const sql = `
    INSERT INTO 
      vidburdur(name, slug, description) 
    VALUES($1, $2, $3);
  `;

  try {
    success = insert(sql, info);
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
 *  POST - Stjórandi uppfæra viðburði
 */
async function adminSlugPost(req, res){
  const title = 'Viðburðasíðan';

  const info = [req.body.name, req.body.comment, req.body.slug];
  const errors = [];
  const formData = [];

  let success = true; 
  
  const sql = `
    UPDATE 
      vidburdur 
    SET 
      name = $1, description = $2 
    WHERE 
      vidburdur.slug = $3;
  `;
  
  try {
    success = update(sql, info);
  }
  catch(e){
    console.error(e);
  }

  if(success){
    const sqlVidburdur = `
      SELECT * FROM 
        vidburdur;
      `;
  
    const rows = await list(sqlVidburdur);

    const boss = true; 
    
    res.render('admin', {errors, boss, title , formData, events : rows });
  }
  else {
    return res.redirect('/');
  }

  return success; 
}

/**
 *  GET  
 */
adminRouter.get('/', ensureLoggedIn, catchErrors(adminIndex));
adminRouter.get('/login', catchErrors(adminLogin));
adminRouter.get('/:slug',  catchErrors(adminSlug));

/**
 *  POST    
 */ 
// Innganguskrá ef það er rétt password og notandi þá 
// birta viðburð með FORM.
adminRouter.post('/login', 
  adgangMiddleware, 
  catchErrors(adgangCheck),
  
  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/admin/login',
  }),
  catchErrors(adminPost),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    res.redirect('/admin');
  },
);

// Stjórnandi skrá nýja viðburði (mikið vesen að nota bara /admin/, (virkar betur á /admin/skraVidburdi))
adminRouter.post('/skraVidburdi', 
    ensureLoggedIn,
    vidburdMiddleware, 
    catchErrors(vidburdCheck), 
    catchErrors(adminVidburdurPost));

// Stjórandi uppfæra viðburði 
adminRouter.post('/:slug', 
  vidburdMiddleware, 
  catchErrors(updateCheck), 
  catchErrors(adminSlugPost));

adminRouter.get('/logout', (req, res) => {
  // logout hendir session cookie og session
  req.logout();
  res.redirect('/');
});
