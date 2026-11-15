import 'dotenv/config'; import {Pool} from 'pg'; import bcrypt from 'bcryptjs';
const db=new Pool({connectionString:process.env.DATABASE_URL});
const permissions=['profile.read','profile.update','department.create','department.manage','cbt.create','cbt.manage','cbt.publish','cbt.question.manage','cbt.results.read','cbt.results.export','aashraya.request.create','aashraya.manage','sahayi.request.create','sahayi.manage','samskara.manage','scholarx.submit','scholarx.manage','helpdesk.ticket.create','helpdesk.manage','admin.manage'];
for(const code of permissions)await db.query('INSERT INTO permissions(code) VALUES($1) ON CONFLICT(code) DO NOTHING',[code]);
for(const role of ['student','department_coordinator','module_coordinator','moderator','admin','super_admin'])await db.query('INSERT INTO roles(name) VALUES($1) ON CONFLICT(name) DO NOTHING',[role]);
if(process.env.SEED_ADMIN_EMAIL&&process.env.SEED_ADMIN_PASSWORD){
 const u=(await db.query<any>('INSERT INTO users(email,password_hash,email_verified) VALUES($1,$2,true) ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash RETURNING id,email',[process.env.SEED_ADMIN_EMAIL.toLowerCase(),await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD,12)])).rows[0];
 const role=(await db.query<any>("SELECT id FROM roles WHERE name='super_admin'")).rows[0];
 await db.query('INSERT INTO profiles(user_id,full_name) VALUES($1,$2) ON CONFLICT DO NOTHING',[u.id,'Platform Administrator']);
 await db.query('INSERT INTO user_roles(user_id,role_id,module) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[u.id,role.id,'platform']);
}
await db.end(); console.log('Seed complete');
