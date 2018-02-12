const pg = require('pg');
const connectionString = process.env.DATABASE_URL;// || 'postgres://localhost:5432/iwaconference';
pg.defaults.ssl = true;
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
  'CREATE TABLE abstract_topics( \
  abstract_id INT PRIMARY KEY NOT NULL, \
  topic CHAR(150) not null \
  )');
query.on('end', () => { client.end(); });