


	var   Class 		= require( "ee-class" )
		, log 			= require( "ee-log" )
		, Events 		= require( "ee-event-emitter" )
		, type 			= require( "ee-types" )
		, fs 			= require( "fs" )
		, path 			= require( "path" )
		, Rules 		= require( "./Rules" )
		, querystring 	= require( "querystring" )
		, project 		= require( "ee-project" );



	module.exports = new Class( {
		inherits: Events

		 // we'll create a tree of paths for the rewrite sources where possible
		 , _sourceTree: {}

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
					}.bind( this ) );

					this.emit( "load" );
				}
				
			}.bind( this ) );

		}




		, addRule: function( from, to, external, fromOptions ){

			// to must be an object
			if ( type.string( to ) ) to = { to: to };

			// make method lowercase
			if ( fromOptions && fromOptions.method ) fromOptions.method = fromOptions.method.toLowerCase();
			if ( to && to.method ) to.method = to.method.toLowerCase();

			// cannot to non get external redirects
			if ( external && to && to.method && to.method !== "get" ) throw new Error( "Rule «"+from+"»: cannot force an external redirect method!" ).setName( "InvalidRewriteRuleException" );


			switch ( type( from ) ){

				case "string":
					if ( /[^\\]:[^\/\:]+/gi.test( from ) ){
						var rule = { reg: null, to: to, external: external, map: {}, fromOptions: fromOptions };
						var reg = /[^\\](:[^\/\:]+)/gi, regResult, i = 1;

						while( regResult = reg.exec( from ) ){
							from = from.replace( regResult[1], "([^\\/\\:]+)" );
							reg.lastIndex--;
							rule.map[ i ] = regResult[ 1 ];
							i++
						}

						rule.reg = new RegExp( from.replace( /\\:/gi, ":" ), "gi" );

						this._rules.push( rule );
					}
					else this._rules.push( { str: from, to: to, external: external, fromOptions: fromOptions } );
					break;


				case "function":
					this._rules.push( { fn: from, external: external, fromOptions: fromOptions } );
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
			this._matchRules( 0, request, response, next );
		}




		, _matchRules: function( offset, request, response, next ){

			if ( this._rules.length > offset ){
				var rule = this._rules[ offset ];

				//log( rule );

				if ( !rule.fromOptions || !rule.fromOptions.method || rule.fromOptions.method === request.method ){
					if ( rule.str && request.pathname.toLowerCase() === rule.str.toLowerCase() ) this._rewrite( rule, request, response, next );
					else if ( rule.reg && rule.reg.test( request.pathname ) ) this._rewrite( rule, request, response, next );
					else if ( rule.fn ){
						rule.fn( request, response, function(){
							// match next rule
							this._matchRules( ++offset, request, response, next );
						}.bind( this ), next );
					}
					else this._matchRules( ++offset, request, response, next );
				}
				else this._matchRules( ++offset, request, response, next );
			}
			else next();
		}



		, _rewrite: function( rule, request, response, next ){
			var regResult, to;

			if ( rule.str ){
				// string rule
				if ( rule.external ) response.send( 302, { Location: rule.to.to + this._getQuerystring( request ) } );
				else {
					request.pathname = rule.to.to;
					if ( rule.to.method ) request.method = rule.to.method;
					next();
				}
			}			
			else if ( rule.reg ){
				// regexp rule

				if ( rule.map ){
					// generated regexp
					rule.reg.lastIndex = 0;
					regResult = rule.reg.exec( request.pathname );
					to = rule.to.to;

					if ( regResult ){
						for ( var i = 1, l = regResult.length; i < l; i++ ){
							if ( rule.map[ i ] ){
								to = to.replace( new RegExp( rule.map[ i ], "gi" ), regResult[ i ] );
							}
						}
					}

					if ( rule.external ) response.send( 302, { Location: to + this._getQuerystring( request ) } );
					else { 
						request.pathname = to;
						if ( rule.to.method ) request.method = rule.to.method;
						next();
					}
				}
				else {
					// manual regexp

				}
			}
			log( rule );
			next();
		}



		, _getQuerystring: function( request ){
			if ( request.query && Object.keys( request.query ) > 0 ){
				return "?" + querystring.stringify( request.query );
			}
			return "";
		}
	} );



	module.exports.Rules = Rules;