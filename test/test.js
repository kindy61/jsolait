__version__ ="$Revision: 44 $";

var moduleNames=['testing','core','sets','itertools','codecs','crypto','urllib', 'jsonrpc','xmlrpc'];

mod.log=function(){
    print.apply(null, arguments);
};

mod.test=function(logger){
    for(var i=0;i<moduleNames.length;i++){
        var modName= 'test_' + moduleNames[i];
           
        try{
            var m = jsolait.loadModule(modName);
            m.test(logger);
        }catch(e){
            logger.log(e);
            //throw(e)
        }
    }
};

mod.__main__=function(){
    mod.test(mod);
};    

