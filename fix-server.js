// app.get('/repair-posters', passport.authenticate('jwt', { session: false }), async (req, res) => {
//     try {
//         const movies = await Movies.find();
//         let updatedCount = 0;

//         for (let movie of movies) {
//             // Check if it's missing a real URL
//             if (!movie.imagePath || !movie.imagePath.startsWith('http')) {
//                 const encodedTitle = encodeURIComponent(movie.title);
//                 const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodedTitle}`);
//                 const data = await response.json();
//                 const posterPath = data.results?.[0]?.poster_path;

//                 if (posterPath) {
//                     const fullUrl = `https://image.tmdb.org/t/p/w500${posterPath}`;
//                     // This is the key: UPDATING the database permanently
//                     await Movies.findByIdAndUpdate(movie._id, { imagePath: fullUrl });
//                     updatedCount++;
//                 }
//             }
//         }
//         res.status(200).send(`Repair complete. Updated ${updatedCount} movies with TMDB URLs.`);
//     } catch (error) {
//         res.status(500).send("Repair failed: " + error.message);
//     }
// });

// app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => { 
//     try {
//         const movies = await Movies.find();
//         res.status(200).json(movies);
//     } catch (error) {
//         console.error("Error retrieving movies from Mongoose:", error);
//         res.status(500).send("Error retrieving movies: " + error);
//     }
// });



