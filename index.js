let topMovies = [
  {
    title: 'Pride and Prejudice',   
  },
  {
    title: 'Die Hard',
  },
  {
    title: 'The Scent of Green Papaya',
  },
  {
    title: 'A Room with a View',   
  },
  {
    title: 'The Sound of Music',   
  },
  {
    title: 'National Lampoon\'s Christmas Vacation',   
  },
  {
    title: 'Grease',   
  },
  {
    title: 'The Croods',   
  },
  {
    title: 'Finding Nemo',   
  },
  {
    title: 'Stand by Me',   
  }
  
];

topMovies.forEach((movie, index) => {
    movie.title = `${index + 1}. ${movie.title}`;
});
console.log(topMovies);

const express = require('express');
    morgan = require('morgan');

const app = express();
const port = 8080; 

app.use(morgan('common'));
app.use(express.static('public'));

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.get('/', (req, res) => {
  res.send('Morgan test successful!');
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