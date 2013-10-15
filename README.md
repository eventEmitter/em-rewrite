




	

	
	var Rewriter = require( "em-rewrit" );

	var rewriteRules = new Rewriter( "./rewrite", { hui: {} } );


	webservice.use( rewriteRules );



	var Rules = new Class( {
		add: function(){
			
		}
	} );



	var Rules = require( "em-rewrite" ).Rules


	module.exports = new Class( {
		inherits: Rules


		init: function( options ){

		}


		, addRules: function(){

			this.add( "/-/user/org.couchdb.user\\::ee", "/user/:id" );


			this.add( "/-/user/org.couchdb.user\::ee", { route: "/user/:id", method: "POST" } );


			this.add( "/-/user/org.couchdb.user\::ee", function( request, response, next ){
				request.rewrite( { url, "/user/id", method: "post", headers: {}, data: "" } );
			} );


			this.add( function( request, response, next ){}, 404 );
		}
	} );



