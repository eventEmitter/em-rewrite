


	var   Rules = require( "../" ).Rules
		, log 	= require( "ee-log" )
		, Class = require( "ee-class" );



	module.exports = new Class( {
		inherits: Rules



		, init: function( options ){
			this.addRules();
		}



		, addRules: function(){

			// this.add( "/user/eventEmitter", "/yeah" );

			this.add( "/user/:id", "/otheruser/:id", 301 );

			// this.add( /user\/(.*)/gi, "/otheruser/$1" );

			// this.add( "/user/:id", { to: "/otheruser/:id", method: "PUT" } );

			this.add( { fn: function( request, response, nextRule, next ){
				log( "custom rule!" );
			}, method: "POST" } );
		}
	} );