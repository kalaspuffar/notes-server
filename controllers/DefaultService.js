'use strict';
//var low	= require('lowdb');
//const db = low('db.json');
var mysql = require('mysql');

function connectMysql() {
  var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'notes'
  });
  connection.connect();
  return connection;
}

function getNotes(res, connection, sql) {
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;

    var mappedResult = results.map(res => {
      return {
        id: ""+res.id,
        text: res.text
      };
    });
    res.end(JSON.stringify(mappedResult));
  });
  connection.end();
}

exports.getAllNotes = function(args, res, next) {
  /**
   * parameters expected in the args:
  **/
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;

  //  res.end(JSON.stringify(db.get('notes').value()));

  var connection = connectMysql();
  getNotes(res, connection, 'SELECT * FROM notes');
}

/*
function uuid() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
}
*/

exports.postNote = function(args, res, next) {
  /**
   * parameters expected in the args:
  * note (Note)
  **/
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 201;

/*
  var result = db.get('notes')
	  .push({ id: uuid(), text: args.note.value.text })
	  .value()
  res.end(JSON.stringify(result));
*/

  var connection = connectMysql();
  var sql = "INSERT INTO notes(text) values (?)";
  var inserts = [args.note.value.text];
  connection.query(mysql.format(sql, inserts));
  res.end();
}

exports.getNotesById = function(args, res, next) {
  /**
   * parameters expected in the args:
  * id (String)
  * note (Note)
  **/
  if(args.id.value === '') {
  	 res.statusCode = 500;
  	 res.end('ID Required');
  }
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  //res.end(JSON.stringify(db.get('notes').find({ id: args.id.value }).value()));

  var connection = connectMysql();
  var sql = "SELECT * FROM notes WHERE id = ?";
  var inserts = [args.id.value];
  getNotes(res, connection, mysql.format(sql, inserts));
}

exports.putNotesById = function(args, res, next) {
  /**
   * parameters expected in the args:
  * id (String)
  * note (Note)
  **/
  if(args.id.value === '') {
  	 res.statusCode = 500;
  	 res.end('ID Required');
  }
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 201;

  /*
  var result = db.get('notes')
  	.find({ id: args.id.value })
	  .assign({ text: args.note.value.text})
	  .value()
  res.end(JSON.stringify(result));
  */

  var connection = connectMysql();
  var sql = "UPDATE notes SET text = ? WHERE id = ?";
  var inserts = [args.note.value.text, args.id.value];
  connection.query(mysql.format(sql, inserts));
  getNotes(res, connection, 'SELECT * FROM notes');
}


exports.patchNotesById = function(args, res, next) {
  /**
   * parameters expected in the args:
  * id (String)
  * note (Note)
  **/
  if(args.id.value === '') {
  	 res.statusCode = 500;
  	 res.end('ID Required');
  }
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 201;

/*
  var result = db.get('notes')
  	.find({ id: args.id.value })
	  .assign({ text: args.note.value.text })
	  .value()
  res.end(JSON.stringify(result));
*/
  var connection = connectMysql();
  var sql = "UPDATE notes SET text = ? WHERE id = ?";
  var inserts = [args.note.value.text, args.id.value];
  connection.query(mysql.format(sql, inserts));
  getNotes(res, connection, 'SELECT * FROM notes');
}

exports.deleteNotesById = function(args, res, next) {
  /**
   * parameters expected in the args:
  * id (String)
  * note (Note)
  **/
  if(args.id.value === '') {
  	 res.statusCode = 500;
  	 res.end('ID Required');
  }
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 204;
/*
  db.get('notes')
	  .remove({ id: args.id.value })
	  .value()
*/

  var connection = connectMysql();
  var sql = "DELETE FROM notes WHERE id = ?";
  var inserts = [args.id.value];
  connection.query(mysql.format(sql, inserts));
  res.end();
}
