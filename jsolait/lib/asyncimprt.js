
Error.prototype.toString=function(){
    return this.message;

}
var applyNames=function(container){
    for(var n in container){
        var obj = container[n];
        if(typeof obj == 'function'){
            obj.__name__ = n;
        }
    }
};

publ.CreateModuleFailed=Class(Exception, function(publ, supr){
    /**
        Initializes a new CreateModuleFailed Exception.
        @param module     The module.
        @param trace      The error cousing this Exception.
    **/
    publ.__init__=function(module, trace){
        supr.__init__.call(this, "Failed to create module %s".format(module), trace);
        this.failedModule = module;
    };
    ///The module that could not be createed.
    publ.module;
});

publ.createModule=function(name, source, sourceURI, modFn, returncb){
    var newMod = new jsolait.ModuleClass(name, source, sourceURI);
    
    var privateScope={imprt: function(imp){
            var s = arguments.callee.scope;
            __imprt__(imp, s);
        }};
    privateScope.imprt.scope=privateScope;
    privateScope.Exception = Class(Exception, new Function());
    privateScope.Exception.prototype.module = newMod;
    try{//to run the module source
        modFn.call(newMod, newMod, privateScope, jsolait.builtin);
        applyNames(newMod);
        applyNames(privateScope);
        
        jsolait.modules[name] = newMod;
        returncb(newMod);
    }catch(e){
        if(e.constructor == ModuleNotFound){
            loadModule(e.moduleName, function(m, err){
                if(err == null){
                    createModule(name, source, sourceURI, modFn, returncb);
                }else{
                    returncb(null, new CreateModuleFailed(newMod, err));
                }
            });
        }else{
            returncb(null, new CreateModuleFailed(newMod, e));
        }
    }
};

publ.createModuleFromSource=function(name, source, sourceURI, returncb){
    try{
        var modFn = new Function("publ,priv,__builtin__", "with(__builtin__){with(publ){with(priv){\n" + source + "\n}}}");
        createModule(name, source, sourceURI, modFn,returncb);
    }catch(e){
        returncb(null,e);
    }
};     



publ.loadModule = function(name, returncb){
    
    if(jsolait.modules[name]){ //module already loaded
        returncb(jsolait.modules[name], null);
    }else{
        var searchURIs = jsolait.getSearchURIsForModuleName(name);
        var failedURIs=[];
        loadURI(searchURIs.shift(), function(src, sourceURI, err){
            if(err==null && src != null){
                createModuleFromSource(name, src, sourceURI, function(m, err){
                    if(err ==null){
                        returncb(m, null);
                    }else{
                        returncb(null,new LoadModuleFailed(name, [sourceURI], err));
                    }
                });
            }else{
                failedURIs.push(sourceURI);
                if(searchURIs.length){
                    loadURI(searchURIs.shift(), arguments.callee);
                }else{
                    returncb(null, new LoadModuleFailed(name, failedURIs, err));
                }
            };
        });
    }
};


publ.LoadModuleFailed=Class(Exception, function(publ, supr){
    /**
        Initializes a new LoadModuleFailed Exception.
        @param name      The name of the module.
        @param moduleURIs A list of paths jsolait tried to load the modules from
        @param trace      The error cousing this Exception.
    **/
    publ.__init__=function(moduleName, moduleURIs, trace){
        supr.__init__.call(this, "Failed to import module: '%s' from:\n%s".format(moduleName, moduleURIs.join(',\n').indent(2)), trace);
        this.moduleName = moduleName;
        this.moduleURIs = moduleURIs;
    };
    ///The  name of the module that was not found.
    publ.moduleName;
    ///The URIs or a list of paths jsolait tried to load the modules from.
    publ.moduleURIs;
});

publ.LoadURIFailed=Class(Exception, function(publ, priv,supr){
    /**
        Initializes a new LoadURIFailed Exception.
        @param name      The name of the module.
        @param sourceURI  The uri jsolait tried to load the file from
        @param trace      The error cousing this Exception.
    **/
    publ.__init__=function(sourceURI, trace){
        supr.__init__.call(this, "Failed to load file: '%s'".format(sourceURI.indent(2)), trace);
        this.sourceURI = sourceURI;
    };
    ///The path paths jsolait tried to load the file from.
    publ.sourceURI;
});

publ.loadURI=function(uri, cb){
    try{
        var xmlhttp = jsolait.getHTTPRequestObject();
    }catch(e){
         cb(null, uri, new LoadURIFailed(uri, e));
         return;
    }
    
    try{
        xmlhttp.open("GET", uri, true);
    }catch(e){
        cb(null, uri, new LoadURIFailed(uri, e));
        return;
    }
    
    var handled = false;
    
    xmlhttp.onreadystatechange=function(){
        var e=null;
        var s=null;
            
        if (xmlhttp.readyState==4) {
            if(xmlhttp.status == 200 || xmlhttp.status == 0 || xmlhttp.status == null || xmlhttp.status == 304){
                 s= xmlhttp.responseText;
            }else{
                 e= new LoadURIFailed(uri, new Exception("Server did not respond with status code 200 but with: " + xmlhttp.status));
            }
            if(s ==null){
                e=  new LoadURIFailed(uri, new Exception("No Data"))
            }
            xmlhttp.onreadystatechange=new Function("");
            xmlhttp = null; //help IE with garbage collection
            handled=true;
            cb(s,uri, e);
        }else if (xmlhttp.readyState==2){
            //status property should be available (MS IXMLHTTPRequest documentation)
            //in Mozilla it is not if the request failed(server not reachable)
            //in IE it is not available at all ?!
            try{//see if it is mozilla otherwise don't care.
                var isNetscape = netscape;
                try{//if status is not available the request failed.
                    var s=xmlhttp.status;
                }catch(e){//call the callback because Mozilla will not get to readystate 4
                    xmlhttp.onreadystatechange=null;
                    xmlhttp = null;
                    handled=true;
                    cb(null, uri, new LoadURIFailed(uri, new Exception("Unknown error.")));
                }
            }catch(e){
            }
        }
    };
    
    try{
        xmlhttp.send("");
    }catch(e){
        if(!handled){
            cb(null, uri, new LoadURIFailed(uri, e));
        }
    }
};

publ.ModuleNotFound=Class(Exception,function(publ,priv,supr){
    publ.__init__=function(moduleName){
        supr.__init__.call(this, "Module '%s' not found. Loading of source required.".format(moduleName));
        this.moduleName = moduleName;
    }
});

publ.__imprt__ = function(name, destinationScope){
    var n=name.replace(/\s/g,"").split(":");
    name = n[0];
    if(n.length>1){
        var items = n[1].split(",");
    }else{
        var items=[];
    }
    
    var m = jsolait.modules[name];
    if(m == null){
        throw new ModuleNotFound(name);
    }else{
        if(items.length > 0){
            if(items[0] == '*'){
                for(var key in m){
                    if(key.slice(0,2) != "__" && destinationScope[key] == undefined){
                        destinationScope[key] = m[key];
                    }
                }
            }else{
                for(var i=0;i<items.length;i++){
                    destinationScope[items[i]] = m[items[i]];
                }
            }
        }else{
            destinationScope[name] = m;
        }
    }
};
    
