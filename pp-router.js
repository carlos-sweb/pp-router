/*!!
 * Power Panel Router <https://github.com/carlos-sweb/pp-router>
 * @author Carlos Illesca
 * @version 1.0.9 (2020/05/08 08:53 AM)
 * Released under the MIT License
 */
(function(global , factory ){

  	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :

  	typeof define === 'function' && define.amd ? define('ppRouter', factory) :

	(global = global || self, (function () {

    var exports = typeof ppView === 'undefined' ?
    global.ppRouter = factory() : global.ppRouter = factory(ppView);

	}()

));

})( this,(function( view ) {

	return function(routes){
			/*
			*@name isFunction
			*@type Function
			*@description es una funcion que verifica is el parametro
			*entregado es una funcion
			*/
			function isFunction(func) {
				return func && {}.toString.call(func) === '[object Function]';
			}

			/**
			*@name routes
			*@description : contenedor de roeuter provistos por el usuario
			*/
			this.routes = routes || {};
			/*
			*@name addRoute
			*@type Function
			*@description Agrega un route al listado
			*/
			this.addRoute = function( pattern , object){
				 this.routes[pattern] = object;
			}
			/*
			*@name removeRoute
			*@type Function
			*@description - remueve un route al listado
			*/
			this.removeRoute = function( pattern ){

				var keys = Object.keys(this.routes);

				for( var i = 0; i < keys.length ; i++  ){
					if( keys[i] == pattern ){
						delete this.routes[pattern];
						break;
					}
				}

			}
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

          this.view = typeof view === 'undefined' ?
          undefined : new view(this.routes[keys[i]]);

          if( typeof this.view === 'undefined'  ){
            if( check && isFunction(this.routes[keys[i]].controller) ){
               this.routes[keys[i]].controller( this.params );
            }
          }else{
            if( check && isFunction(view.controller) ){
              view.controller(this.params)
            }
          }
					// LLEGAMOS HA ESTE PUNTO CUANDO NO HEMOS
					// NO HEMOS HALLADO NINGUNA COINCIDENCIA
					//ES UN ESTADO noFound
					if( (i+1) == keys.length ){
						// si esta la funcion noFound se ejecuta
						if( isFunction(this.noFound) ){ this.noFound( this.location );  }
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
				if( hash.replace("#","") == pattern && pattern.indexOf(":") == -1 ){return true;};
				// EXPRESION REGULAR
				const regex = /\/[(\:)]{1}([a-z,A-Z,0-9,\-,\_]{0,})[\(](string|any|number)[\)]/g;
				// se inicia la expresion regular
				var regexp = new RegExp( regex );
				// empezamos a crear un regexp en base a los parametros añadidos en el match
				var contructRegexp = `^#`+pattern;
				// vamos a volcar en un grupo todos
				// los aciertos o coincidencias
				var group = [];
				// VARIABLE TEMPORAL
				var ExecTemp;
				// PROCESO DE CAPTURA DE LOS GRUPOS
				while( ( ExecTemp = regexp.exec(pattern) ) != null ){
					group.push(ExecTemp);
					switch( ExecTemp[2] ){
						case "number":
							contructRegexp = contructRegexp.replace(ExecTemp[0],`/([0-9]{1,})`);
						break;
						case "any":
							contructRegexp = contructRegexp.replace(ExecTemp[0],`/([0-9A-Za-z]{1,})`);
						break;
						case "string":
							contructRegexp = contructRegexp.replace(ExecTemp[0],`/([A-Za-z-_]{1,})`);
						break;
					}

				}
				// AGREGAMOS $ PARA DETERMINAR LA EXPRESION REGULAR EXACTA

				contructRegexp = contructRegexp.replaceAll(`/`,`[\\/]{1}`);
				contructRegexp = contructRegexp +`$`;
				//YA ESTA CONSTRUIDA LA EXPRESION REGULAR PARA USAR
				var FinalRegexp = new RegExp(contructRegexp);
				// OBTENEMOS EL RESULTADO - SABEMOS QUE ES SOLO 1 SIN GRUPOS
				var result = FinalRegexp.exec(hash);
				//
				if(  !(result == null)  ){
					// ESTOS SON LOS PARAMTEROS A DEVOLVER
					// EN LA FUNCION
					var params = new Object();
					//CAPTURAMOS EL VALOR DEL PARAMTRO
					//COMO VARIABLE
					group.forEach((g,i)=>{
						params[g[1]] = result[(i+1)];
					});
					//CREAMOS LOS PARAMS EN LOS PARAM GLOBALES
					this.params = params;
					// DEVOLVEMOS TRUE , ES CORRECTO
					return true;
				}else{
					// ANULAMOS CUALQUIER PARAMS QUE SE HALLA QUEDADO
					this.params = null;
				}
				// retornamos falso
				return false;
			}
			/*
			*@name start
			*@type Function
			*@description - Esta funcion
			*/
			this.start = function(url){
				if( typeof url == "string" ){ this.location.hash = url; }
				this.run();
			}
	}
//--------------------
}));
