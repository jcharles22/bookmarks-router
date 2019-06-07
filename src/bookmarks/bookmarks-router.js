const express = require('express');
const logger = require('../logger');
const bookmarks = require('../store.json');

const bookmarksRouter = express.Router();
const bodyParser = express.json();
let counter = 3;

bookmarksRouter
    .route('/bookmarks')
    .get((req, res) => {
        res.status(200).json(bookmarks)
    })
    .post(bodyParser, (req, res) => {
        const { description, rating=5, title, url } = req.body; 
        if(!description) {
            logger.error(`description is required`)
            return res.status(400).send(`Invalid data`);
        };
        if(!title) {
            logger.error(`title is required`)
            return res.status(400).send(`Invalid data`);
        };
        if(!url) {
            logger.error(`url is required`)
            return res.status(400).send(`Invalid data`);
        }
        counter++;
        const id = counter;
        const newBookmark = {
            description,
            id,
            rating,
            title,
            url
        }
        bookmarks.push(newBookmark);
        res.send(`added new Bookmark at http://localhost:8000/bookmarks/${id}`);
    })

bookmarksRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(bookmark => bookmark.id == id);
        if(!bookmark) {
            logger.error(`Bookmark with id ${id} was not found.`)
            res.status(404).send('Bookmark not found');
        }
        res.status(200).send(bookmark);

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
        res.send(bookmarks)
    })

module.exports = bookmarksRouter;