import express from 'express';
import xss from 'xss';
import { body } from 'express-validator';
import { list, insert, update } from './db_psql.js';
import passport, { ensureLoggedIn } from './login.js';
import { vidburdCheck, updateCheck } from './check.js';
import { catchErrors } from './utils.js';

export const router = express.Router();

const vidburdMiddleware = [
  body('namevidburdur')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki dfg vera tómt'),
  body('namevidburdur')
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
 *  GET - admin-síða 
 */
async function index(req, res) {

  const title = 'Viðburðasíðan';
  
  const sqlVidburdur = `
     SELECT 
      *
    FROM 
      vidburdur 
    `;
  
  const rows = await list(sqlVidburdur);
  const validated = req.isAuthenticated();
  const errors = [];
  const formData = [];
  const { search } = req.query;
  const { user } = req;

  if(user.admin){
    return res.render('index', 
      { user, 
        formData, 
        errors, 
        events: rows, 
        title, 
        admin: true, 
        search: xss(search), 
        validated
    });
  }
  else{
    return res.render('index', 
      { user, 
        formData, 
        errors, 
        events: rows, 
        title, 
        admin: false, 
        search: xss(search), 
        validated
    });
  }
}

/**     
 *  GET - innskráningusiða
 */
function login(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
  }

  let message = '';
  const errors = [];
  const validated = req.isAuthenticated();
  const user = { req };
  if (req.session.messages && req.session.messages.length > 0) {
    message = req.session.messages.join(', ');
    req.session.messages = [];
  }

  return res.render('login',
     { validated, 
       user, 
       errors, 
       message, 
       title: 'Innskráning'
     });
}

/**
 *  POST
 */
async function deleteRoute(req, res) {
  const validated = req.isAuthenticated();
  const { id } = req.params;
  const deleted = deleteRow(id);

  if (deleted) { // Tæknilega böggur hér...
    return res.redirect('/admin');
  }

  return res.render('error', {validated,  title: 'Gat ekki eytt færslu' });
}

/**
 *  POST
 */
async function skraVidburdur(req, res){
  let success = true;   
  const validated = req.isAuthenticated();
  const { user } = req; 
  const nameSlug = req.body.namevidburdur.split(' ').join('-').toLowerCase();
  const info = [req.body.namevidburdur, nameSlug, req.body.comment, user.id];

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

/**
 *  POST - Stjórandi uppfæra viðburði
 */
async function adminSlugPost(req, res){
  const validated = req.isAuthenticated();

  const info = [req.body.namevidburdur, req.body.comment, req.body.slug];
  
  let success = true; 
  
  const sql = `
    UPDATE 
      vidburdur 
    SET 
      namevidburdur = $1, description = $2 
    WHERE 
      vidburdur.slug = $3;
  `;
  
  try {
    success = await update(sql, info);
  }
  catch(e){
    console.error(e);
  }

  if(success){
    return res.redirect('/admin');
  }

  return res.render('error', {validated,  title: 'Gat ekki breytt færslu' });
}

router.get('/', ensureLoggedIn, catchErrors(index));
router.get('/login', login);

router.post(
  '/login',

  // Þetta notar strat að ofan til að skrá notanda inn
  passport.authenticate('local', {
    failureMessage: 'Notandanafn eða lykilorð vitlaust.',
    failureRedirect: '/admin/login',
  }),

  // Ef við komumst hingað var notandi skráður inn, senda á /admin
  (req, res) => {
    res.redirect('/admin');
  },
);

router.post('/:slug', 
  ensureLoggedIn, 
  vidburdMiddleware, 
  catchErrors(updateCheck), 
  catchErrors(adminSlugPost)
); 

router.post('/', 
  ensureLoggedIn, 
  vidburdMiddleware, 
  catchErrors(vidburdCheck), 
  catchErrors(skraVidburdur)
); 

router.post('/delete/:id', 
  ensureLoggedIn, 
  catchErrors(deleteRoute)
);

router.get('/logout', (req, res) => {
  // logout hendir session cookie og session
  req.logout();
  res.redirect('/');
});