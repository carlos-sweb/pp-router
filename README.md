# pp-router.js

check the <a href="https://pp-router.netlify.app">Example</a>


## Getting Started

In the web project include pp-router.js with:

```javascript
<script src="https://cdn.jsdelivr.net/npm/pp-is@latest/pp-is.min.js" ></script>
<script src="https://cdn.jsdelivr.net/npm/pp-router.js@2.1.6/pp-router.min.js" ></script>
```

Or

## Install

```
npm i pp-router.js --save
```

## Initialize

Simple Router for you Apps Client-Side
```html
<ul>
	<li><a href="#/">Incio</a></li>
</ul>
<ul>
	<li><a href="#/vegetables/artichokes/1">Artichokes</a></li>
	<li><a href="#/vegetables/onion/20">Onion</a></li>
	<li><a href="#/vegetables/carrots/2">Carrots</a></li>
</ul>
<div id="root" ></div>

```

```javascript
// Declare root html element
var root = document.getElementById("root");

// Declare router here
var router = new ppRouter(
    // How to use it ?
    {
    "/":{
        controller:function(){
            root.innerHTML = `<h1>Home</h1>`;
        }
    },
    "/route-remove":{
        controller:function(){
            root.innerHTML = `<h1>Route Remove</h1>`;
        }
    }
    }
);

// If you want to add another router
router.addRoute("/vegetables/:name(string)/:id(number)",
    {
        controller:function( params ){				
            root.innerHTML = `<h1>vegetables ${params.name} : ${params.id} </h1>`;
        }
    }
);

// If you want to remove any route
router.removeRoute("/route-remove");

// If you want to default redirect
router.redirect("/");

// If you want to default Function for noFound state

router.noFound = function( location ){
    // Put you code here
}

//getting enjoy you router
router.start();
// if you want
//router.start("/my-url-base");

```

## Methods

### router

You can write exact routers, that's easy.

but if you need dynamic routers do it as follows<br>

<strong><i>/customer/:id(number)</i></strong><br>
<strong><i>/customer/:namecustomer(string)/:id(number)</i></strong><br>
<strong><i>/customer/:nameAndId(any)</i></strong><br>

there are three ways to get it :nameMyVar(number) , :nameMyVar(string) , :nameMyVar(any)

### addRoute

receives the name of the url and its object, see the example above

### removeRoute

removes routing according to url

### redirect

set a url for unmatched urls

### noFound

creates a function to execute in case of url mismatches

### start

Function that initializes the analizis, you can also set a base url
