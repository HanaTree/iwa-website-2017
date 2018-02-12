const pg = require('pg');
const connectionString = process.env.DATABASE_URL;//|| 'postgres://localhost:5432/iwaconference';
//pg.defaults.ssl = true;

/*var config = {
  user: 'qicddvscotnwln',
  database: 'd1lnqt0p99bpsu',
  password: 'fdb1a4a1e8a12c4d4534cd9065f322ccae3d23973ee56ae9f9f85555410d12ba',
  host: 'ec2-23-23-93-255.compute-1.amazonaws.com',
  port: 5432,
  max: 10,
  idleTimeoutMillis: 30000,
}*/
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
  'CREATE TABLE extended_abstract( \
  abstract_id SERIAL,\
  author_title VARCHAR(40) not null, \
  first_name VARCHAR(40) not null,\
  last_name VARCHAR(40) not null,\
  institute VARCHAR(40) not null,\
  position VARCHAR(40) not null,\
  department VARCHAR(40) not null,\
  address VARCHAR(40) not null,\
  postal_code VARCHAR(10) not null,\
  city VARCHAR(20) not null,\
  country VARCHAR(40) not null,\
  phone_number VARCHAR(15) not null,\
  email VARCHAR(40) not null,\
  abstract_title VARCHAR(40) not null,\
  presenters_name VARCHAR(40) not null,\
  keyword_1 VARCHAR(15),\
  keyword_2 VARCHAR(15),\
  keyword_3 VARCHAR(15),\
  abstract_topic VARCHAR(100) not null,\
  presentation_type VARCHAR(40) not null,\
  abstract_file_name VARCHAR(100) not null,\
  accepted BOOLEAN DEFAULT false)'
  );
query.on('end', () => { client.end(); });