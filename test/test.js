__version__ ="$Revision: 44 $";

var moduleNames=['testing','core','sets','itertools','codecs','crypto','urllib', 'jsonrpc','xmlrpc'];

publ.log=function(){
    print.apply(null, arguments);
};

publ.test=function(logger){
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

publ.__main__=function(){
    test(publ);
};    

