/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var shortid = require('shortid');
var db = require('../db.js');
const CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      db.connect(CONNECTION_STRING, function() {
        db.get().collection('books').find().toArray(function(err, data) {
          res.json(data.map(b => ({
            _id: b._id,
            title: b.title,
            commentcount: b.comments ? b.comments.length : 0
          })));
        });
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title)
        return res.send("Please provide a title");
      db.connect(CONNECTION_STRING, function() {
        var book = {
          _id: shortid.generate(),
          title,
          comments: []
        };
        db.get().collection('books').insertOne(book, (err, data) => {
          res.json(data.ops[0]);
        });
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      db.connect(CONNECTION_STRING, function() {
        db.get().collection('books').remove({}, (err, data) => {
          if (err)
            return res.send("could not delete");
          else
            return res.send("complete delete successful");
        });
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      if (!bookid)
        return res.send("Please provide a book id");
      db.connect(CONNECTION_STRING, function() {
        db.get().collection('books').findOne(
          {_id: bookid},
          (err, book) => {
            if (err) {
              return res.send("could not find "+bookid);
            } else {
              return res.json(book);
            }
          }
        );
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      db.connect(CONNECTION_STRING, function() {
        db.get().collection('books').findOneAndUpdate(
          {_id: bookid},
          {$push: {comments: comment}},
          {returnOriginal: false},
          (err, data) => {
            if (err) {
              return res.send("could not insert comment");
            } else {
              return res.json(data.value);
            }
          }
        );
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      db.connect(CONNECTION_STRING, function() {
        db.get().collection('books').deleteOne(
          {_id: bookid},
          (err, data) => {
            if (err) {
              return res.send("could not delete book");
            } else {
              return res.send("delete successful");
            }
          }
        );
      });
    });
  
};
