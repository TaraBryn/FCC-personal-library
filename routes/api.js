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
var ObjectId = require('mongodb').ObjectId;

module.exports = function (app, db) {

  app.route('/api/books')
  .get(function (req, res){
    //response will be array of book objects
    //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    db.collection('books').find().toArray()
    .then(data => {
      console.log(data);
      res.json(data.map(e => {
        return {
          _id: e._id,
          title: e.title,
          commentcount: e.comments.length
        }
      }))
    })
  })

  .post(function (req, res){
    var title = req.body.title;
    //response will contain new book object including atleast _id and title
    db.collection('books').insertOne({title, comments: []},(err, data) => {
      if (err) return res.json(err);
      res.json(data.ops[0]);
    });
  })

  .delete(function(req, res){
    //if successful response will be 'complete delete successful'
    db.collection('books').remove({},{}, e => res.json(e || 'complete delete successful'))
  });



  app.route('/api/books/:id')
  .get(function (req, res){
    var bookid = req.params.id;
    //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    db.collection('books').find({_id: ObjectId(req.params.id)})
    .toArray().then(data=>res.json(data));
  })

  .post(function(req, res){
    var bookid = req.params.id;
    var comment = req.body.comment;
    //json res format same as .get
    db.collection('books').findAndModify(
      {_id: ObjectId(bookid)}, {},
      {'$push': {comments: comment}}, {new: true},
      (err, doc) => res.json(err || doc.value)
    )
  })

  .delete(function(req, res){
    var bookid = ObjectId(req.params.id);
    //if successful response will be 'delete successful'
    db.collection('books').remove({_id: bookid},{}, e => res.json(e || 'complete delete successful'))
  });
  
};
