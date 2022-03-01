import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}

const pool = new pg.Pool({ connectionString });

pool.on('error', (err) => {
    console.error('error on idea client', err); 
    process.exit(-1);
});

export async function query(_query, values = []){
    const client = await pool.connect(); 
    
    try {
        const result = await client.query(_query, values);
        return result; 
    }catch(e) {
        console.error('Error setting', e); 
    }finally{
		client.release(); 
	} 
	
}

export async function list(_query, _values) {
	let result = []; 
	try {
		const queryResult = await query(_query, _values);

		if (queryResult && queryResult.rows) {
			result = queryResult.rows;
		}
	} catch(e) {
		console.error('Error -- ', e); 
	}
	return result; 
}

export async function insert(_query, _values){
	let success = true; 

	try {
		 await query(_query, _values);
	}
	catch(e){
		console.error('-Error inserting-', e);
		success = false;
	}
	return success; 
}

export async function update(_query, _values){
	let success = true; 

	try {
		 await query(_query, _values);
	}
	catch(e){
		console.error('-Error inserting-', e);
		success = false;
	}
	return success; 
}

export async function del(_query, _values){
	let success = true; 

	try {
		 await query(_query, _values);
	}
	catch(e){
		console.error('-Error inserting-', e);
		success = false;
	}
	return success; 
}

export async function end() {
  await pool.end();
}
