


	var   Class 		= require( "ee-class" )
		, log 			= require( "ee-log" )
		, type 			= require( "ee-types" )
		, fs 			= require( "fs" )
		, path 			= require( "path" )
		, Rules 		= require( "./Rules" )
		, project 		= require( "ee-project" );



	module.exports = new Class( {

		 // we'll create a tree of paths for the rewrite sources where possible
		   _sourceTree: {}

		 // regexp source matching, slow! 
		 , _rules: []

 		

 		, init: function( options ){
 			this.path = options && options.path && options.path[ 0 ] !== "/" ? path.join( project.root, options.path ) : ( options.path || "" );
 			this.options = options;

 			if ( this.path ) this._load();
		}



		// load rules from rule file
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
								this.addRule( rule.from, rule.to, rule.external );
							}.bind( this ) );
						} catch ( e ){
							throw new Error( "Failed to load the rewrite directives in the file «"+path+"»: " + e.message ).setName( "RewriteRuleLoadException" );
						}

			log( this._rules )
					}.bind( this ) );
				}
				
			}.bind( this ) );

		}




		, addRule: function( from, to, external, fromOptions ){


			switch ( type( from ) ){

				case "string":
					if ( /[^\\]:[^\/\:]+/gi.test( from ) ){
						var rule = { reg: null, to: to, external: external, map: {}, fromOptions: fromOptions };
						var reg = /[^\\](:[^\/\:]+)/gi, regResult, i = 1;

						while( regResult = reg.exec( from ) ){
							from = from.replace( regResult[1], "$1([^\\/\\:]+)" );
							reg.lastIndex--;
							rule.map[ i ] = regResult[ 1 ];
							i++
						}

						rule.reg = from.replace( /\\:/gi, ":" );

						this._rules.push( rule );
					}
					else this._rules.push( { str: from, to: to, external: external, fromOptions: fromOptions } );
					break;


				case "function":
					this._rules.push( { fn: from, to: to, external: external, fromOptions: fromOptions } );
					break;


				case "regexp":
					this._rules.push( { reg: from, to: to, external: external, fromOptions: fromOptions } );
					break;


				case "array":
					from.forEach( function( frm ){
						this.addRule( frm, to, external );
					}.bind( this ) );
					break;


				case "object": 
					if ( type.undefined( from.from ) ) throw new Error( "Invalid rewrite rule typeof «"+type( from )+"». Missing the «from» directive!" ).setName( "InvalidFormatException" );
					else this.addRule( from.from, to, external, from );
					break;


				default: 
					throw new Error( "Invalid rewrite rule typeof «"+type( from )+"»: " + from ).setName( "InvalidTypeException" );
			}
		}
 


		, request: function( request, response, next ){

		}

	} );



	module.exports.Rules = Rules;