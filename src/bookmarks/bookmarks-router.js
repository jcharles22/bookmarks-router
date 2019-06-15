require('dotenv').config();
const express = require('express');
const logger = require('../logger');
const bookmarks = require('../store.json');
const uuid = require('uuid/v4');
const validUrl = require('valid-url');
const BookmarkServices = require('../bookmarks-services');

const bookmarksRouter = express.Router();
const bodyParser = express.json();


bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        const knexInstance = req.app.get('db')
        BookmarkServices.getAllBookmarks(knexInstance)
        .then(bookmarks => {
            console.log(bookmarks)
            res.json(bookmarks.map(bookmark => ({
                id: bookmark.id,
                title: bookmark.title,
                description: bookmark.description,
                rating: bookmark.rating
            })))
        })
    })
    .post(bodyParser, (req, res) => {
        const { description, rating, title, url } = req.body; 
        if(!description) {
            logger.error(`description is required`);
            return res.status(400).send(`Invalid data`);
        };
        if(!title) {
            logger.error(`title is required`);
            return res.status(400).send(`Invalid data`);
        };
        if(!url) {
            logger.error(`url is required`);
            return res.status(400).send(`Invalid data`);
        }
        if(!validUrl.isUri(url)){
            logger.error(`Not a valid url: ${url}`)
            return res.status(400).send(`Invalid data`);
        }
        if(!rating) {
            logger.error(`rating is required`);
            return res.status(400).send(`Invalid data`);
        }
        if(!Number(rating)){
            logger.error(`rating is not a number`)
            return res.status(400).send(`Rating has to be between 0 and 5`);
        }
        if(rating<0 || rating>5) {
            logger.error(`rating is out of bounds`);
            return res.status(400).send(`Rating has to be between 0 and 5`);
        }
        
        const id = uuid();
        const newBookmark = {
            description,
            id,
            rating: Number(rating),
            title,
            url
        }
        bookmarks.push(newBookmark);
        res.status(201).json(newBookmark);
    })

bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        const { id } = req.params
        BookmarkServices.getById(knexInstance, id)
          .then(bookmark => {
              if(!bookmark) {
                  res.status(404).json({
                      error: {message: `bookmark doesn't exist`}
                  })
              }
               res.json({
                 id: bookmark.id,
                 title: bookmark.title,
                 description: bookmark.description,
                 rating: bookmark.rating
                  })
            console.log(bookmark)
          })
          .catch(next)
      })

    
    .delete((req, res) => {
        const { id } = req.params;
        const bookMarkId = bookmarks.findIndex(bookmarks => bookmarks.id == id);
        if(bookMarkId === -1) {
            logger.error(`Card with id ${id} not found.`);
            res.status(404).send('Not Found.');
        }
        const index = bookmarks.findIndex(obj => obj.id === id);
        bookmarks.splice(index, 1)
        res.status(204).end()
    })

module.exports = bookmarksRouter;
