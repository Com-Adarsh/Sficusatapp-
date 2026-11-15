import 'dotenv/config'; import fs from 'node:fs/promises'; import path from 'node:path'; import {Pool} from 'pg';
const db=new Pool({connectionString:process.env.DATABASE_URL});
const dir=path.resolve(process.cwd(),'sql');
await db.query('CREATE TABLE IF NOT EXISTS schema_migrations(filename text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())');
for(const file of (await fs.readdir(dir)).filter(x=>/^\d+_.*\.sql$/.test(x)).sort()){
 if((await db.query('SELECT 1 FROM schema_migrations WHERE filename=$1',[file])).rowCount)continue;
 const sql=await fs.readFile(path.join(dir,file),'utf8'); const c=await db.connect();
 try{await c.query('BEGIN');await c.query(sql);await c.query('INSERT INTO schema_migrations(filename) VALUES($1)',[file]);await c.query('COMMIT');console.log('Applied',file)}
 catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}
}
await db.end();
