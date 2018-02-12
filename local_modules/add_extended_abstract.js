const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/iwaconference';
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
  "INSERT INTO extended_abstract VALUES( \
  'Mr.', \
  'Avi',\
  'Kejariwal',\
  'UCLA',\
  'Student',\
  'EE',\
  'Veteran Avenue',\
  '90024',\
  'Los Angeles',\
  'USA',\
  '3128237114',\
  'avikejariwal@ucla.edu',\
  'How to do something',\
  'AK',\
  'homer',\
  'marge',\
  'bart',\
  'world stuff',\
  'poster',\
  'file_323')"
  );
query.on('end', () => { client.end(); });