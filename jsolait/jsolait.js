/*
    Copyright (c) 2003-2006 Jan-Klaas Kollhof

    This file is part of the JavaScript O Lait library(jsolait).

    jsolait is free software; you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation; either version 2.1 of the License, or
    (at your option) any later version.

    This software is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with this software; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*/

/**
    The main jsolait script.
    It provides the core functionalities for creating classes, modules and for importing modules.

    @author Jan-Klaas Kollhof
    @version 3.0
    @lastchangedby $LastChangedBy$
    @lastchangeddate $Date$
    @revision $Revision$
**/

jsolait=(function(mod){
    
    mod.__name__='jsolait';
    
    mod.__version__="$Revision$";
    
    mod.__str__ =function(){
        return "[module '%s' version: %s]".format(this.__name__, (this.__version__+'').replace(/\$Revision:\s(\d+) \$/, "Rev.$1"));
    };
    mod.toString=mod.__str__;
    
    ///The location where jsolait is installed.
    //do not edit the following lines, it will be replaced by the build script
    /*@baseURI begin*/
    mod.baseURI="./jsolait";
    /*@baseURI end*/
        
    ///The paths to the modules that come with jsolait.
    //do not edit the following lines, it will be replaced by the build script
    /*@moduleSourceURIs begin*/
    mod.moduleSourceURIs={};
    /*@moduleSourceURIs end*/
    
    /**
        The base URIs to search for modules in. 
        each item will be formated using moduleSearchURIs[i].format(jsolait) so,
        they may contain StringFormating symbols e.g '%(baseURI)s/lib'
    **/
    mod.moduleSearchURIs = [".", "%(baseURI)s/lib"];
   
    mod.packagesURI = "%(baseURI)s/packages";
    
    mod.modules={};
 
    /**
        Returns a string representation of an object.
        @param obj  The object to return a string repr. of.
        @return A string repr. the object.
    **/
    var str = String;

    /**
        Return a String containing a printable representation of an object which can be used with eval() to create an equal object.
        Objects can cosutumize the the value being returned by repr(obj) by providing a obj.__repr__() method which is called by repr(obj).
        @param obj  The object to create a repr. String from.
        @return A representation of the object.
    **/
    var repr = function(obj){
        if(obj == null){
            return null;
        }else if(obj.__repr__){
            return obj.__repr__();
        }else{
            switch(typeof obj){
                case "string":
                    obj = obj.replace(/\\/g,"\\\\").replace(/\"/g,"\\\"").replace(/\n/g, "\\n").replace(/\r/g,"\\r");
                    return '"' + obj + '"';
                case "boolean":case"number":
                    return "" + obj;
                case "object":
                    var out = [];
                    if(obj == null){
                        return "null";
                    }else if(obj instanceof Array){
                        for(var i=0;i<obj.length;i++){
                            out.push(repr(obj[i]));
                        }
                        return "[" + out.join(",") + "]";
                    }else if(obj instanceof Object){
                        for(var key in obj){
                            out.push(repr(key) + ":" + repr(obj[key]));
                        }
                        return "{" + out.join(",") + "}";
                    }
            }
        }
    };

    /**
        Returns a unique id for an object.
        The same object will always return the same id. 
        Most objects are id-able. The following steps are taken to find an id.
        If the obj has an __id__ property that id will be returned. (all jsolait classes have an __id__ property)
        If the obj has a __id__ method the return value of that method will be returned.(all jsolait objects have a __id__ method which sets an __id__ property)
        If the obj is a String  the string prefixed with $ is returned.
        If the obj is a Number the number prefixed with a # is returned as a string.
        All other objects are not safely id-able and an exception is thrown unless forceId is true. In that case the object will get a unique __id__ property applied which is returned.
        
        @param obj The object to get the id for.
        @param forceId=false if true it forces id() to set an __id__ property onto a non id-able object, making it id-able.
        @return A String containing a id value for the obj.
    **/
    var id = function(obj, forceId){
        switch(typeof obj.__id__){
            
            case "undefined":
                if(obj instanceof String || typeof obj == 'string'){
                    return '$' + obj;
                }else if(obj instanceof Number || typeof obj == 'number'){
                    return '#' + obj;
                }else if(forceId){
                    obj.__id__ = '@' + (Class.__idcount__++);
                    return obj.__id__;
                }else{
                    throw new mod.Exception('Objec cannot be IDed: %s'.format(obj));
                }
            
            case "function":
                return obj.__id__();
            
            default: //string
                return obj.__id__;
        }
    };

    /**
        Returns a bound method.
        A bound method is a function which is bound to a specific object.
        Calling the bound method will call the given function with the this-object inside that function's scope being the object specified.
        
        @param obj  The object the function should be bound to.
        @param fn   A function object the obj will be bound to.
        @return A method which when run executes the function with the this-object being the obj specified.
    **/
    var bind = function(obj, fn){
        return function(){
            return fn.apply(obj, arguments);
        };
    };

    /**
        Returns if an object is an instance of a specified class or of a direct or indirect subclass thereof.
        
        It also works for traditional javascript inheritance(i.e. SomeClass=function(){}; SomeClass.prototype=new SuperClass(); ...).
        Internaly it first checks using instanceof if that fails it uses isinstance(obj.constructor, cls).
        There are some differences between using isinstance and instanceof.
        i.e. 
        (123 instanceof Number) == false;
        isinstance(123, Number) == true;
        ('abc' instanceof String) == false;
        isinstance('abc', String) == true;
           
        @param obj   The object to test.
        @param cls     The class to test against.
        @return True if the object is an instance of cls. False otherwise.
    **/
    var isinstance=function(obj, cls){
        if(obj instanceof cls){
            return true;
        }else{
            return issubclass(obj.constructor, cls);
        }
    };

    /**
        Returns if a cls is a direct or indirect subclass of another.
        
        A class is always a subclass of itself and Object is the base for all classes.
        A class is a subclass of baseclass if it's prototype is an instance of baseclass.
        A class is a subclass of baseclass if any of it's __bases__ is a subclass of baseclass.
        If there are no __bases__ defined there is no way to findout about inheritance besides 
        the prototype chain which was checked by instanceof before, so false is returned.
        
        @param cls  The class to test.
        @param baseclass  The assumed superclass.
        @return True if cls is a subclass of baseclass otherwise false.
    **/
    var issubclass=function(cls, baseclass){
        if(baseclass === Object || cls===baseclass || (cls.prototype instanceof baseclass)){
            return true;
        }else{
            var bases = cls.__bases__;
            if(bases != null){
                for(var i=0;i<bases.length;i++){
                    if(bases[i] === baseclass){
                        return true;
                    }
                }
                for(var i=0;i<bases.length;i++){
                    if(issubclass(bases[i], baseclass)){
                        return true;
                    }
                }
            }
            return false;
        }
    };
    
    
    /**
        Creates a new class object which inherits from superClass.
        @param name="anonymous"  The name of the new class.
                                                If the created class is a public member of a module then
                                                the __name__ property of that class is automatically set by Module().
        @param base1 *                  The base classes (not an array but one argument per base class).
        @param classScope(-1)        A function which is executed for class construction.
                                                As 1st parameter it will get the new class' protptype for
                                                overrideing or extending the super class. As 2nd parameter it will get
                                                the super class' wrapper for calling inherited methods.
    **/
    var Class=function(name, base1, classScope){
        var args=[];
        for(var i=0;i<arguments.length;i++){
            args[i] = arguments[i];
        }

        classScope = args.pop();
        var classID =  Class.__idcount__++;

        if((args.length>0) && (typeof args[0] =='string')){
            name=args.shift();
        }else{
            name="anonymous" + classID;
        }

        var bases = args;

        //set up the 'public static' fields of the class
        var __class__={__isArray__ : false,
                             __name__ : name,
                             __bases__: bases,
                             __id__: '@' + classID,
                             __str__ : function(){
                                return "[class %s]".format(this.__name__);
                             },
                             __create__:function(initArgs){
                                var obj = new this(Class);
                                if(obj.__init__){
                                    obj.__init__.apply(obj, initArgs);
                                }
                                return obj;
                             }
                        };

        var baseProtos=[];//stores the prototypes of all the base classes
        var proto; //the prototype to use for the new class
        if(bases.length==0){//use Object as base
            proto={};
            proto.__str__ = function(){
                return "[%s %s]".format(this.__class__.prototype.__call__ === undefined ? 'object' : 'callable', this.__class__.__name__);
            };
            __class__.__bases__=[Object];
        }else{ //inherit from all base classes
            var baseProto;
            for(var i=0;i<bases.length;i++){
                var baseClass = bases[i];
                //remember the base prototypes
                baseProtos.push(baseClass.prototype);
                if(baseClass.__createProto__ !== undefined){
                    baseProto = baseClass.__createProto__(bases);
                }else{
                    baseProto = new baseClass(Class);
                }
                __class__.__isArray__ = __class__.__isArray__ || baseClass.__isArray__;

                if(i==0){//for the first base class just use it's proto as the final proto
                    proto = baseProto;
                }else{//for all others extend(do not overwrite) the final proto with the properties in the baseProto
                    for(var key in baseProto){
                        if(proto[key] === undefined){
                            proto[key] = baseProto[key];
                        }
                    }
                }
                //extend the new class' static interface
                //todo: any props that should not be copied
                for(var key in baseClass){
                    if((key != 'prototype') && (__class__[key] === undefined)){
                        __class__[key] = baseClass[key];
                    }
                }
            }
        }
        //make sure all jsolait objects have a id method
        if(proto.__id__ === undefined){
            proto.__id__=function(){
                this.__id__ = '@' + (Class.__idcount__++);
                return this.__id__;
            };
        }
        proto.__class__=__class__;

        //run the class setup function provided as classScope
        if(classScope.length-1 > baseProtos.length){
            var privId = '__priv__' + __class__.__id__;
            classScope.apply(this,[proto, privId].concat(baseProtos));
        }else{
            classScope.apply(this,[proto].concat(baseProtos));
        }
        
        //make sure the toString points to __str__, this will make overwriting __str__ after object construction impossible (todo ?)
        //but will be faster than having toString call __str__, also overwriting methods unless they are ment to be overridden is not cool anyways.
        proto.toString=proto.__str__;
            
        //allthough a single constructor would suffice for generating normal objects, Arrays and callables,
        //we use 3 different ones. This will minimize the code inside the constructor and therefore
        //minimize object construction time
        if(proto.__call__){
            //if the callable interface is implemented we need a class constructor
            //which generates a function upon construction
            var NewClass = function(calledBy){
                if(calledBy !== Class){
                    var rslt = function(){
                        return rslt.__call__.apply(rslt, arguments);
                    };
                    
                    //this will only work for the current class but not create any priv objects for any base class 
                    var proto=arguments.callee.prototype;
                    for(var n in proto){
                        rslt[n] = proto[n];
                    }
                    rslt.constructor = proto.__class__;
                    rslt.toString = proto.__str__;
                    if(rslt.__init__){
                        rslt.__init__.apply(rslt, arguments);
                    }
                    return rslt;
                }
            };
        }else if(__class__.__isArray__){
            //Since we cannot inherit from Array directly we take the same approach as with the callable above
            //and just have a constructor which creates an Array
            var NewClass = function(calledBy){
                if(calledBy !== Class){
                    rslt=[];
                    var proto=arguments.callee.prototype;
                    for(var n in proto){
                        rslt[n] = proto[n];
                    }
                    rslt.constructor = proto.__class__;
                    rslt.toString = proto.__str__;
                    if(rslt.__init__){
                        rslt.__init__.apply(rslt, arguments);
                    }else{//implement Array's default behavior
                        if(arguments.length==1){
                            rslt.length=arguments[0];
                        }else{
                            for(var i=0;i<arguments.length;i++){
                                rslt.push(arguments[i]);
                            }
                        }
                    }
                    return rslt;
                }
            }; 
        }else{
            //this is a 'normal' object constructor which does nothing but call the __init__ method
            //unless it does not exsit or the constructor was used for prototyping
            var NewClass = function(calledBy){
                if(calledBy !== Class){
                    if(this.__init__){
                        this.__init__.apply(this, arguments);
                    }
                }
            };
        }

        //reset the constructor for new objects to the actual constructor.
        proto.constructor = NewClass;
        proto.__class__= NewClass;//no, it is not needed, just like __str__ is not, but it is nicer than constructor
            
        //this is where the inheritance realy happens
        NewClass.prototype = proto;

        //apply all the static fileds
        for(var key in __class__){
            NewClass[key] = __class__[key];
        }
        NewClass.toString=__class__.__str__;

        return NewClass;
    };
    Class.__idcount__=0;
    Class.__str__=Class.toString = function(){return "[object Class]";};
    Class.__createProto__=function(){ throw "Can't use Class as a base class.";};
    
    mod.Class = Class;
    
    Function.__createProto__ = function(){ throw "Cannot inherit from Function. implement the callable interface instead using YourClass::__call__.";};
    Array.__createProto__=function(){ var r =[]; r.__str__ = Array.prototype.toString;  return r; };
    Array.__isArray__=true;
    Array.__str__=Array.toString=function(){return "[class Array]";};
    Object.__str__=Object.toString=function(){return "[class Object]";};
    Number.__str__ =Number.toString=function(){return "[class Number]";};
    String.__str__ =String.toString=function(){return "[class String]";};
    
    mod.Exception=Class(function(publ,priv,supr){
        /**
            Initializes a new Exception.
            @param msg           The error message for the user.
            @param trace=undefined  The error causing this Exception if available.
        **/
        publ.__init__=function(msg, trace){
            this.name = this.constructor.__name__;
            this.message = ''+msg;
            this.trace = trace;
        };

        publ.__str__=function(){
            return this.toTraceString();
        };
        
        /**
            Returns the complete trace of the exception.
            @param indent=0  The indention to use for each line.
            @return The error trace.
        **/
        publ.toTraceString=function(indent){
            indent = indent==null ? 0 : indent;
            //todo:use  constructor.__name__?
            var s="%s in %s:\n%s".format(this.constructor.__name__, this.module, this.message.indent(4)).indent(indent);
            if(this.trace){
                if(this.trace.toTraceString){
                    s+=('\n\nbecause:\n'+ this.trace.toTraceString(indent + 4));
                }else{
                    s+=(this.trace +'\n').indent(indent+4);
                }
            }
            return s;
        };

        ///The name of the Exception.
        publ.name;//todo is that needed?
        ///The error message.
        publ.message;
        ///The module the Exception belongs to.
        publ.module=mod;
        ///The error which caused the Exception or undefined.
        publ.trace;
    });
        
    /**
        Creates an HTTP request object for retreiving files.
        @return HTTP request object.
    **/
    mod.getHTTPRequestObject=function() {
        var obj;
        try{ //to get the mozilla httprequest object
            obj = new XMLHttpRequest();
        }catch(e){
            try{ //to get MS HTTP request object
                obj=new ActiveXObject("Msxml2.XMLHTTP.4.0");
            }catch(e){
                try{ //to get MS HTTP request object
                    obj=new ActiveXObject("Msxml2.XMLHTTP");
                }catch(e){
                    try{// to get the old MS HTTP request object
                        obj = new ActiveXObject("microsoft.XMLHTTP");
                    }catch(e){
                        throw new mod.Exception("Unable to get an HTTP request object.");
                    }
                }
            }
        }
        return obj;
    };
        
    /**
        Thrown when a file could not be loaded.
    **/
    mod.LoadURIFailed=Class(mod.Exception, function(publ, priv,supr){
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
    
    /**
        Retrieves data given its URI.
        @param uri             The uri to load.
        @param headers=[]  The headers to use.
        @return                 The content of the file.
    **/
    mod.loadURI=function(uri, headers){
        headers = (headers !== undefined) ? headers : [];
        try{
            var xmlhttp = mod.getHTTPRequestObject();
            xmlhttp.open("GET", uri, false);
            for(var i=0;i< headers.length;i++){
                xmlhttp.setRequestHeader(headers[i][0], headers[i][1]);
            }
            xmlhttp.send("");
        }catch(e){
            throw new mod.LoadURIFailed(uri, e);
        }
        //todo: the status checking needs testing
        if(xmlhttp.status == 200 || xmlhttp.status == 0 || xmlhttp.status == null || xmlhttp.status == 304){
            var s= str(xmlhttp.responseText);
            return s;
        }else{
             throw new mod.LoadURIFailed(uri, new mod.Exception("Server did not respond with status code 200 but with: " + xmlhttp.status));
        }
    };

    
    /**
        Returns the possible locations of a module's source file.
        A module's source file location is determined by treating each module name as a directory.
        Only the last one is assumed to point to a file.
        
    **/
    mod.getSearchURIsForModuleName=function(name){
        var sourceURI;
        
        var searchURIs = [];
        
        if(mod.moduleSourceURIs[name] != undefined){
            searchURIs.push(mod.moduleSourceURIs[name].format(mod));
        }else{
            name = name.split('.');
            if(name.length>1){
                if(mod.moduleSourceURIs[name[0]] != undefined){
                    var uri = mod.moduleSourceURIs[name[0]].format(mod);
                    searchURIs.push("%s/%s.js".format(uri, name.slice(1).join('/')));
                }
                searchURIs.push("%s/%s.js".format(mod.packagesURI.format(mod),name.join('/')));
            }
            
            for(var i=0;i<mod.moduleSearchURIs.length; i++){
                searchURIs.push("%s/%s.js".format(mod.moduleSearchURIs[i].format(mod), name.join("/")));
            }
            name =  name.join(".");
        }
        return searchURIs;
    };
    
    /**
        Thrown when a module could not be found.
    **/
    mod.LoadModuleFailed=Class(mod.Exception, function(publ, priv, supr){
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
    
    /**
       Loads a module given its name(someModule.someSubModule).
       jsolait.getSearchURIsForModuleName() will be used to determine the possible locations for the source of the module.
      
       @param name   The name of the module to load.
       @return           The module object.
    **/
    mod.loadModule = function(name){

        if(mod.modules[name]){ //module already loaded
            return mod.modules[name];
        }else{
            var src,sourceURI;
            var searchURIs = mod.getSearchURIsForModuleName(name);
            var failedURIs=[];
            for(var i=0;i<searchURIs.length;i++){
                try{
                    sourceURI = searchURIs[i];
                    src = mod.loadURI(sourceURI);
                    break;
                }catch(e){
                    failedURIs.push(e.sourceURI);
                }
            }
            if(src == null){
                throw new mod.LoadModuleFailed(name, failedURIs);
            }else{
                try{//interpret the script
                    var m = mod.createModuleFromSource(name, src, sourceURI);
                    return m;
                }catch(e){
                    throw new mod.LoadModuleFailed(name, [sourceURI], e);
                }
            }
        }
    };
           
    mod.__imprt__ = function(name, attachTo){
        var n=name.replace(/\s/g,"").split(":");
        name = n[0];
        if(n.length>1){
            var items = n[1].split(",");
        }else{
            var items=[];
        }
        
        var m = mod.loadModule(name);
        
        if(items.length > 0){
            if(items[0] == '*'){
                for(var key in m){
                    if(key.slice(0,2) != "__" && attachTo[key] == undefined){
                        attachTo[key] = m[key];
                    }
                }
            }else{
                for(var i=0;i<items.length;i++){
                    attachTo[items[i]] = m[items[i]];
                }
            }
        }else{
            var finalModuleName=name.split('.');
            finalModuleName=finalModuleName.pop();
            attachTo[finalModuleName] = m;
        }
    };
    
    var StringsOrCommentsOrImprt=/(\/\*([\n\r]|.)*?\*\/)|(\/\/.*)|('(\\'|.)*?')|("(\\"|.)*?")|\b(imprt\(.*?\))/g;
    var ImprtStatement=/^imprt\(['"](.*?)['"]\)$/;
    
    mod.getModuleDependenciesFromSource=function(source){
        
        var imprtStatements=[];
        var items=str(source).match(StringsOrCommentsOrImprt);
        if(items){
            for(var i=0;i<items.length;i++){
                var item = items[i];
                var imprtStatement=item.match(ImprtStatement);
                if(imprtStatement){
                    imprtStatements.push(imprtStatement[1]);
                }
            }
        }
        return imprtStatements;
    };
    
    mod.ModuleClass=Class(function(publ,priv,supr){
        publ.__name__;
        publ.__version__;
        publ.__source__;
        publ.__sourceURI__;
        
        publ.__init__=function(name, source, sourceURI){
            this.__name__=name;
            this.__version__="0.0.0";
            this.__source__ = source;
            this.__sourceURI__ = sourceURI;
            this.Exception = Class(mod.Exception, new Function());
            this.Exception.prototype.module = this;
        };
        
        publ.__str__=function(){
            //todo:SVN adaption
            return "[module '%s' version: %s]".format(this.__name__, (this.__version__+'').replace(/\$Revision:\s(\d+) \$/, "Rev.$1"));
        };
    });
    
    mod.CreateModuleFailed=Class(mod.Exception, function(publ, priv, supr){
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
        publ.failedModule;
        
        publ.__str___=function(){
            return str(this.failedModule);
        
        }
    });
    
    mod.createModule=function(name, source, sourceURI, modFn){
        var newMod = new mod.ModuleClass(name, source, sourceURI);
        
        try{//to run the module source
            modFn.call(newMod, newMod);
        }catch(e){
            throw new mod.CreateModuleFailed(newMod, e);
        }
        
        applyNames(newMod);
       
        mod.modules[name] = newMod;
        return newMod;
    };
    
    mod.createModuleFromSource=function(name, source, sourceURI){
        var newMod = new mod.ModuleClass(name, source, sourceURI);
            
        var deps=mod.getModuleDependenciesFromSource(source);
        
        var locals={
            str:str,
            repr:repr,
            id:id,
            bind:bind,
            isinstance:isinstance,
            issubclass:issubclass,
            Class:Class
        };
        
        for(var i=0;i<deps.length;i++){
            mod.__imprt__(deps[i], locals);
        }
            
        var argNames = ['mod', 'imprt', 'jsolait'];
        var args = [];
        
        args.push(newMod);
        args.push(new Function("",""));
        args.push(mod);
                
        for(var key in locals){
            argNames.push(key);
            args.push(locals[key]);
        }               

        var modFn = new Function(argNames.join(","), source);
            
        try{//to run the module source
            modFn.apply(newMod, args);
        }catch(e){
            throw new mod.CreateModuleFailed(newMod, e);
        }
        
        applyNames(newMod);
        mod.modules[name] = newMod;
        return newMod;
    };     
    
    mod.Module = function(name, modFn){
        return mod.createModule(name, str(modFn), '', modFn);
    };
    
    var applyNames=function(container){
        for(var n in container){
            var obj = container[n];
            if(typeof obj == 'function'){
                obj.__name__ = n;
            }
        }
    };


//---------------------------------------------------String Format -------------------------------------------------------
    /**
        Creates a format specifier object.
    **/
    var FormatSpecifier=function(s){
        var s = s.match(/%(\(\w+\)){0,1}([ 0-]){0,1}(\+){0,1}(\d+){0,1}(\.\d+){0,1}(.)/);
        if(s[1]){
            this.key=s[1].slice(1,-1);
        }else{
            this.key = null;
        }
        this.paddingFlag = s[2];
        if(this.paddingFlag==""){
            this.paddingFlag =" ";
        }
        this.signed=(s[3] == "+");
        this.minLength = parseInt(s[4]);
        if(isNaN(this.minLength)){
            this.minLength=0;
        }
        if(s[5]){
            this.percision = parseInt(s[5].slice(1,s[5].length));
        }else{
            this.percision=-1;
        }
        this.type = s[6];
    };
    
    var pad=function(s, flag, len){
        if(flag == "-"){
            var c = " ";
        }else{
            var c ='' + flag;
        }
        var rslt = c.mul(len-s.length);
        
        if(flag == "-"){
            rslt = s + rslt;
        }else{
            rslt += s;
        }
        return rslt;
    };

    /**
        Formats a string replacing formatting specifiers with values provided as arguments
        which are formatted according to the specifier.
        This is an implementation of  python's % operator for strings and is similar to sprintf from C.
        Usage:
            resultString = formatString.format(value1, v2, ...);

        Each formatString can contain any number of formatting specifiers which are
        replaced with the formated values.

        specifier([...]-items are optional):
            "%[(key)][flag][sign][min][percision]typeOfValue"

            (key)  If specified the 1st argument is treated as an object/associative array and the formating values
                     are retrieved from that object using the key.

            flag:
                0      Use 0s for padding.
                -      Left justify result, padding it with spaces.
                        Use spaces for padding.
            sign:
                +      Numeric values will contain a +|- infront of the number.
            min:
                l      The string will be padded with the padding character until it has a minimum length of l.
            percision:
               .x     Where x is the percision for floating point numbers and the lenght for 0 padding for integers.
            typeOfValue:
                d   Signed integer decimal.
                i   Signed integer decimal.
                b   Unsigned binary.                       //This does not exist in python!
                o   Unsigned octal.
                u   Unsigned decimal.
                x   Unsigned hexidecimal (lowercase).
                X   Unsigned hexidecimal (uppercase).
                e   Floating point exponential format (lowercase).
                E   Floating point exponential format (uppercase).
                f   Floating point decimal format.
                F   Floating point decimal format.
                c   Single character (accepts byte or single character string).
                s   String (converts any object using object.toString()).
        Examples:
            "%02d".format(8) == "08"
            "%05.2f".format(1.234) == "01.23"
            "123 in binary is: %08b".format(123) == "123 in binary is: 01111011"

        @param *  Each parameter is treated as a formating value.
        @return The formated String.
    **/
    String.prototype.format=function(){
        var sf = this.match(/(%(\(\w+\)){0,1}[ 0-]{0,1}(\+){0,1}(\d+){0,1}(\.\d+){0,1}[dibouxXeEfFgGcrs%])|([^%]+)/g);
        if(sf){
            if(sf.join("") != this){
                throw new mod.Exception("Unsupported formating string.");
            }
        }else{
            throw new mod.Exception("Unsupported formating string.");
        }
        var rslt="";
        var s;
        var obj;
        var cnt=0;
        var frmt;
        var sign="";

        for(var i=0;i<sf.length;i++){
            s=sf[i];
            if(s == "%%"){
                s = "%";
            }else if(s=="%s"){ //making %s faster
                if(cnt>=arguments.length){
                    throw new mod.Exception("Not enough arguments for format string.");
                }else{
                    obj=arguments[cnt];
                    cnt++;
                }
                if (obj === null){
                    obj = "null";
                }else if(obj===undefined){
                    obj = "undefined";
                }
                s=obj.toString();
            }else if(s.slice(0,1) == "%"){
                frmt = new FormatSpecifier(s);//get the formating object
                if(frmt.key){//an object was given as formating value
                    if((typeof arguments[0]) == "object" && arguments.length == 1){
                        obj = arguments[0][frmt.key];
                    }else{
                        throw new mod.Exception("Object or associative array expected as formating value.");
                    }
                }else{//get the current value
                    if(cnt>=arguments.length){
                        throw new mod.Exception("Not enough arguments for format string.");
                    }else{
                        obj=arguments[cnt];
                        cnt++;
                    }
                }

                if(frmt.type == "s"){//String
                    if (obj === null){
                        obj = "null";
                    }else if(obj===undefined){
                        obj = "undefined";
                    }
                    s=pad(obj.toString(), frmt.paddingFlag, frmt.minLength);

                }else if(frmt.type == "c"){//Character
                    if(frmt.paddingFlag == "0"){
                        frmt.paddingFlag=" ";//padding only spaces
                    }
                    if(typeof obj == "number"){//get the character code
                        s = pad(String.fromCharCode(obj), frmt.paddingFlag , frmt.minLength);
                    }else if(typeof obj == "string"){
                        if(obj.length == 1){//make sure it's a single character
                            s=pad(obj, frmt.paddingFlag, frmt.minLength);
                        }else{
                            throw new mod.Exception("Character of length 1 required.");
                        }
                    }else{
                        throw new mod.Exception("Character or Byte required.");
                    }
                }else if(typeof obj == "number"){
                    //get sign of the number
                    if(obj < 0){
                        obj = -obj;
                        sign = "-"; //negative signs are always needed
                    }else if(frmt.signed){
                        sign = "+"; // if sign is always wanted add it
                    }else{
                        sign = "";
                    }
                    //do percision padding and number conversions
                    switch(frmt.type){
                        case "f": //floats
                        case "F":
                            if(frmt.percision > -1){
                                s = obj.toFixed(frmt.percision).toString();
                            }else{
                                s = obj.toString();
                            }
                            break;
                        case "E"://exponential
                        case "e":
                            if(frmt.percision > -1){
                                s = obj.toExponential(frmt.percision);
                            }else{
                                s = obj.toExponential();
                            }
                            s = s.replace("e", frmt.type);
                            break;
                        case "b"://binary
                            s = obj.toString(2);
                            s = pad(s, "0", frmt.percision);
                            break;
                        case "o"://octal
                            s = obj.toString(8);
                            s = pad(s, "0", frmt.percision);
                            break;
                        case "x"://hexadecimal
                            s = obj.toString(16).toLowerCase();
                            s = pad(s,"0", frmt.percision);
                            break;
                        case "X"://hexadecimal
                            s = obj.toString(16).toUpperCase();
                            s = pad(s,"0", frmt.percision);
                            break;
                        default://integers
                            s = parseInt(obj).toString();
                            s = pad(s, "0", frmt.percision);
                            break;
                    }
                    if(frmt.paddingFlag == "0"){//do 0-padding
                        //make sure that the length of the possible sign is not ignored
                        s=pad(s, "0", frmt.minLength - sign.length);
                    }
                    s=sign + s;//add sign
                    s=pad(s, frmt.paddingFlag, frmt.minLength);//do padding and justifiing
                }else{
                    throw new mod.Exception("Number required.");
                }
            }
            rslt += s;
        }
        return rslt;
    };

    /**
        Padds a String with a character to have a minimum length.

        @param flag   "-":      to padd with " " and left justify the string.
                            Other: the character to use for padding.
        @param len    The minimum length of the resulting string.
    **/
    String.prototype.pad = function(flag, len){
        
        if(flag == "-"){
            var c = " ";
        }else{
            var c ='' + flag;
        }
        var s = c.mul(len-this.length);
        
        if(flag == "-"){
            s = this + s;
        }else{
            s += this;
        }
        return s;
    };
    
    /**
        Indents each line of a String.
        @param indent   The number of spaces to use for indention.
        @return The indented string.
    **/
    String.prototype.indent=function(indent){
        var out=[];
        var s=this.split('\n');
        for(var i=0;i<s.length;i++){
            out.push(' '.mul(indent) + s[i]);
        }
        return out.join('\n');
    };
    
    /**
        Multiplies a string.
        @param l The multiplier.
        @return A string.
    **/
    String.prototype.mul=function(l){
        l = (l < 0 )? 0: l;
        var a=new Array(l+1);
        return a.join(this);
    };
    
    applyNames(mod);
    
    return mod;
}({}));
