/*!!
 * Power Panel Router <https://github.com/carlos-sweb/pp-router>
 * @author Carlos Illesca
 * @version 2.1.4 (2020/08/09 23:34 PM)
 * Released under the MIT License
 */
(function(global , factory ){

  	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :

  	typeof define === 'function' && define.amd ? define('ppRouter', factory) :

	(global = global || self, (function () {

    var exports = typeof ppIs === 'undefined' ?
    global.ppRouter = factory() : global.ppRouter = factory( ppIs )

	}()

));

})( this,(function( ppIs ) {

	return function(routes){
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

        // Contenedor de los maches
        var matchesUrl = [];
				//una referencia local para el hash
				var hash = this.location.hash;
				// validamos que el hash no entre vacio
				if(hash === ""){
					hash = hash+"/";
					this.location.hash = "/";
				}
        // ESTRAEMOS TODAS LAS LLAVES DEL ROUTER,
				// VENDRIAN SIENDO LAS URL A ANALIZAR
				const keys = Object.keys( routes);

				for( var i = 0; i < keys.length ; i++ ){

					// VERIFICAMOS QUE HALLA UNA COINCIDENCIA
					const check = this.checkHash(hash,keys[i]);
					// EN EL CASO QUE HALLA UNA CONCIDENCIA Y ADEMAS
					// SE HALLA PROPORCIONADO UN CONTROLADOR PARA ESTA URL
				   // SERA EJECUTADO CON LOS PARAMETROS CAPTURADOS
          // -------------------------------------------------------------------
            if( check.success && ppIs.isFunction(this.routes[keys[i]].controller) ){
               matchesUrl.push( check );
            }
				}// FOR
        // CUANDO NO HAY COINCIDENCIAS EN EL LA URL
        if( matchesUrl.length === 0 ){
            if( ppIs.isFunction( this.noFound ) ){ this.noFound( this.localtion );  }
            if( typeof this.url_redirect == "string" ){
              this.location.hash = this.url_redirect;
            }
        }
        // CUANDO NO HAY COINCIDENCIAS EN EL LA URL
        // CUANDO POR LO MENOS HAY UNA COINCIDENCIA
        if( matchesUrl.length > 0 ){
            /*
            NOTA : EN ESTE PUNTO PODEMOS MEJORAR LA PRIORIDAD
            CUANDO LOS MATCH TIENE LA MISMA CANTIDAD DE "DINAMIC"
            */
            // contenedor del numero de url dinamicas tiene los match
            var dinamic = [];
            for( var i = 0; i < matchesUrl.length ; i++ ){
              dinamic.push( matchesUrl[i].dinamic );
            }
            // ontenemos el valor minimo
            var min = Math.min(...dinamic);
            // Buscamos el index en el array
            var indexOf = dinamic.indexOf(min);
            // encontramos el pattern exacto
            var patternMatch =  matchesUrl[indexOf].pattern;
            // establecemos los paramtetros en el objeto
            this.params = matchesUrl[indexOf].params;
            // Ejecutamos la funcion unica
            this.routes[ patternMatch ].controller( matchesUrl[indexOf].params );
        }
        // CUANDO POR LO MENOS HAY UNA COINCIDENCIA
			}
			/*
			*@name checkHash
			*@type Function
			*@description
			*/
			this.checkHash = function( hash , pattern ){
        var dinamic = 0;
				//VALIDAMOS QUE LAS URL VENGAN EXACTAS - OMITIMOS URL QUE VENGAN CON PREFIGOS
				if( hash.replace("#","") == pattern && pattern.indexOf(":") == -1 ){ return {'success':true , 'dinamic':dinamic , 'pattern' : pattern , 'params': {} }; };
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
              dinamic++;
						break;
						case "any":
							contructRegexp = contructRegexp.replace(ExecTemp[0],`/([0-9A-Za-z]{1,})`);
              dinamic++;
						break;
						case "string":
							contructRegexp = contructRegexp.replace(ExecTemp[0],`/([A-Za-z-_]{1,})`);
              dinamic++;
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
					//   this.params = params;

					// DEVOLVEMOS TRUE , ES CORRECTO
					return {'success':true , 'dinamic':dinamic, 'pattern' : pattern ,'params': params }
				}else{
					// ANULAMOS CUALQUIER PARAMS QUE SE HALLA QUEDADO
					this.params = null;
				}
				// retornamos falso
				return {'success':false}
			}
			/*
			*@name start
			*@type Function
			*@description - Esta funcion
			*/
			this.start = function( url ){

        ppIs.isString(url,function( u ){
          this.location.hash = u;
        }.bind(this));

				this.run();

			}
	}
//--------------------
}));
