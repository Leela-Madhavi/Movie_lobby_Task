const MongoClient = require('mongodb').MongoClient;
const config = require('../config/config.json'); 
const connectionUrl = 'mongodb+srv://' + config.dbuser + ':' + config.dbpassword + '@' + config.connectString;
const connectionOptions = { MaxPoolSize: parseInt(config.MONGO_POOLSIZE) || 5, useUnifiedTopology: true };
const fileName = 'dbconnect';
 
 /**
 * This method gets the db connection for mongo
  */
 async function getDBConnection() {
    let connection = null;
    let prefix  = fileName+' : '+'getDBConnection() ';  
    console.log(prefix+'Enter');
    try {
          console.log(prefix+'get connection ');
          connection = await MongoClient.connect(connectionUrl, connectionOptions);     
      }
      catch (err) {
          console.log(prefix+'Inside catch Error::' + err.stack);
          throw err;
      }
      console.log(prefix+'Exit');
      return connection;
}

/**
 * This method gets the database from the connection
 */
 async function getDatabase(connection) {
    let database = null;
    let prefix  = fileName+' : '+'getDatabase() ';  
    console.log(prefix+'Enter');
        try{
            database = await connection.db();
            console.log(prefix+'connected to database ');
        }catch(err){
            console.log(prefix+'Exception occurred while connecting to database ' + err.stack);
            throw err;
        }
    console.log(prefix+'Exit');
    return database;
}

/**
 * This method releases the connection
 */
async function doRelease(conn) {
  let prefix  = fileName+' : '+'dorelease() '; 
  console.log(prefix+'Enter');
  if (conn) {
      try {
          await conn.close();
          console.log(prefix+'connection closed')
      } catch (err) {
          console.log(prefix+err.stack);
      }
  }
  console.log(prefix+'Exit');
}


 module.exports = {
     getDBConnection,
     getDatabase,
     doRelease
 }
