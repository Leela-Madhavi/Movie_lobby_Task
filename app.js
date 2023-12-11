var express = require('express');
var app = express();
var bodyParser = require('body-parser')
require('body-parser-xml')(bodyParser);
var config = require('./src/config/config.json');
var dbconnect = require('./src/database/dbconnect');
var url = require('url');
app.use(bodyParser.json());
const ObjectId = require("mongodb").ObjectId;


const checkAdminRole = (req, res, next) => {
    const userRole = req.headers['user-role']; 
  
    if (userRole === 'admin') {
      next(); 
    } else {
      res.status(403).json({ error: 'Forbidden. Admin role required.' });
    }
};
/**
 * Initializes the service.
 * Get a DB connection
 */
async function initService() {
    const logPrefix = "initService(): ";
    console.log("Entering" + logPrefix)
    try {
    const connection = await dbconnect.getDBConnection();
    database = await dbconnect.getDatabase(connection);
    const collection = database.collection(config.COLLECTION_NAME)
    app.get('/movies',async function(req,res){
       const result = await collection.find().toArray();
       console.log(JSON.stringify(result));
       res.send(result);
    });
    app.get('/search',async function(req,res){
        var movietitle = req.query.q;
        console.log(movietitle);
        const result = await collection.find({"MovieTitle":movietitle}).toArray();
        res.send(result);
     });
     app.post('/movies', checkAdminRole, async function(req, res){
        const newMovie = req.body;
        const MovieTitle = newMovie.MovieTitle;
        const Rating = newMovie.Rating;
        const genre = newMovie.genre;
        const Streaminglink = newMovie.Streaminglink;
        const response = {}
        response.MovieTitle = MovieTitle;
        response.Rating = Rating;
        response.genre = genre;
        response.Streaminglink = Streaminglink;
        const result = await collection.insertOne(response);
        res.json({ message: 'Movie added successfully', movie: MovieTitle});
      });
      app.put('/movies/:id', checkAdminRole, async function (req, res){
        const Id = req.params.id;
        const updatedMovieData = req.body;
        console.log(JSON.stringify(updatedMovieData))
        const movieId = new ObjectId(Id);
        const movieToUpdate = await collection.find(movieId).toArray();
        console.log(JSON.stringify(movieToUpdate))
       if (!movieToUpdate) {
          return res.status(404).json({ error: 'Movie not found' });
        }
        let MovieTitle = updatedMovieData.MovieTitle;
        let genre = updatedMovieData.genre;
        let Rating = updatedMovieData.Rating;
        let Streaminglink = updatedMovieData.Streaminglink;
        const filter ={ _id: new ObjectId(movieId) };
        const result = await collection.updateOne(filter, { $set: {"MovieTitle" :MovieTitle ,"genre" : genre,"Rating" : Rating,"Streaminglink":Streaminglink} });
        if (result && result.acknowledged !== undefined && result.acknowledged === true) {
            console.log(logPrefix + " Updated document successfully: " + JSON.stringify(result));
            res.json({ message: 'Movie updated successfully', movie: movieToUpdate});
        } else {
            console.log(logPrefix + " Not able to Update document");
            res.json({ message: 'Movie not updated successfully', movie: movieToUpdate});
        }
      });

      app.delete('/movies/:id', checkAdminRole, async function(req, res){
        const Id = req.params.id;
        const movieId = new ObjectId(Id);
        console.log(movieId);
        const movieToDelete = await collection.find(movieId).toArray(); 
        if (!movieToDelete) {
          return res.status(404).json({ error: 'Movie not found' });
        }
        const result = await collection.deleteOne({"_id":movieId})  
        if (result && result.acknowledged !== undefined && result.acknowledged === true) {
            console.log(logPrefix + " deleted document successfully: " + JSON.stringify(result));
            res.json({ message: 'Movie deleted successfully', movie: movieToDelete });
        } else {
            console.log(logPrefix + " Not able to delete document");
            res.json({ message: 'Movie not deleted', movie: movieToDelete });
        }   
      });
    console.log("Exiting" + logPrefix)
  } catch (error) {
    console.log(logPrefix + error);
    if (connection) {
        await dbconnect.doRelease(connection);
    }
  }
}
async function startService() {
    console.log("Entering startService()")
    try {
        await initService();
    }
    catch (err) {
        console.log("Not able to start Event Handler service: " + err);
    }
    console.log("Exiting startService()")
}
startService();
var server = app.listen(config.port, () => {
    console.log("Service is up and listening on port "+server.address().port);
    console.log("Service is up and listening on port "+JSON.stringify(server.address()));
}); 

// Shutdown on application exit
process.on('exit', async function () {
    console.log("'exit' event received at " + new Date().toTimeString() + ". Shutting down service.");
    shutdownService();
});

async function shutdownService() {
    await dbconnect.doRelease(connection);
    server.close();
}

module.exports = app;