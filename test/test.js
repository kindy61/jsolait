__version__ ="$Revision: 44 $";

var moduleNames=['testing','core','sets','itertools','codecs','crypto','urllib', 'jsonrpc','xmlrpc'];

def log(){
    print.apply(null, arguments);
};

def test(logger){
        

    var step=function(i){
        var modName= 'test_' + moduleNames[i];
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

def __main__(){
    test(mod);
};    

