const pg = require('pg');
const connectionString = process.env.DATABASE_URL;// || 'postgres://localhost:5432/iwaconference';

var config = {
  user: 'postgres',
  database: 'iwaconference',
  password: 'gooner95',
  host: 'localhost',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
}
const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
  'CREATE TABLE users( \
  user_id VARCHAR(40) not null,\
  password TEXT not null \
)'
  );
query.on('end', () => { client.end(); });