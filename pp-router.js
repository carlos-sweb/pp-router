/*!!
 * Power Panel Router <https://github.com/carlos-sweb/pp-router>
 * @author Carlos Illesca
 * @version 1.0.0 (2020/04/12 21:29 PM)
 * Released under the MIT License
 */
(function(global , factory ){
  	
  	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  	
  	typeof define === 'function' && define.amd ? define('ppRouter', factory) :
	
	(global = global || self, (function () {
        
    var exports = global.ppRouter = factory();    

	}()
	
));

})( this,(function() {

	return function(routes){

			this.routes = routes;

			this.history = window.history;

			this.location = window.location;

			this.params = null;

			window.addEventListener('hashchange',function(){ this.run() }.bind(this));


			this.notFound = function( done ){
				if( typeof done == 'function'){
					done.bind(this)();	
				}
				
			}

			this.redirect = function( url_redirect ){
				this.url_redirect = url_redirect;
			}
		
			this.run = function(){
				
				var hash = this.location.hash;
				
				if(hash === ""){hash = hash+"/";this.location.hash = "/";}

				const keys = Object.keys( routes);

				for( var i = 0; i < keys.length ; i++ ){
					const check = this.checkHash(hash,keys[i]);
					if( check ){
						this.routes[keys[i]].controller( this.params );
						break;
					}
					if( (i+1) == keys.length ){
						this.location.hash = this.url_redirect;
					}
				} 

			}

			this.checkHash = function( hash , pattern ){

				if( hash.replace("#","") == pattern ){ return true; };

				const regex = /\/[(\:)]{1}([a-z,A-Z,0-9,\-,\_]{0,})[\(](string|any|number)[\)]/g;				
				var p = new RegExp( regex );

				var prueba = `^#\\`+pattern;

				var group = [];

				let m ;

				while( ( m = p.exec(pattern) ) != null ){
					group.push(m);
					switch( m[2] ){
						case "number":								
							prueba = prueba.replace(m[0],`\\/([0-9]{1,})`);
						break;
						case "any":
							prueba = prueba.replace(m[0],`\\/([A-Z,a-z,0-9]{1,})`);
						break;
						case "string":
							prueba = prueba.replace(m[0],`\\/([a-z,A-Z]{1,})`);
						break;
					}

				}

				prueba = prueba+`$`;
								
				var aaa = new RegExp(prueba);					

				var result = aaa.exec(hash);

				if(  !(result == null)  ){ 

					var params = new Object();

					group.forEach((g,i)=>{
						params[g[1]] = result[(i+1)];

					});
										

					this.params = params;

					return true;
				}else{
					this.params = null;
				}				

				return false;
			}

			this.start = function(url){
				if( typeof url == "string" ){
					this.location.hash = url;
				}
				this.run();			
			}	



	}			
//--------------------	
}));		