__version__ = "$Revision: 81 $"


var fs= new ActiveXObject("Scripting.FileSystemObject");

var wshShell= new ActiveXObject("WScript.Shell");
var ForReading = 1, ForWriting = 2;


publ run(finishedCB){
    
    if (WScript.arguments.unnamed.length==0){
        WScript.Arguments.ShowUsage();                                              
        return;
    }else{
        //var fileName=fs.getAbsolutePathName(WScript.arguments.unnamed.item(0));
        var fileName=WScript.arguments.unnamed.item(0);
        //todo:check if file exists
    }
    
    //get the base of the file to execute
    var fileBase= fs.getParentFolderName(fileName);
    //make sure the search path is updated to include the fileBase
    jsolait.moduleSearchURIs = [fileBase].concat(jsolait.moduleSearchURIs);
    
    //change working dir to the file's location
    //todo:is it OK to change cwd?
    if(fileBase.slice(0, 'file://'.length) == 'file://'){
        wshShell.currentDirectory = fileBase.slice('file://'.length);
    }

    if(fileName.toLowerCase() != jsolait.__sourceURI__.toLowerCase()){
        jsolait.moduleSourceURIs['__main__']=fileName;
        jsolait.loadModule('__main__', function(modl, err){
            if(err){
                finishedCB(err);
            }else{
                try{
                    var tmain =typeof(modl.__main__);
                }catch(e){
                    var tmain="";
                }
                
                if(tmain=='function'){
                    //todo find arguments
                    if(WScript.arguments.named.exists("script-args")){
                        var args = WScript.arguments.named.Item("script-args");
                        switch(args.slice(0,1)){
                            case "{": case "'":  case "[":  case '"':
                                break;
                            default:
                                args = jsolait.repr(args);
                        }
                        f=new Function( "return " + args);
                        args = [f()];
                    }else{
                        var args =[];
                    }
                    
                    try{
                        modl.__main__.apply(modl, args);
                        finishedCB(null);
                    }catch(e){
                        finishedCB( new Exception("runing %s  __main__()  failed\n".format(modl),e));
                    }
                }else{
                    finishedCB();
                }
            }
        }); 
    }else{
        finishedCB(new Exception("Don't try runing the jsolait core module!"));
    }
};
