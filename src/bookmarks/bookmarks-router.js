require('dotenv').config();
const express = require('express');
const logger = require('../logger');
const bookmarks = require('../store.json');
const uuid = require('uuid/v4');
const validUrl = require('valid-url');
const BookmarkServices = require('../bookmarks-services');
const xss = require('xss')
const { getBookmarkValidationError } = require('./bookmark-validator')
const bookmarksRouter = express.Router();
const jsonParser = express.json();
const bodyParser = express.json();

const serializeBookmark = mark => ({
    id: bookmarks.id,
    rating: bookmarks.rating,
    title: bookmarks.title,
    url: bookmarks.url
})


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
                url: bookmark.url,
                description: bookmark.description,
                rating: bookmark.rating
            })))
        })
    })
    .post(jsonParser, (req, res, next) => {
        const { description, rating, title, url } = req.body; 
        const newMark = { description, rating, title, url }
        Object.entries(newMark).forEach(([key, value]) => {
            if(!value) {
                logger.error(`${key} is required`);
                return res.status(400).send(`Invalid data`);
                }
            })
        if(!validUrl.isUri(url)){
            logger.error(`Not a valid url: ${url}`)
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
        BookmarkServices.insertArticle(
            req.app.get('db'),
            newMark
        )
            .then(mark => {
                res 
                    .status(201)
                    .location(`/bookmarks/${bookmarks.id}`)
                    .json(serializeBookmark(mark))
            })
            .catch(next)
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
                 rating: bookmark.rating,
                 url: bookmark.url
                  })
            console.log(bookmark)
          })
          .catch(next)
      })
    .delete(jsonParser, (req, res, next) => {
        const { id } = req.params;
        BookmarkServices.deleteArticle(
            req.app.get('db'),
            id
        )
        .then(numRowsAffected => {
            res.status(204).json({
                deleted: true,
                numRowsAffected
            })
        })
        .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const { title, url, description, rating } = req.body
        const bookmarkToUpdate = { title, url, description, rating }
    
        const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
          logger.error(`Invalid update without required fields`)
          return res.status(400).json({
            error: {
              message: `Request body must content either 'title', 'url', 'description' or 'rating'`
            }
          })
        }
    
        BookmarkServices.updateBookmark(
          req.app.get('db'),
          req.params.id,
          bookmarkToUpdate
        )
          .then(numRowsAffected => {
            res.status(204).json({
                updated: true,
            })
          })
          .catch(next)
      })


module.exports = bookmarksRouter;
