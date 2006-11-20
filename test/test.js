__version__ ="$Revision: 44 $";

var moduleNames=['testing','core','sets','itertools','codecs','crypto','urllib', 'jsonrpc','xmlrpc'];

publ log(){
    print.apply(null, arguments);
};

publ test(logger){
        

    var step=function(i){
        var modName= 'test_' + moduleNames[i];
        logger.log('loading', modName)
        jsolait.loadModule(modName, function(m,err){
            if(err){
                logger.log(err);
            }else{
                try{
                    m.test(logger);
                }catch(e){
                    logger.log(e);
                }
            }
            if(i<moduleNames.length-1){
                step(i+1);
            }
        });
    }
    
    step(0);
        
    
};

publ __main__(){
    test(mod);
};    

