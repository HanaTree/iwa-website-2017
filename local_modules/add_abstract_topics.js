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
  "INSERT INTO abstract_topics VALUES\
  (1,'Diffuse Pollution from urban/semi-arid areas and their impacts'),\
  (2,'Diffuse Pollution from rural/agricultural areas and their impacts'),\
  (3,'Eutrophication and harmful algal blooms'),\
  (4,'Impacts of extreme events and climate change'),\
  (5,'Applications of remote sensing and internet of things'),\
  (6,'Sustainable urban development and green infrastructure'),\
  (7,'Modelling diffuse pollution and watershed water quality'),\
  (8,'Integrated watershed/basin management'),\
  (9,'Fate and transport of chemical contaminants and pathogens from diffuse sources'),\
  (10,'Groundwater recharge and replenishment'),\
  (11,'Emerging contaminants and micropollutants'),\
  (12,'Governance & policy'),\
  (13,'Water economics')"
  );
query.on('end', () => { client.end(); });