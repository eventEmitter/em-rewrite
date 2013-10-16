# em-rewrite

rewriter middleware for ee-websevrive

## installation
	
	npm install em-middleware

## usage

create a directory containing the rewrite direcive classes for you project inside your project dir. add n files containing rewrite functionality to that directory. the library will load and insantitate that rewrite classes.

sample rewrite class:

	var   Class	= require( "ee-class" )
		, log 	= require( "ee-log" )
		, Rules = require( "../" ).Rules;



	module.exports = new Class( {
		inherits: Rules  // <-- you have to extend the Rules class


		// ee-class contructor function
		, init: function( options ){
			this.addRules();
		}



		, addRules: function(){

			// from «/user/eventEmitter» to «/yeah»
			this.add( "/user/eventEmitter", "/yeah" ); 

			// same as abvove but do an external 302 redirect ( you may also use a 301 redirect )
			this.add( "/user/eventEmitter", "/yeah", 302 ); 

			// from «/user/anyUserID» to «/otheruser/anyUserID»
			this.add( "/user/:id", "/otheruser/:id" );

			// same as above, but change the request method to «put»
			this.add( "/user/:id", { to: "/otheruser/:id", method: "PUT" } );

			// from «/user/anyUserID» to «/otheruser/anyUserID»
			this.add( /user\/(.*)/gi, "/otheruser/$1" );

			// same as above but only if the method is «delete»
			this.add( { reg: /user\/(.*)/gi, method: "delete" }, "/otheruser/$1" );

			// run a function which may do whatever it wants
			this.add( function( request, response, nextRule, next ){
				log( "custom rule!" );
			} );

			// same as above but only if the request method is «post»
			this.add( { fn: function( request, response, nextRule, next ){
				log( "custom rule!" );
			}, method: "POST" } );
		}
	} );



sample aplication making use of the rewriter middleware
	
	var WebService = require( "ee-webservice" )
		, Rewriter = require( "em-rewrite" s);

	// load webservice
	var service = new WebService( {
		  port: 		12001
		, interface:	Webservice.Webserver.IF_ANY
	} );

	// load rewriter
	var rewriter = new Rewriter( "./myRulesClassDir" );
	
	// add middleware to webservice
	service.use( rewriter );

	// start listening as soon the middleware is loaded
	rewriter.on( "load", function(){
		service.listen();
	} );