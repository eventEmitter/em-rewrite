


	var   Rules = require( "../" ).Rules
		, Class = require( "ee-class" );



	module.exports = new Class( {
		inherits: Rules

		

		, init: function( options ){

		}
		


		, addRules: function(){

			this.add( "/-/user/org.couchdb.user\\::ee", "/user/:id" );


			this.add( "/-/user/org.couchdb.user\::ee", { route: "/user/:id", method: "POST" } );


			this.add( "/-/user/org.couchdb.user\::ee", function( request, response, next ){
				request.rewrite( { url: "/user/id", method: "post", headers: {}, data: "" } );
			} );


			this.add( function( request, response, next ){}, 404 );
		}
	} );