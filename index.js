'use strict';
/*global __log*/

//var $path;
//var $keyword;

exports = module.exports = hotmods;
var util = require("util");

function hotmods(path, keyword)
{


	return function(req, res, next)
	{
		var $path = path;
		var $keyword = keyword || '__reload';

		if(req.path === "/")
		{
			module.children = module_child_clean_up(module);
			res.send(info(module.children));
			//res.send(module.id);
			//res.send("<pre>" + util.inspect(module.children) + "</pre>");
			return;
		}

		var url = url_to_object(req.path); //returns {mod : "", func: ""} 
		__log(url);

		var mod_name = $path + url.mod + ".js";
		console.log("mod=" + mod_name);
		try
		{

			var mod = require(mod_name);

			if(req.query[$keyword] !== undefined)
			{
				console.log("****HOTMOD RELOAD: " + mod_name);
				var i = module_find_child(mod_name);
				module_unload_children(module.children[i].children);
				module.children.splice(i, 1); //remove from array else memory leak on each reload
				delete require.cache[mod_name];

				var mod = require(mod_name);
			}

			var ret = null;
			if(typeof mod === 'function') ret = mod(req, res, next); //module is just a function
			else if(url.func) ret = mod[url.func](req, res, next);
			else next();

			if(ret)
			{
				res.json(ret);
				return;
			}
			

		}
		catch(e)
		{
			console.log(e);
			//TODO if module does not exist but is in module.children then cleanup.
			next(e);
		};

	}

}

//=================================================================================
function url_to_object(url)
{
	var out = {
		mod: "",
		func: ""
	};
	var p = url.split("/");
	var last = p[p.length - 1];
	if(last.substr(0, 1) === '_')
	{
		out.func = last.substr(1); //remove _
		p.pop(); //remove last path
		out.mod = p.join("/");
	}
	else
		out.mod = url;

	return out;
}

//--------------------------------
function module_find_child(path)
{
	var ch = module.children;
	for(var i in ch)
	{
		if(ch[i].id == path) return i;
	}

}

//---------------------------------
function module_unload_children(arr)
{
	for(var i in arr)
	{
		var mod = arr[i].id;
		delete require.cache[mod];
	}
}


function module_child_clean_up(mod)
{

	//loop thru all direct children and cleanup orphens
	var ch = mod.children;
	for(var i in ch)
	{
		if(ch[i].loaded == false || !is_file(ch[i].id))
		{
			__log("CLEAN UP");
			module_unload_children(ch[i].children);
			delete require.cache[ch[i].id];
			ch[i] = null;
		}
	}

	//clean up null children
	ch = ch.filter(function(n)
	{
		return n != undefined
	});
	return ch;
}


//-----------------------
function info(ch)
{
	//return ("<pre>" + util.inspect(module.children) + "</pre>");
	var out = "<!DOCTYPE html>";
	out += "<head>";
	out += css();
	out += "</head><body>"
	for(var i in ch)
	{
		out += '<div class="mod">' + ch[i].id + "</div>";
		var c = get_children(ch[i].children); //array of children ["file.js","file2"]
		for(var s in c)
		{
			out += '<div class="sub">' + c[s] + "</div>";

		}


	}

	//	__log(out);
	out += "</body>";
	return out;


}

function get_last(path)
{
	var t = path.split("/");
	return t[t.length - 1];
}

function get_children(mod)
{
	var out = [];
	for(var i in mod)
	{
		//	out.push(get_last(mod[i].id));
		out.push(mod[i].id);
	}

	return out;
}

function css()
{
	return "<style>" + file_get_contents(__dirname + "/css/style.css") + "</style>";
}

function file_get_contents(f)
{
	var fs = require('fs');
	try
	{
		var s = fs.readFileSync(f, 'utf8');
	}
	catch(e)
	{
		return null
	};
	return s;
}

function is_file(path)
{

	var fs = require('fs');
	try
	{
		var stats = fs.lstatSync(path);
		if(stats.isFile()) return true;
	}
	catch(e)
	{
		return false;
	}
	return false;

}
