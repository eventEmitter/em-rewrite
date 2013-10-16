


	var   Rules = require( "../" ).Rules
		, Class = require( "ee-class" );



	module.exports = new Class( {
		inherits: Rules



		, init: function( options ){
			this.addRules();
		}



		, addRules: function(){

			this.add( "/user/:id", "/otheruser/:id" );

/*
			this.add( "/-/user/org.couchdb.user\::ee", { route: "/user/:id", method: "POST" } );


			this.add( [ "/eb", "/" ], { route: "/user/:id", method: "POST" } );


			this.add( "/-/user/org.couchdb.user\::ee", function( request, response, next ){
				request.rewrite( { url: "/user/id", method: "post", headers: {}, data: "" } );
			} );


			this.add( function( request, response, next ){} );

			this.add( { from: "fff:g:gd/", method: "post" } );*/
		}
	} );