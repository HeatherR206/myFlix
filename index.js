const express = require('express'),
    morgan = require('morgan'),
    app = express(),
    bodyParser = require('body-parser'),
    uuid = require('uuid'),
    port = 8080;

app.use(morgan('common'));      
app.use(bodyParser.json()); // allows return of data from `req.body` 
app.use(express.static('public'));

let users = [
    {
        id: 1,
        name: "Daphne",
        favoriteMovies: []
    },
    {
        id: 2,
        name: "Darwin",
        favoriteMovies: ["The Croods"]
    },
]

let movies = [
    {
        "Title": "Pride and Prejudice", 
        "Description": "Five sisters in an English family deal with issues of marriage, morality, and misconceptions when two wealthy bachelors arrive in their neighborhood.",
        "Genre": {
            "Name": "Romance",
            "Definition": "A film that focuses on characters' relationships, love, passion, and emotional commitments."
        },
        "Director": {
            "Name": "Joe Wright",
            "Bio": "Joseph \"Joe\" Wright is an English film director known for his visually rich and dynamic period dramas. His feature film debut was Pride & Prejudice (2005), which earned him a BAFTA for Most Promising Newcomer. He is also acclaimed for directing the romantic war drama Atonement (2007) and the Winston Churchill biopic Darkest Hour (2017), the latter for which Gary Oldman won an Academy Award.",
            "Birth": "August 25, 1972",
            "Death": "Not Deceased"
        },
        "ReleaseDate": "September 16, 2005 (UK)",
        // "ImageURL": "",
        "Featured": false  
    },
    {
        "Title": "Die Hard",
        "Description": "An NYPD detective visits his estranged wife's office Christmas party in Los Angeles when terrorists seize the skyscraper, forcing him to fight them alone.",
        "Genre": {
            "Name": "Action",
            "Definition": "A film featuring high-energy sequences, physical feats, fast-paced conflict, and thrilling stunts."
        },
        "Director": {
            "Name": "John McTiernan",
            "Bio": "John Campbell McTiernan Jr. is an American filmmaker best known for directing a string of highly successful and influential action films in the late 1980s and early 1990s. His notable works include Predator (1987), the iconic Christmas-set action film Die Hard (1988), and the spy thriller The Hunt for Red October (1990).",
            "Birth": "January 8, 1951",
            "Death": "Not Deceased"
        },
        "ReleaseDate": "July 15, 1988",
        // "ImageURL": "",
        "Featured": false
    },
    {
        "Title": "The Scent of Green Papaya",
        "Description": "In 1950s Saigon, a young servant girl, Mui, begins work for a wealthy but troubled Vietnamese family, finding beauty in her attentive daily routines.",
        "Genre": {
            "Name": "Drama",
            "Definition": "A film focused on narrative fiction with intense character development and realistic, emotional themes."
        },
        "Director": {
            "Name": "Trần Anh Hùng",
            "Bio": "Trần Anh Hùng is a Vietnamese-born French filmmaker celebrated for his poetic and visually stunning cinematic style. The Scent of Green Papaya was his feature film debut, which won the Caméra d'Or at the Cannes Film Festival and was nominated for an Academy Award for Best Foreign Language Film. His subsequent film Cyclo (1995) won the Golden Lion at the Venice Film Festival.",
            "Birth": "December 23, 1962",
            "Death": "Not Deceased"
        },
        "ReleaseDate": "December 8, 1993 (France)",
        // "ImageURL": "",
        "Featured": false  
    },
    {
        "Title": "A Room with a View",   
        "Description": "A young Englishwoman, Lucy, on a tour of Italy must choose between a charming, free-spirited man she meets there and a wealthy, priggish suitor back home.",
        "Genre": {
            "Name": "Romantic Comedy/Drama",
            "Definition": "A film that blends elements of romance and comedy, often with social commentary, focusing on relationships."
        },
        "Director": {
            "Name": "James Ivory",
            "Bio": "James Francis Ivory is an American film director, producer, and screenwriter known for his collaborations with producer Ismail Merchant and screenwriter Ruth Prawer Jhabvala in the acclaimed production company Merchant Ivory Productions. He is a key figure in independent cinema and directed numerous literary adaptations, including A Room with a View. At 89, he became the oldest Oscar winner ever for his screenplay for Call Me by Your Name (2017).",
            "Birth": "June 7, 1928",
            "Death": "Not Deceased" 
        },
        "ReleaseDate": "December 19, 1986 (US)",  
        // "ImageURL": "",
        "Featured": false  
    },
    {
        "Title": "The Sound of Music",   
        "Description": "A lively woman leaves an Austrian convent to become a governess to the seven children of a strict naval officer just before World War II.",
        "Genre": {
            "Name": "Musical",
            "Definition": "A film where songs sung by the characters are interwoven into the narrative, sometimes accompanied by dancing."
        },
        "Director": {
            "Name": "Robert Wise",
            "Bio": "Robert Earl Wise was an acclaimed American filmmaker, editor, and producer whose career spanned over six decades and encompassed nearly every genre. He won Academy Awards for Best Director and Best Picture for two landmark musicals: West Side Story (1961) and The Sound of Music (1965). He also famously edited Citizen Kane (1941) early in his career and directed sci-fi classic The Day the Earth Stood Still (1951).",
            "Birth": "September 10, 1914",
            "Death": "September 14, 2005"
        },
        "ReleaseDate": "March 2, 1965",      
        // "ImageURL": "",
        "Featured": false  
    },
    {
        "Title": "National Lampoon\'s Christmas Vacation",   
        "Description": "Clark Griswold tries to host a \"perfect family Christmas,\" but his plans unravel quickly due to unexpected relatives and a lack of a promised bonus.",
        "Genre": {
            "Name": "Comedy",
            "Definition": "A film that uses humor, often in exaggerated or absurd ways, to entertain the audience."
        },
        "Director": {
            "Name": "Jeremiah S. Chechik",
            "Bio": "Jeremiah S. Chechik is a Canadian film and television director. He began his career directing commercials before making his feature film debut with the beloved holiday comedy National Lampoon's Christmas Vacation (1989). He has also directed films such as Benny & Joon (1993) and the feature film adaptation of The Avengers (1998).",
            "Birth": "January 1, 1951",
            "Death": "Not Deceased"
        },
        "ReleaseDate": "December 1, 1989",       
        // "ImageURL": "",
        "Featured": false  
    },
    {
        "Title": "Grease",   
        "Description": "Summer romance turns complicated for a good girl, Sandy, and a greaser, Danny, when they unexpectedly discover they attend the same high school.",
        "Genre": {
            "Name": "Musical",
            "Definition": "A film where songs sung by the characters are interwoven into the narrative, sometimes accompanied by dancing."
        },
        "Director": {
            "Name": "Randal Kleiser",
            "Bio": "John Randal Kleiser is an American film and television director best known for directing the cinematic adaptation of the Broadway musical Grease (1978), which became a cultural phenomenon and one of the highest-grossing musical films of all time. His other notable films include The Blue Lagoon (1980) and the family sci-fi adventure Flight of the Navigator (1986)",
            "Birth": "July 20, 1946",
            "Death": "Not Deceased"
        },
        "ReleaseDate": "June 16, 1978",       
        // "ImageURL": "",
        "Featured": false  
    },
    {
        "Title": "The Croods",   
        "Description": "A prehistoric family's overprotective patriarch must reluctantly lead his family to safety after a cataclysm, meeting a nomadic boy with new ideas along the way.",
        "Genre": {
            "Name": "Animated Adventure Comedy",
            "Definition": "A film using animation, focusing on a journey and often featuring humorous elements."
        },
        "Director": [
            {
                "Name": "Chris Sanders",
                "Bio": "An American filmmaker, animator, and voice actor. He is a veteran of animated features, co-writing and co-directing Disney's Lilo & Stitch (2002) and DreamWorks' How to Train Your Dragon (2010) before co-directing The Croods.",
                "Birth": "March 12, 1962",
                "Death": "Not Deceased"
            },
            {
                "Name": "Kirk DeMicco",
                "Bio": "An American screenwriter, director, and producer. He co-wrote and co-directed The Croods (2013) and later wrote and directed the animated musical Vivo (2021).",
                "Birth": "February 12, 1969",
                "Death": "Not Deceased"
            }
        ],
        "ReleaseDate": "March 22, 2013",
        // "ImageURL": "",
        "Featured": false  
    },
    {
        "Title": "Finding Nemo",   
        "Description": "An overprotective clownfish named Marlin embarks on a perilous journey across the ocean to find his adventurous young son, Nemo, who has been captured by a diver.",
        "Genre": {
            "Name": "Animated Adventure Comedy",
            "Definition": "A film using animation, focusing on a journey and often featuring humorous elements."
        },
        "Director": [
            {
                "Name": "Andrew Stanton",
                "Bio": "An American film director, screenwriter, and producer at Pixar. He directed Finding Nemo (2003) and WALL-E (2008), winning the Academy Award for Best Animated Feature for both. He also directed the live-action film John Carter (2012).",
                "Birth": "December 3, 1965",
                "Death": "Not Deceased"
            },
            {
                "Name": "Lee Unkrich",
                "Bio": "An American film director and editor who spent a long career at Pixar. He co-directed Finding Nemo (2003) and Monsters, Inc. (2001), and served as the solo director on Toy Story 3 (2010) and Coco (2017), both Oscar winners.",
                "Birth": "August 8, 1967",
                "Death": "Not Deceased"
            }
        ],
        "ReleaseDate": "May 30, 2003",
        // "ImageURL": "",
        "Featured": false  
    },
    {
        "Title": "Stand by Me",   
        "Description": "Four young friends in a small Oregon town go on an unforgettable, two-day search for the body of a missing boy, leading to a journey of self-discovery.",
        "Genre": {
            "Name": "Adventure/Coming-of-Age",
            "Definition": "A film that focuses on an exciting journey, and the psychological and moral growth of a protagonist from youth to adulthood."
        },
        "Director": {
            "Name": "Rob Reiner",
            "Bio": "Robert \"Rob\" Reiner is an American actor, comedian, director, and producer. Before becoming a respected director, he was famous for playing \"Meathead\" on the TV sitcom All in the Family. As a director, he has helmed a string of critically acclaimed and beloved films across genres, including This Is Spinal Tap (1984), Stand By Me (1986), The Princess Bride (1987), and When Harry Met Sally... (1989).",
            "Birth": "March 6, 1947",
            "Death": "Not Deceased"
        },
        "ReleaseDate": "August 8, 1986",    
        // "ImageURL": "",
        "Featured": false  
    },
];

app.get('/', (req, res) => {
  res.send('Looking for myFlix? Add "/movies" to the end of the URL to get there');
});

// CREATE (add new user)
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('Users need a name to register')
    }
})

// UPDATE (update user info)
app.put('/users/:id', (req, res) => {
    const { id } = req.params;    
    const updatedUser = req.body;

    let user = users.find( user => user.id == id );

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('No such user in database')
    }
})

// CREATE (add a movie to 'Favorite Movies' list)
app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;    

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array.`);
    } else {
        res.status(400).send('User ID and/or movie title not found in database')
    }
})

// DELETE (remove a movie from "Favorite Movies" list)
app.delete('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;    

    let user = users.find( user => user.id == id );

    if (user) {
        user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array.`);
    } else {
        res.status(400).send('No such movie in database')
    }
})

// DELETE (deregister an existing user)
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;    

    let user = users.find( user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id );
        res.status(200).send(`User ${id} has been deleted from database`);
    } else {
        res.status(400).send('User was not deleted from database')
    }
})

// READ (get a list of all movies)
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

//READ (get data about a single movie by title)
app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find( movie => movie.Title === title );
  
    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(400).send('No such movie in database');
    }
});

// //READ (get data about a genre)
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find( movie => movie.Genre.Name === genreName ).Genre;
  
    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('No such genre in database');
    }
});

// //READ (get data about a director by name)
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find( movie => movie.Director.Name === directorName ).Director;
  
    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('No such director in database');
    }
});

app.use((req, res) => {
    res.status(404).send('Sorry, that endpoint doesn\'t exist.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Uh-oh! Something broke!');
});

app.listen(port, () => {
  console.log(`The myFlix app is listening at http://localhost:${port}`);
});