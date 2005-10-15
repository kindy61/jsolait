/*
    Copyright (c) 2005 Jan-Klaas Kollhof
    
*/
/**
    
    @author                  Jan-Klaas Kollhof
    @created                2005-03-25    
    @lastchangedby       $LastChangedBy$
    @lastchangeddate    $Date$
**/
Module("jsolaitws", "$Revision$", function(mod){
    var fs= new ActiveXObject("Scripting.FileSystemObject");
    var wshShell= new ActiveXObject("WScript.Shell");
    var ForReading = 1, ForWriting = 2;
    
    //overwrite the module loader
    jsolait.modules.moduleLoader=mod;
    
    ///The location where jsolait is installed.
    mod.installPath = fs.getParentFolderName(WScript.scriptFullName);
    
     ///The paths to search for modules
    mod.moduleSearchPaths = [fs.buildPath(fs.getParentFolderName(WScript.scriptFullName),"lib"),
                                        fs.buildPath(fs.getParentFolderName(WScript.scriptFullName),"libws")];
    
       
    mod.ImportFailed=Class(jsolait.ImportFailed, function(publ, supr){
    });
    
    jsolait.imprt=function(modName){
        if(jsolait.modules[modName] != null){
            return jsolait.modules[modName];
        }
        
        //treat module names starting with 'ax?.'  as names for ActiveX objects
        if(modName.slice(0,4) == "axc."){
            //treat an ActiveXObject as an object which can be cached like a module
            var axName = modName.slice(5);
            try{
                var modObj = new ActiveXObject(axName);
            }catch(e){
                throw mod.ActiveXObjectCreationFailed(axName, e);
            }
            jsolait.registerModule(modObj, modName);
        }else if(modName.slice(0,3) == "ax."){
            //treat an ActiveXObject as an object which should NOT be cached like a module
            var axName = modName.slice(3);
            try{
                return new ActiveXObject(axName);
            }catch(e){
                throw mod.ActiveXObjectCreationFailed(axName, e);
            }
        }else{//try to load a module from a script file. 
            var mpath=modName.replace(/\./g,"\\") +".js";
            for(var i=0;i<mod.moduleSearchPaths.length;i++){
                var mp = fs.buildPath(mod.moduleSearchPaths[i], mpath);
                if(fs.fileExists(mp)){
                    mod.loadScript(mp);
                    i=mod.moduleSearchPaths.length;//exit the loop
                }
            }
        }
            
        try{
            return jsolait.__import__(modName);
        }catch(e){
            throw new mod.ImportFailed(modName, e);
        }
    }

    mod.ScriptLoadingFailed=Class(mod.Exception, function(publ, supr){
        publ.__init__=function(path, trace){
            supr(this).__init__("%s(1,1) failed to load.".format(path) , trace);
            this.path=path;
        }
        ///The path of the file that failed to load.
        publ.path="";
    })  
    
    mod.loadScript=function(path){
        try{
            var f = fs.GetFile(path);
            var src = f.OpenAsTextStream(ForReading).readall();
            var pse = Module.preScopeExecution;
            Module.preScopeExecution = function(mod){
                mod.__fileName__ = path;
            };
            globalEval(src);
            Module.preScopeExecution=pse;
        }catch(e){
            Module.preScopeExecution=pse;
            throw new mod.ScriptLoadingFailed(path, e);
        }
    }
      
    mod.loadSource=function(path){
        try{
            var f = fs.GetFile(path);
            var src = f.OpenAsTextStream(ForReading).readall();
            var pse = Module.preScopeExecution;
            Module.preScopeExecution = function(mod){
                mod.__fileName__ = path;
            };
            return src;
        }catch(e){
            Module.preScopeExecution=pse;
            throw new mod.ScriptLoadingFailed(path, e);
        }
    }
    
    mod.run=function(){
        mod.__fileName__ = WScript.scriptFullName;
        jsolait.__fileName__ = WScript.scriptFullName.slice(0,-3) + "js";
        
        if (WScript.arguments.unnamed.length==0){
            WScript.Arguments.ShowUsage();                                              
            return;
        }else{
            var fileName=fs.getAbsolutePathName(WScript.arguments.unnamed.item(0));
            //todo:check if file exists
        }
        
        //get the base of the file to execute
        var fileBase= fs.getParentFolderName(fileName);
        //make sure the search path is updated to include the fileBase
        mod.moduleSearchPaths.push(fileBase);
        
        //change working dir to the file's location
        //todo:is it OK to change cwd?
        wshShell.currentDirectory = fileBase;
        
        
        if(WScript.arguments.named.exists("compile")){
            var lang = imprt('lang');
            
            var s = mod.loadSource(fileName);
            var p = new lang.Parser(s);
                
            try{
                p.parseStatements(p.next());
            }catch(e){
                var l=p.getPosition();
                throw fileName + '(' + (l[0] ) + ',' +l[1] + ') ' +   e + ' near:\n' + p._working.slice(0,200);
            } 

        }else{
  
            try{//load the script if it is not the main jsolait or jsolaitws module that has already been loaded.
                if(fileName.toLowerCase() != jsolait.__fileName__.toLowerCase()  &&
                            fileName.toLowerCase() != mod.__fileName__.toLowerCase()){
                    mod.loadScript(fileName);
                }
            }catch(e){
                log(e);
                return;
            }
            
            
            if(WScript.arguments.named.exists("testModule")){
                //if the script was loaded correctly and it contained a module then 
                //that module should have a __filename__ property which matches fileName
                //and is teh one that needs to be tested
                for(var mn in jsolait.modules){
                    if(jsolait.modules[mn].__fileName__.toLowerCase() == fileName.toLowerCase()){
                        var testing = jsolait.imprt("testing");
                        testing.testModule(mn);        
                        return;
                    }
                }
                throw "No Module found";
            }
        }
    }
    
    ///Tests the module.
    mod.test=function(){
    }
})

