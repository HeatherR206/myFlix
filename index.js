const express = require('express'),
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
  

app.get('/', async (req, res) => {
  res.send('Welcome to myFlix, a database for movie enthusiasts!');
});

// CREATE (add new user)
/* Expect JSON in this format 
{
    username: String,
    email: String,
    password: String,
    first_name: String,
    last_name: String,
    birth_date: Date,
    favorite_movies: [mongoose.Schema.Types.ObjectId]
}*/
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

// CREATE (add movie a user's "Favorite Movies")
app.post('/users/:username/movies/:movieId', async (req, res) => {
    try {   
        const userName = req.params.username;
        const movieId = req.params.movieId;
        
        let updatedUser = await Users.findOneAndUpdate(
            { username: userName },
            { $push: { favorite_movies: movieId } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send(`Error: User "${userName}" not found in database.`);
        } 

        res.status(201).json(updatedUser);
    
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// READ (Get all users)
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

// READ (Get user by username)
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

// READ (Get all movies)
app.get('/movies', async (req, res) => {
    try {
        let movies = await Movies.find();
        res.status(200).json(movies);
    
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// READ (Get a movie by title)
app.get('/movies/:title', async (req, res) => { 
    try {
        let movie = await Movies.findOne({ title: req.params.title });
        res.status(200).json(movie);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// READ (Get a list of movies by genre)
app.get('/genres/:genreName', async (req, res) => { 
    try {
        const genreFilter = req.params.genreName;
        
        let movies = await Movies.find({ 'genres.genre_name': genreFilter });
        
        if (!movies || movies.length === 0) {
            return res.status(404).send(`Error: no movies found in the database assigned with the genre: ${genreFilter}`);
        }

        res.status(200).json(movies);    
    
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error.message);
    }
});

// READ (Get data about a director by name)
app.get('/directors/:directorName', async (req, res) => { 
    try {
        const directorName = req.params.directorName;

        let movie = await Movies.findOne({ 'directors.director_name': directorName });
               
        if (!movie) {
            return res.status(404).send(`Error: no data in the database for this director: ${directorName}`);
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

// UPDATE (Update a user by username)
app.put('/users/:username', async (req, res) => {
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

// DELETE (Remove movie from "Favorite Movies")
app.delete('/users/:username/movies/:movieId', async (req, res) => {
    try {
        const userName = req.params.username;
        const movieId = req.params.movieId;
        
        let updatedUser = await Users.findOneAndUpdate(
            { username: userName },
            { $pull: { favorite_movies: movieId } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send(`Error: User "${userName}" not found in database.`);
        }   

        res.status(200).send(`Movie ID ${movieId} was removed from ${userName}'s favorite movies.`);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// DELETE (Remove a user by username)
app.delete('/users/:username', async (req, res) => {
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

const port = 8080;

app.listen(8080, () => {
  console.log(`myFlix app is listening at http://localhost:${port}`);
});