'use strict'
require('dotenv').config();

const PORT = process.env.PORT || 3001;

const express = require('express');
const superagent = require('superagent');

require('ejs');

const pg = require('pg');

const app = express();

app.use(express.urlencoded({
  extended: true
}));
app.use(express.static('public'));
app.set('view engine', 'ejs');



app.get('/', getBooks);

function getBooks(request, response) {
  // retrieve an array of book objects from the database and render index.ejs
  let sql = 'SELECT * FROM books';
  client.query(sql)
    .then(sqlResults => {
      let books = sqlResults.rows;
      // console.log(books);
      response.status(200).render('searches/index.ejs', {
        myBooks: books
      });
    })

  //   response.render(sql, 'searches/index.ejs');
}

app.get('/books/:book_id', getOneBook);

function getOneBook(request, response) {
  let myBookId = request.params.book_id;
  console.log(`This is ${myBookId}`);
  let sql = 'SELECT * FROM books WHERE id=$1';
  let safeValues = [myBookId];
  client.query(sql, safeValues)
    .then(sqlResults => {
      console.log(sqlResults.rows[0]);
      response.status(200).render('searches/detail.ejs', {oneBook: sqlResults.rows[0]});
    })
}

function addBook(request, response) {
  let {title, authors, description, thumbnail} = request.body;
  let sql = `INSERT INTO books (title, authors, description, thumbnail) VALUES ($1, $2, $3, $4) RETURNING ID;`;
  let safeValues = [title, authors, description, thumbnail];
  client.query(sql, safeValues)
    .then(results => {
      console.log(results.rows);
      response.redirect(`books/${id}`);
    })
}

app.get('/searches/new', (request, response) => {
  response.render('searches/new.ejs');
})

app.post('/searches/new', (request, response) => {
  let query = request.body.search[0];
  let titleOrAuthor = request.body.search[1];

  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (titleOrAuthor === 'title') {
    url += `+intitle:${query}`;
  } else if (titleOrAuthor === 'author') {
    url += `+inauthor:${query}`;
  }
  console.log(url);

  superagent.get(url)
    .then(result => {
      let bookArray = result.body.items;

      const finalBookArray = bookArray.map(book => {
        return new Book(book.volumeInfo);
      })
      response.render('show.ejs', {
        searchResults: finalBookArray
      })
    })
    .catch(error => {
      console.log(error);
    })
})

function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
  this.title = info.title ? info.title : 'no title available';
  this.authors = info.authors ? info.authors : 'no authors available';
  this.description = info.description ? info.description : 'no description available';
  this.cover = info.imageLinks.thumbnail ? info.imageLinks.thumbnail : placeholderImage;
}

const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.log(err));
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`listening on ${PORT}`);
    })
  })
