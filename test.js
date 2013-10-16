
	
	var   log 				= require( "ee-log" )
		, RewrtieEngine 	= require( "./" )
		, engine 			= new RewrtieEngine( { path: "./test" } );


	var fakeRequest = {
		  pathname: "/user/eventEmitter"
		, query: {}
		, method: "post"
	}

	var fakeResponse = {
		send: function(){
			log( "external", arguments );
		} 
	};


	engine.on( "load", function(){
		engine.request( fakeRequest, fakeResponse, function(){
			log( "finished", fakeRequest );
		} );
	} );


	