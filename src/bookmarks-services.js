const BookmarkService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarks');
    },
    insertArticle(knex, newArticle) {
        return knex
        .insert(newArticle)
        .into('bookmarks')
        .returning('*')
        .then(rows => { 
            return rows[0]
        })
    },
    getById(knex, id) {
           return knex.select('*').from('bookmarks').where('id', id).first()
    },
    deleteArticle(knex, id) {
        return knex('bookmarks')
            .where({ id })
            .delete()
    },
    updateBookmark(knex, id, newBookmarkFields) {
        return knex('bookmarks')
            .where({ id })
            .update(newBookmarkFields)
    },
    
}

module.exports = BookmarkService;