# express-hotmods

### Automatically reload your express modules with a keyword parameter in url. 

One thing i enjoyed about PHP was the abillity to edit a .php script and just reload the web page to see changes.
Now with express-hotmods you can reload your modules and thier child modules by adding a keyword parameter to your urls while you are developing.
##### http://my_express_server.com/path/to/module?some_param=value&_reload

### Installation:
```sh
$ npm install express-hotmods
```
### Use:
in your express router e.g  *app.js*
```js
var app = express();
app.use('/api', require('express-hotmods')(__dirname + '/api', '__reload'));
```
### Constructor:
```js
 require('express-hotmods')('path', 'keyword'));
```
 - path: full path to folder with express modules.
 - keyword: parameter to reload modules.  e.g '_debug'

### Modules
example express app
```
.
+-- app.js
+-- views/
+-- routes/
+-- api/
    +-- my_module.js
    +-- another_module.js
```

```js
app.use('/api', require('express-hotmods')(__dirname + '/api', '_reload'));
```
##### http://my_express_server.com/api/my_module?_reload
The module name is called directly in url (- .js)

#### Call function endpoints in modules:
##### http://my_express_server.com/api/another_module/_function1?_reload
If the last path item starts with '_' **express-hotmods** will attempt to call _function_ name.

in module
in *another_module.js*
```js
module.exports = {
    function1: function1,
    function2: function2,    
};
...
function function1(req,res){
  ...
}
...
function function2(req,res){
  ...
}
```
#### Child modules
**express-hotmods** will also try reload all child modules required by your module.

##### Note
Use of `setInterval` in a module gets loaded in the global space and does not get destroyed on reload, so you will end up with multiple `setInterval` running after each reloading, so not recommended at the moment, unless I can figure out how to control them.
##### TODO
 - Finish renedering a module usage viewer if you hit http://my_express_server.com/folder/ 
 - Node does not seem to list child modules correctly in *Modules* object  if another module has already loaded same child module  
This is my first published npm module, so any pointers or improvements would be appriciated. 

