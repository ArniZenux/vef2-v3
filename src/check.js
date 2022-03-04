import { validationResult } from 'express-validator';
import { list } from './db_psql.js';

export async function vidburdCheck(req, res, next) {
  const title = 'Viðburðasíðan';
  const { namevidburdur, comment } = req.body;

  const formData = { namevidburdur, comment };
  const validated = req.isAuthenticated();

  const validation = validationResult(req);
  
  const sqlVidburdur = `
    SELECT 
      *
    FROM 
      vidburdur
    `;
  const rows = await list(sqlVidburdur);
  const { search } = req.query;
  const { user } = req;

  if ( !validation.isEmpty() && user.admin ) {
    return res.render('index', 
      { 
        user, 
        formData, 
        errors : validation.errors, 
        events: rows, 
        title, 
        admin: true, 
        validated
     });
  }
 
  return next();
}

export async function nyskraCheck(req, res, next){
  const title = 'Viðburðasíðan';
  const { nameskra, username, password } = req.body;

  const formData = { nameskra, username, password };
  const validated = req.isAuthenticated();
  const { user } = req; 
  const validation = validationResult(req);
  const registrations = [];

  const sqlVidburdur = `
    SELECT 
      *
    FROM 
      vidburdur
    `;
  const rows = await list(sqlVidburdur);

  if ( !validation.isEmpty()) {
    return res.render('index', 
      { 
        formData, 
        registrations,  
        errors : validation.errors, 
        events: rows, 
        title, 
        user,  
        validated, 
        admin: false 
    });
  }
 
  return next();
}

export async function adgangCheck(req, res, next) {
  const { username, password } = req.body;

  const title = 'Viðburðasíðan';

  const formData = {username, password};
  const validated = req.isAuthenticated();

  const validation = validationResult(req);

  const message = [];

  if (!validation.isEmpty()) {
    return  res.render('login', 
      { errors : validation.errors, 
        message, 
        title, 
        formData, 
        validated
    });
  }

  return next();
}

export async function userCheck(req, res, next) {
  const { nameskra, comment } = req.body;
  
  const title = 'Viðburðasíðan';

  const formData = {nameskra, comment};
  const validated = req.isAuthenticated();

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
         formData,
         validated 
      });
  }
  
  return next();
}

export async function updateCheck(req, res, next) {
  const { nameskra, slug, comment } = req.body;
  
  const title = 'Viðburðasíðan'; 
  
  const slg = [req.body.slug];
  const validated = req.isAuthenticated();

  const formData = {nameskra, slug, comment};

  const validation = validationResult(req);

  const sql = `
    SELECT * FROM 
      vidburdur 
    WHERE 
      vidburdur.slug = $1;
    `;

  const rows = await list(sql, slg); 
   
  console.log("hello");
  
  if (!validation.isEmpty()) {
    return res.render('vidburd', 
      { errors: validation.errors, 
        title, 
        events : rows, 
        formData, 
        validated
    });
  }

  return next();
}