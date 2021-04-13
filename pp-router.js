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

			function isFunction(func) {
				return func && {}.toString.call(func) === '[object Function]';
			}
		
			/**
			*@name routes
			*@description : contenedor de roeuter provistos por el usuario
			*/
			this.routes = routes;
			/*
			*@history
			*/
			this.history = window.history;
			/*
			*@location
			*/
			this.location = window.location;
			/*
			*@params
			*@description - Objecto que contiene si existen parametros en la url
			*/
			this.params = null;
			// EVENTO QUE QUEDA ESCUCHANDO LOS CAMBIOS DE URL 
			window.addEventListener('hashchange',function(){ this.run() }.bind(this));			

			/*
			*@name redirect
			*/
			this.redirect = function( url_redirect ){
				this.url_redirect = url_redirect;
			}
			/*
			*@name run
			*@type Function
			*@description  funcion que inicializa la primara
			*verificacion de url			
			*/
			this.run = function(){
				//una referencia local para el hash
				var hash = this.location.hash;				
				// validamos que el hash no entre vacio
				if(hash === ""){
					hash = hash+"/";
					this.location.hash = "/";
				}
				// estramemos todas las llaves del router, 
				// vendian siendo la url a analizar
				const keys = Object.keys( routes);

				for( var i = 0; i < keys.length ; i++ ){
					
					// VERIFICAMOS QUE HALLA UNA COINCIDENCIA
					const check = this.checkHash(hash,keys[i]);
					// EN EL CASO QUE HALLA UNA CONCIDENCIA Y ADEMAS 
					// SE HALLA PROPORCIONADO UN CONTROLADOR PARA ESTA URL
					// SERA EJECUTADO CON LOS PARAMETROS CAPTURADOS
					if( check && isFunction(this.routes[keys[i]].controller) ){
						this.routes[keys[i]].controller( this.params );
						break;
					}
					// LLEGAMOS HA ESTE PUNTO CUANDO NO HEMOS 
					// NO HEMOS HALLADO NINGUNA COINCIDENCIA
					//ES UN ESTADO noFound
					if( (i+1) == keys.length ){
						if( typeof this.url_redirect == "string" ){
							this.location.hash = this.url_redirect;
						}
					}

				}

			}
			/*
			*@name checkHash
			*@type Function
			*@description 
			*/
			this.checkHash = function( hash , pattern ){
				
				//VALIDAMOS QUE LAS URL VENGAN EXACTAS - OMITIMOS URL QUE VENGAN CON PREFIGOS
				if( hash.replace("#","") == pattern && pattern.indexOf(":") == -1 ){ return true; };

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
				if( typeof url == "string" ){ this.location.hash = url; }
				this.run();
			}
	}			
//--------------------	
}));		