const path = require('path'),
    express = require('express'),
    morgan = require('morgan'),
    mongoose = require('mongoose'),
    models = require('./models.js');

const app = express();    

const Movies = models.Movie;
const Users = models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Successfully connected to MongoDB.');    
    })
    .catch((error) => {
        console.error('MongoDB connection error: ', error);
    });

app.use(morgan('common'));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
  
let auth = require('./auth')(app);

const passport = require('passport');
require('./passport');

app.get('/', async (req, res) => {
  res.send('Welcome to myFlix, a database for movie enthusiasts!');
});

// CREATE (add new User)
app.post('/users', async (req, res) => {
    try {
        let user = await Users.findOne({ username: req.body.username });

        if (user) {
            return res.status(400).send(req.body.username + 'already exists');
        }
        let newUser = await Users.create({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            birth_date: req.body.birth_date,
            favorite_movies: req.body.favorite_movies
        });
         
        res.status(201).json(newUser);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// CREATE (add movie a User's "Favorite Movies")
app.post('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {   
        const userName = req.params.username;
        let movieId = req.params.movieId;
        
        movieId = new mongoose.Types.ObjectId(movieId);
        
        let updatedUser = await Users.findOneAndUpdate(
            { username: userName },
            { $push: { favorite_movies: movieId } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send(`Error: User ${userName} not found in database.`);
        } 

        res.status(201).json(updatedUser);
    
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding movie: ' + error);
    }
});

// READ (Get all Users)
app.get('/users', async (req, res) => {
    try {
        let users = await Users.find();
        res.status(200).json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// READ (Get User by username)
app.get('/users/:username', async (req, res) => { 
    try {
        let user = await Users.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).send(req.params.username + ' was not found in database.');
        }
        
        res.status(200).json(user);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// READ (Get all Movies)
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let movies = await Movies.find();
        res.status(200).json(movies);
    
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving movies: ' + error);
    }
});

// READ (Get a Movie by title)
app.get('/movies/:title', passport.authenticate('jwt', { session: false }), async (req, res) => { 
    try {
        let movie = await Movies.findOne({ title: req.params.title });
        res.status(200).json(movie);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving Movie: ' + error);
    }
});

// READ (Get Genre by name)
app.get('/genres/:genreName', passport.authenticate('jwt', { session: false }), async (req, res) => { 
    try {
        const genreName = req.params.genreName;
        
        let movie = await Movies.findOne({ 'genres.genre_name': genreName });
        
        if (!movie) {
            return res.status(404).send(`Error: no data found in the database for this Genre: ${genreName}`);
        }

        const genreDetails = movie.genres.find(
            g => g.genre_name === genreName
        );

        if (!genreDetails) {
            return res.status(404).send('Error: Genre data could not be extracted from the database.')
        }

        res.status(200).json(genreDetails);    
    
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// READ (Get a Director by name)
app.get('/directors/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => { 
    try {
        const directorName = req.params.directorName;

        let movie = await Movies.findOne({ 'directors.director_name': directorName });
               
        if (!movie) {
            return res.status(404).send(`Error: no data in the database for this Director: ${directorName}`);
        }
        
        const directorDetails = movie.directors.find(
            d => d.director_name === directorName
        );

        if (!directorDetails) {
            return res.status(404).send(`Error: Director data could not be extracted from the database.`);
        }

        res.status(200).json(directorDetails);    
    
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// UPDATE (Update a User account by username)
app.put('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let oldUsername = req.params.username;
        const body = req.body;
        const updates = {};
        const updateableFields = [ 'username', 'email', 'password', 'first_name', 'last_name', 'birth_date' ];
        
        for (const field of updateableFields) {
            if (Object.prototype.hasOwnProperty.call(body, field) && body[field] !== null) {
                updates[field] = body[field];    
            }
        }
        
        if (Object.keys(updates).length === 0) {
            return res.status(400).send('Error: No valid fields provided to update.');
        }

        let updatedUser = await Users.findOneAndUpdate(
            { username: oldUsername },
            { $set: updates },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send('Error: User not found in database');
        }

        res.status(200).json(updatedUser);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// DELETE (Remove Movie from "Favorite Movies")
app.delete('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const userName = req.params.username;
        const movieId = req.params.movieId;
        
        let updatedUser = await Users.findOneAndUpdate(
            { username: userName },
            { $pull: { favorite_movies: movieId } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send(`Error: User ${userName} not found in database.`);
        }   

        res.status(200).send(`Movie ID "${movieId}" was removed from ${userName}'s "Favorite Movies" array.`);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// DELETE (Remove a User by username)
app.delete('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        let user = await Users.findOneAndDelete({ username: req.params.username });        
        
        if (!user) {
            return res.status(404).send(req.params.username + ' was not found in database.');
        }

        res.status(200).send(req.params.username + ' was deleted from database.');

    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const port = 8080;

app.listen(8080, () => {
  console.log(`myFlix app is listening at http://localhost:${port}`);
});