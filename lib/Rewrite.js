


	var   Class 		= require( "ee-class" )
		, log 			= require( "ee-log" )
		, type 			= require( "ee-types" )
		, fs 			= require( "fs" )
		, path 			= require( "path" )
		, Rules 		= require( "./Rules" )
		, project 		= require( "ee-project" );



	module.exports = new Class( {


		  _rules: []

 		

 		, init: function( options ){
 			this.path = options && options.path && options.path[ 0 ] !== "/" ? path.join( project.root, options.path ) : ( options.path || "" );
 			this.options = options;

 			this._load();
		}




		, _load: function( callback ){
			fs.readdir( this.path, function( err, list ){
				if( err ) throw new Error( "The folder containing the rewrite rules «"+this.path+"» could not be loaded: " + err.message ).setName( "DirectoryNotFoundException" );
				else {
					list.forEach( function( filename ){
						var path = this.path + "/" + filename, mod;

						try {
							mod = require( path );

							try{
								mod = new mod( this.options );
							} catch ( e ){
								throw new Error( "Failed to instantiate the rewrite class!" ).setName( "RewriteRuleNotImplementedException" ); 
							};

							if ( typeof mod[ "getRules" ] !== "function" ) throw new Error( "The module doesn't implement the «Rules» class!" ).setName( "RewriteRuleNotImplementedException" ); 
							
							mod.getRules().forEach( function( rule ){
								this._rules.push( rule );
							}.bind( this ) );
						} catch ( e ){
							throw new Error( "Failed to load the rewrite directives in the file «"+path+"»: " + e.message ).setName( "RewriteRuleLoadException" );
						}
					}.bind( this ) );
				}
				
			}.bind( this ) );
		}





		, request: function( request, response, next ){

		}

	} );



	module.exports.Rules = Rules;