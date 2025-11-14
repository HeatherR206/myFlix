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
  res.send('Looking for myFlix? Add "/movies" to the end of the URL to get there');
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

// CREATE (add a movie to a user's "Favorite Movies")
app.post('/users/:username/movies/:movieId', async (req, res) => {
    try {   
        const userName = req.params.username;
        const movieId = req.params.movieId;
        

        let updatedUser = await Users.findOneAndUpdate(
            { username: userName },
            { $push: { favorite_movies: movieID } },
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


// READ (Get a list of all movies)
app.get('/movies', async (req, res) => {
    try {
        let movies = await Movies.find();
        res.status(201).json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// READ (Get data about a single movie by title)
app.get('/movies/:title', async (req, res) => { 
    try {
        let movie = await Movies.findOne({ title: req.params.title });
        res.status(201).json(movie);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// READ (Get a list of movies by genre)
app.get('/movies/:genre_name', async (req, res) => { 
    try {
        let movies = await Movies.find({ genre_name: req.params.genre_name });
        res.status(201).json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// READ (Get data about a director by name)
app.get('/movies/:director_name', async (req, res) => { 
    try {
        let director = await Movies.findOne({ director_name: req.params.director_name });
        res.status(201).json(director);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error: ' + error);
    }
});

// UPDATE (Update a user's information)
/* Expect JSON in this format 
{
    username: String, (required, minlength = 6)
    email: String, (required)
    password: String, (minlength = 10)
    first_name: String,
    last_name: String,
    birth_date: Date ISODate("YYYY-MM-DD")
}*/
app.put('/users/:username', async (req, res) => {
    try {
        let oldUsername = req.params.username;
        
        const updates = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            birth_date: req.body.birth_date,
        };

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

// DELETE (Remove a movie from a user's "Favorite Movies")
app.delete('/users/:title', async (req, res) => {
    try {
        let  = await Users.findOneAndDelete( )
    }
})

// DELETE (Remove an existing user from database)

const port = 8080;

app.listen(8080, () => {
  console.log(`myFlix app is listening at http://localhost:${port}`);
});