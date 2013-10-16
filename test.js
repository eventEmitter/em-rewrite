
	var fakeRequest = {
		  pathname: "/user/eventEmitter"
		, query: {}
		, method: "POST"
	}


	var log = require( "ee-log" );

	var RewrtieEngine = require( "./" );

	var engine = new RewrtieEngine( { path: "./test" } );



	engine.on( "load", function(){
		engine.request( fakeRequest, { send: function(){
			log( "external", arguments );
		} }, function(){
			log( "finished" );
		} );
	} );


	