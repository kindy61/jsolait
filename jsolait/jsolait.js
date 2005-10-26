/*
    Copyright (c) 2003-2005 Jan-Klaas Kollhof
    
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
    It provides the core functionalities  for creating classes, modules and for importing modules.
    
    @version 2.0
    $LastChangedBy$
    $Date$
    $Revision$
**/


/**
    Creates a new class object which inherits from superClass.
    @param name="anonymous"  The name of the new class.
                                            If the created class is a public member of a module then 
                                            the __name__ property of that class is automatically set by Module().
    @param superClass=Object    The class to inherit from (super class).
    @param mixinClass(*)           The mixin classes.
    @param classScope(-1)        A function which is executed for class construction.
                                            As 1st parameter it will get the new class' protptype for 
                                            overrideing or extending the super class. As 2nd parameter it will get
                                            the super class' wrapper for calling inherited methods.
**/
Class=function(name, superClass, mixinClass, classScope){
    var args=[];
    for(var i=0;i<arguments.length;i++){
        args[i] = arguments[i];
    }
    //last arg should be a classScope
    classScope = args.pop();
    
    //first arg is the class' name if it is a string
    if((args.length>0) && (typeof args[0] =='string')){
        name=args.shift();
    }else{
        name="anonymous";
    }
    //the next arg should be the superclass
    if(args.length > 0){
        superClass = args.shift();
    }else{
        superClass = Object;
    }
    var mixinClasses=args;
    
    //this is the constructor for the new objects created from the new class.
    //if and only if it is NOT used for prototyping/subclassing the __init__ method of the newly created object will be called.
//todo: this breaks mozilla's implementation of instanceof which returns true for every jsolait object and any jsolait class
//a workaround would be using new Function    
    var NewClass = function(calledBy){
        if(calledBy !== Class){
            //simulate Array and Function subclassing
            if(NewClass.prototype instanceof Array || NewClass.prototype instanceof Function){
                var rslt;
                if(NewClass.prototype instanceof Array){
                    rslt=[];
                }else{
                    rslt = function(){
                        return rslt.__call__.apply(rslt, arguments);
                    };
                }
                //transfer all properties defined in teh class to the new object(as it is empty)
                for(var n in NewClass.prototype){
                    rslt[n] = NewClass.prototype[n];
                }
                //these props are not copied in the above loop
                rslt.constructor = NewClass;
                rslt.toString = NewClass.prototype.toString;
                    
                rslt.__init__.apply(rslt,arguments);
                return rslt;
            }else{
                //todo should a constructor be able to return something?
                this.__init__.apply(this, arguments);
            }
        }
    };
    //This will create a new prototype object of the new class.
    NewClass.__createProto__ = function(){
        return new NewClass(Class);
    };
    //setting class properties for the new class.
    NewClass.__super__ = superClass;
    NewClass.__name__= name; 
    NewClass.toString = function(){
        return "[class %s]".format(NewClass.__name__);
    };
    
   //see if the super class can create prototypes. (creating an object without calling __init__())
    if(superClass.__createProto__!==undefined){
        NewClass.prototype = superClass.__createProto__();
    }else{//just create an object of the super class
        NewClass.prototype = new superClass();
    }
    //reset the constructor for new objects to the actual constructor.
    NewClass.prototype.constructor = NewClass;
    
    
    //make sure the new class has an __init__ method if it inherits from Object, Array or Function
    switch(superClass){
        case Object:
            NewClass.prototype.__init__=function(){};    
            NewClass.prototype.toString = function(){
                return "[object %s]".format(this.constructor.__name__);
            };
            //todo
            NewClass.prototype.__hash__=function(){
                if(this.__id__==null){
                    this.__id__ = '#auto#' +  Class.hashCount++
                }
                return this.__id__;
            };
            break;
        case Array:
            //immitate a call to new Array()
            NewClass.prototype.__init__=function(){
                if (arguments.length==0){
                }else if(arguments.lengt==1){
                    this.length=arguments[0];
                }else{
                    for(var i=0;i<arguments.length;i++){
                        this.push(arguments[i]);
                    }
                }
            };    
            break;
        case Function:
            //Subclasses of Function do not impl. Function's default behavior
            //as this would not make much sense, we allow subclassing of functions so people can create callable objects
            NewClass.prototype.__init__=function(){};
            //needs to be overwritten by users
            NewClass.prototype.__call__=function(){};
            NewClass.prototype.toString=function(){
                return "[callable %s]".format(this.constructor.__name__);
                //todo: return Function.prototype.toString.call(this);
            };
            break;
    }
    
    //mixin classes overwrite props/methods of the new class
    for(var i=0;i<mixinClasses.length;i++){
        var mixin = mixinClasses[i].prototype;
        for(var n in mixin){
            if(n != "__init__"){
                NewClass.prototype[n] = mixin[n];
            }
        }
    }
    
    //execute the scope of the class
    switch(classScope.length){
        case 3: //publ, statc, supr  
            classScope(NewClass.prototype, NewClass, superClass.prototype);
            break;
        default://publ, supr
            classScope(NewClass.prototype, superClass.prototype);
            break;
    }
    
    return NewClass;
};    
Class.hashCount=0;
Class.toString = function(){
    return "[object Class]";
};

Class.__createProto__=function(){ 
    throw "Can't use Class as a super class.";
};


/**
    Creates a new module and registers it.
    @param name              The name of the module.
    @param version            The version of a module.
    @param moduleScope    A function which is executed for module creation.
                                     As 1st parameter it will get the module variable.                          
                                     The imported modules(imports) will be passed to the moduleScope starting with the 2nd parameter.
**/
Module=function(name, version, moduleScope){
    var newMod = {};
    newMod.name = name;
    newMod.version = version;
    newMod.__sourceURI__ = Module.currentURI;
    
    newMod.toString=function(){
        //todo:SVN adaption
        return "[module '%s' version: %s]".format(this.name, this.version);
    };

    //give a module it's own exception class which makes debugging easier
    newMod.Exception=Class(Module.Exception, function(publ, supr){
        publ.module = newMod;
    });
    
    try{//to execute the scope of the module
        moduleScope.call(newMod, newMod);
    }catch(e){
        throw new Module.ModuleScopeExecFailed(newMod, e);
    }
    
    //set __name__  for methods and classes
    for(var n in newMod){
        var obj = newMod[n];
        if(typeof obj == 'function'){
            obj.__name__ = n;
        }
    }
    jsolait.registerModule(newMod);
    return newMod;
};

Module.toString=function(){
    return "[object Module]";
};

Module.__createProto__=function(){ 
    throw "Can't use Module as a super class.";
};

    
/**
    Base class for all module-Exceptions.
    This class should not be instaciated directly but rather
    use the exception that is part of the module.
**/
Module.Exception=Class("Exception", function(publ){
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
    
    
    publ.toString=function(){
        var s = "%s %s".format(this.name, this.module);
        return s;
    };
    /**
        Returns the complete trace of the exception.
        @return The error trace.
    **/
    publ.toTraceString=function(indent){
        indent = indent==null ? 0 : indent;
        
        //todo:use  constructor.__name__
        var s="%s in %s:\n%s".format(this.name, this.module, this.message.indent(4)).indent(indent);
        if(this.trace){
            if(this.trace.toTraceString){
                s+='\n\n'+ this.trace.toTraceString(indent + 8);
            }else{
                s+=(this.trace +'\n').indent(indent);
            }
        }
        return s;
    };
    
   
    
    ///The name of the Exception.
    publ.name;//todo is that needed?
    ///The error message.
    publ.message;
    ///The module the Exception belongs to.
    publ.module="jsolait";
    ///The error which caused the Exception or undefined.
    publ.trace;      
});

/**
    Thrown if a module scope could not be run.
**/
Module.ModuleScopeExecFailed=Class("ModuleScopeExecFailed", Module.Exception, function(publ, supr){
    /**
        Initializes a new ModuleScopeExecFailed Exception.
        @param module      The module.
        @param trace      The error cousing this Exception.
    **/
    publ.__init__=function(module, trace){
        supr.__init__.call(this, "Failed to run the module scope for %s".format(module), trace);
        this.failedModule = module;
    };
    ///The module that could not be createed.
    publ.module;
});
 
    
/**
    
    @author                 Jan-Klaas Kollhof
    @lastchangedby       $LastChangedBy$
    @lastchangeddate    $Date$
**/
Module("jsolait", "$Revision$", function(mod){
    jsolait=mod;
    mod.modules={};
            
    ///The paths of  the modules that come with jsolait.
    mod.knownModuleURIs={codecs:"%(baseURI)s/lib/codecs.js",
                                    crypto:"%(baseURI)s/lib/crypto.js",
                                    dom:"%(baseURI)s/lib/dom.js",
                                    forms:"%(baseURI)s/lib/forms.js",
                                    iter:"%(baseURI)s/lib/iter.js",
                                    jsonrpc:"%(baseURI)s/lib/jsonrpc.js",
                                    lang:"%(baseURI)s/lib/lang.js",
                                    sets:"%(baseURI)s/lib/sets.js",
                                    testing:"%(baseURI)s/lib/testing.js",
                                    urllib:"%(baseURI)s/lib/urllib.js",
                                    xml:"%(baseURI)s/lib/xml.js",
                                    xmlrpc:"%(baseURI)s/lib/xmlrpc.js"};
    
    ///The base URIs to search for modules in. They may contain StringFormating symbols e.g '%(baseURI)s/lib'
    mod.moduleSearchURIs = [".", "%(baseURI)s/lib"];
    
    ///The location where jsolait is installed.
    mod.baseURI = "./jsolait";
    
    /**
        Creates an HTTP request object for retreiving files.
        @return HTTP request object.
    */
    var getHTTP=function() {
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
        Retrieves a file given its URL.
        @param uri             The uri to load.
        @param headers=[]  The headers to use.
        @return                 The content of the file.
    */
    mod.loadURI=function(uri, headers) {
        //if callback is defined then the operation is done async
        headers = (headers !== undefined) ? headers : [];
        //setup the request
        try{
            var xmlhttp= getHTTP();
            xmlhttp.open("GET", uri, false);
            for(var i=0;i< headers.length;i++){
                xmlhttp.setRequestHeader(headers[i][0], headers[i][1]);    
            }
            xmlhttp.send("");
        }catch(e){
            throw new mod.LoadURIFailed(uri, e);
        }
        if(xmlhttp.status == 200 || xmlhttp.status == 0){
            var s= new String(xmlhttp.responseText);
            s.__sourceURI__ = uri;
            return s;
        }else{
             throw new mod.LoadURIFailed(uri,new mod.Exception("Server did not respond with 200"));
        }
    };
    
    /**
        Thrown when a file could not be loaded.
    **/
    mod.LoadURIFailed=Class(mod.Exception, function(publ, supr){
        /**
            Initializes a new LoadURIFailed Exception.
            @param name      The name of the module.
            @param sourceURI  The uri jsolait tried to load the file from
            @param trace      The error cousing this Exception.
        **/
        publ.__init__=function(sourceURI, trace){
            supr.__init__.call(this, "Failed to load file: '%s'".format(sourceURI), trace);
            this.sourceURI = sourceURI;
        };
        ///The path paths jsolait tried to load the file from.
        publ.sourceURI;
    });
    
    
     /**
       Imports a module given its name(someModule.someSubModule).
       A module's file location is determined by treating each module name as a directory.
       Only the last one is assumed to point to a file.
       If the module's URL is not known (i.e the module name was not found in jsolait.knownModuleURIs) 
       then it will be searched using all URIs found in jsolait.moduleSearchURIs.
       @param name   The name of the module to load.
       @return           The module object.
    */
    mod.__imprt__ = function(name){

        if(mod.modules[name]){ //module already loaded
            return mod.modules[name];
        }else{
            var src,modPath;
            //check if jsolait already knows the path of the module
            if(mod.knownModuleURIs[name] != undefined){
                modPath = mod.knownModuleURIs[name].format(mod);
                try{//to load the source of the module
                    src = mod.loadURI(modPath);
                }catch(e){
                    throw new mod.ImportFailed(name, [modPath], e);
                }
            }
            
            if(src == null){//go through the search paths and try loading the module
                var failedURIs=[];
                for(var i=0;i<mod.moduleSearchURIs.length; i++){
                    modPath = "%s/%s.js".format(mod.moduleSearchURIs[i].format(mod), name.split(".").join("/"));
                    try{
                        src = mod.loadURI(modPath);
                        break;
                    }catch(e){
                        failedURIs.push(e.sourceURI);
                    }
                }
                if(src == null){
                    throw new mod.ImportFailed(name, failedURIs);
                }
            }
                        
            try{//interpret the script
                src = 'Module.currentURI="%s";\n%s\nModule.currentURI=null;\n'.format(src.__sourceURI__.replace(/\\/g, '\\\\'), src);
                var f=new Function("",src); //todo should it use globalEval ?
                f();
            }catch(e){
                throw new mod.ImportFailed(name, [src.__sourceURI__], e);
            }
            
            return mod.modules[name]; 
        }
    };
    
    
    /**
        Thrown when a module could not be found.
    **/
    mod.ImportFailed=Class(mod.Exception, function(publ, supr){
        /**
            Initializes a new ImportFailed Exception.
            @param name      The name of the module.
            @param moduleURIs A list of paths jsolait tried to load the modules from
            @param trace      The error cousing this Exception.
        **/
        publ.__init__=function(moduleName, moduleURIs, trace){
            supr.__init__.call(this, "Failed to import module: '%s' from:\n%s".format(moduleName, moduleURIs.join(',\n')), trace);
            this.moduleName = moduleName;
            this.moduleURIs = moduleURIs;
        };
        ///The  name of the module that was not found.
        publ.moduleName;
        ///The URIs or a list of paths jsolait tried to load the modules from.
        publ.moduleURIs;
    });
    
    /**
        Imports a module given its name.
        Modules must have registered themselfes before they can be imported.
        @param name   The name of the module to load.
        @return           The module object.
    **/
    imprt = function(name){
        return mod.__imprt__(name);
    };
    
    mod.__registerModule__=function(modObj, modName){
        if(modName != 'jsolait'){
            return mod.modules[modName] = modObj;
        }
    };
       
    mod.registerModule=function(modObj, modName){
        modName = modName===undefined?modObj.name : modName;
        return mod.__registerModule__(modObj, modName);
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
                    s=obj.toString().pad(frmt.paddingFlag, frmt.minLength);
                    
                }else if(frmt.type == "c"){//Character
                    if(frmt.paddingFlag == "0"){
                        frmt.paddingFlag=" ";//padding only spaces
                    }
                    if(typeof obj == "number"){//get the character code
                        s = String.fromCharCode(obj).pad(frmt.paddingFlag , frmt.minLength) ;
                    }else if(typeof obj == "string"){
                        if(obj.length == 1){//make sure it's a single character
                            s=obj.pad(frmt.paddingFlag, frmt.minLength);
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
                            s = s.pad("0", frmt.percision);
                            break;
                        case "o"://octal
                            s = obj.toString(8);
                            s = s.pad("0", frmt.percision);
                            break;
                        case "x"://hexadecimal
                            s = obj.toString(16).toLowerCase();
                            s = s.pad("0", frmt.percision);
                            break;
                        case "X"://hexadecimal
                            s = obj.toString(16).toUpperCase();
                            s = s.pad("0", frmt.percision);
                            break;
                        default://integers
                            s = parseInt(obj).toString();
                            s = s.pad("0", frmt.percision);
                            break;
                    }
                    if(frmt.paddingFlag == "0"){//do 0-padding
                        //make sure that the length of the possible sign is not ignored
                        s=s.pad("0", frmt.minLength - sign.length);
                    }
                    s=sign + s;//add sign
                    s=s.pad(frmt.paddingFlag, frmt.minLength);//do padding and justifiing
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
        var s = "";
        if(flag == "-"){
            var c = " ";
        }else{
            var c = flag;
        }
        for(var i=0;i<len-this.length;i++){
            s += c;
        }
        if(flag == "-"){
            s = this + s;
        }else{
            s += this;
        }
        return s;
    };
    
    String.prototype.indent=function(indent){
        var out=[];
        var s=this.split('\n');
        for(var i=0;i<s.length;i++){
            var pr='';
            for(var k=0;k<indent;k++){
                pr +=' ';
            }  
            out.push(pr + s[i]);
        }
        return out.join('\n');
    };
    
    ///Tests the module.
    mod.test=function(){
        
    };
});


