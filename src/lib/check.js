import { validationResult } from 'express-validator';
import { list } from './db_psql.js';

export async function vidburdCheck(req, res, next) {
  const { name, comment } = req.body;

  const title = 'Viðburðasíðan';

  const formData = {name, comment};

  const validation = validationResult(req);

  const sqlVidburdur =  `
    SELECT * FROM 
      vidburdur;
    `;
  
  const boss = true; 

  const rows = await list(sqlVidburdur);

  if (!validation.isEmpty()) {
    return  res.render('admin', 
      { errors : validation.errors, 
        boss, 
        title, 
        formData, 
        events : rows 
    });
  }

  return next();
}

export async function adgangCheck(req, res, next) {
  const { username, password } = req.body;

  const title = 'Viðburðasíðan';

  const formData = {username, password};

  const validation = validationResult(req);

  const message = [];

  if (!validation.isEmpty()) {
    return  res.render('login', {errors : validation.errors, message, title , formData});
  }

  return next();
}

export async function userCheck(req, res, next) {
  const { name, comment } = req.body;
  
  const title = 'Viðburðasíðan';

  const formData = {name, comment};

  const validation = validationResult(req);

  const id = [req.body.id];

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
      vidburdur.id = $1;`;

  const rows = await list(sql, id); 
  const rowsUser = await list(sqlUser, id); 
    
  if (!validation.isEmpty()) {
    
    return res.render('vidburd', 
        {errors: validation.errors, 
         title , 
         events : rows, 
         users : rowsUser, 
         formData 
      });
  }
  
  return next();
}

export async function updateCheck(req, res, next) {
  const { name, slug, comment } = req.body;
  
  const title = 'Viðburðasíðan'; 
  
  const slg = [req.body.slug];

  const formData = {name, slug, comment};

  const validation = validationResult(req);

  const sql = `
    SELECT * FROM 
      vidburdur 
    WHERE 
      vidburdur.slug = $1;
    `;

  const rows = await list(sql, slg); 
    
  if (!validation.isEmpty()) {
    return res.render('update', {errors: validation.errors, title , events : rows, formData});
  }

  return next();
}