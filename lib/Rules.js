


	var   Class 		= require( "ee-class" );



	module.exports = new Class( {

		_rules: []


		, getRules: function(){
			return this._rules;
		}



		, add: function( from, to, external ){
			this._rules.push( { from: from, to:to, external: !!external } );
		}
	} );

