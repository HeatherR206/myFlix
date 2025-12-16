require('dotenv').config()

const TMDB_API_KEY = process.env.TMDB_API_KEY;

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const path = require('path'),
    express = require('express'),

    morgan = require('morgan'),  
    mongoose = require('mongoose'),
    models = require('./models.js');

const { check, validationResult } = require('express-validator');
const app = express();    

const Movies = models.Movie;
const Users = models.User;

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to MongoDB.");
  })
  .catch((error) => {
    console.error("MongoDB connection error: ", error);
  });

app.use(morgan("common"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require("cors");
app.use(cors());

let auth = require("./auth")(app);

const passport = require("passport");
require("./passport");

app.get("/", async (req, res) => {
  res.send("Welcome to myFlix, a database for movie enthusiasts!");
});

// CREATE (Register new User)
app.post(
  "/users",
  [
    check("username")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Username must be at least 6 characters long.")
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage(
        "Username can only contain letters, numbers, hyphens, and underscores."
      ),
    check("password")
      .notEmpty()
      .withMessage("Password is required.")
      .isLength({ min: 10 })
      .withMessage("Password must be at least 10 characters long."),
    check("email")
      .trim()
      .isEmail()
      .withMessage("Email does not appear to be valid."),
    check("first_name", "First name is required.").optional().notEmpty().trim(),
    check("last_name", "Last name is required.").optional().notEmpty().trim(),
    check("birth_date", "Birth date must be a valid date (YYYY-MM-DD) format")
      .optional()
      .isDate(),
  ],
  async (req, res) => {
    try {
      let errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      let hashedPassword = Users.hashPassword(req.body.password);

      let user = await Users.findOne({ username: req.body.username });

      if (user) {
        return res.status(409).json({
          message: req.body.username + " already exists",
          field: "username",
        });
      }
      let newUser = await Users.create({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        birth_date: req.body.birth_date,
        favorite_movies: req.body.favorite_movies,
      });

      res.status(201).json(newUser);
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Server Error on POST /users:`,
        error
      );
      res.status(500).send("Internal Server Error. Please try again later.");
    }
  }
);

// CREATE (Add movie to user's "Favorite Movies")
app.post(
  "/users/:username/movies/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
        return res
          .status(404)
          .send(`Error: User ${userName} not found in database.`);
      }

      res.status(201).json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error adding movie: " + error);
    }
  }
);

// READ (Get all Users)
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let users = await Users.find();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error.message);
    }
  }
);

// READ (Get User by username)
app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      let user = await Users.findOne({ username: req.params.username });

      if (!user) {
        return res
          .status(404)
          .send(req.params.username + " was not found in database.");
      }

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

// READ (Get all Movies)
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {    
    if (!TMDB_API_KEY) {
        return res.status(500).send("TMDB_API_KEY is not configured on the server.");
    }

    try {
        let movies = await Movies.find();

        const moviesWithPostersPromises = movies.map(async (movie) => {
            const movieTitle = movie.title;
            const encodedTitle = encodeURIComponent(movieTitle);
            const tmdbSearchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodedTitle}`;

            let tmdbPosterUrl = null;

            try {
                const tmdbResponse = await fetch(tmdbSearchUrl);
                const tmdbData = await tmdbResponse.json();

                if (tmdbData.results && tmdbData.results.length > 0) {
                    const posterPath = tmdbData.results[0].poster_path;
                    if (posterPath) {
                        tmdbPosterUrl = `${TMDB_IMAGE_BASE_URL}${posterPath}`;
                    }
                }
            } catch (tmdbError) {
                console.warn(`Could not fetch poster for ${movieTitle}:`, tmdbError.message);
            }

            const movieObject = movie.toObject();
            movieObject.image_path = tmdbPosterUrl || movieObject.image_path;
            return movieObject;
        });

        const moviesWithPosters = await Promise.all(moviesWithPostersPromises);

        res.status(200).json(moviesWithPosters);

    } catch (error) {
        console.error("Error retrieving movies from Mongoose:", error);
        res.status(500).send("Error retrieving movies: " + error);
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

// READ (Get Director by name)
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

// UPDATE (Update User profile by username)
app.put('/users/:username', 
    passport.authenticate('jwt', { session: false }),
    [
        check('username').optional({ checkFalsy: true }).trim()
            .isLength({min: 6}).withMessage('Username must be at least 6 characters long.')
            .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, hyphens, and underscores.'),
        check('password').optional({ checkFalsy: true })
            .isLength({min: 10}).withMessage('Password must be at least 10 characters long.'),
        check('email').optional({ checkFalsy: true }).trim()
            .isEmail().withMessage('Email does not appear to be valid.'),
        check('first_name').optional().notEmpty().withMessage('First name cannot be empty.' ).trim(),
        check('last_name').optional().notEmpty().withMessage('Last name cannot be empty.').trim(),
        check('birth_date', 'Birth date must be a valid date (YYYY-MM-DD) format').optional().isDate()
    ],
    async (req, res) => {
        try {
            if(req.user.username !== req.params.username){
                return res.status(401).send('Permission denied: You can only modify your own account.');
            }

            let errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }    
              
            let oldUsername = req.params.username;
            const body = req.body;
            const updates = {};
            const updateableFields = [ 'username', 'email', 'password', 'first_name', 'last_name', 'birth_date' ];
            
            for (const field of updateableFields) {
                if (Object.prototype.hasOwnProperty.call(body, field) && body[field] !== null) {
                    if (field === 'password') {
                        if (body[field].trim()) {
                            updates[field] = Users.hashPassword(body[field]);
                        }
                    } else {
                    updates[field] = body[field];    
                    }
                }
            }
            
            if (Object.keys(updates).length === 0) {
                return res.status(400).send('Error: No valid fields provided to update.');
            }

            if (updates.username && updates.username !== oldUsername) {
                let existingUser = await Users.findOneAndUpdate({ username: updates.username });
                if (existingUser) {
                    return res.status(409).json({
                        message: updates.username + 'already exists',
                        field: 'username'
                    });
                }
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
            console.error(`[${new Date().toISOString()}] Error in PUT /users:`, error);
            res.status(500).send('Internal Server Error. Please try again later.');
        }
    }
);

// DELETE (Remove Movie from User's "Favorite Movies")
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

const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0',() => {
  console.log('Listening on Port' + port);

});