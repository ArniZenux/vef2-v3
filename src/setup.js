import { promises } from 'fs';
import { query, end } from './db_psql.js';

const dropfile = './sql/drop.sql';
const schemaFile = './sql/schema.sql';
const insertFile = './sql/insert.sql';

/**
 *   CREATE, INSERT and DROP.
 */
async function makeAll() {
  
  const dropData = await promises.readFile(dropfile);
  await query(dropData.toString('utf-8'));
  console.info('Table dropped');
  
  const schemadata = await promises.readFile(schemaFile);
  await query(schemadata.toString('utf-8'));
  console.info('Schema created');
  
  const insertdata = await promises.readFile(insertFile); 
  await query(insertdata.toString('utf-8'));
  console.info('Inserted file');
  
  await end();
  
  console.info('All files are inserted');
}

makeAll().catch((err) => {
  console.error('Error inserting schema', err);
});
