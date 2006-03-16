Module("test", "$Revision: 44 $", function(mod){
    
    var moduleNames=['testing','core','sets','iter','codecs','crypto','urllib', 'jsonrpc','xmlrpc'];

    mod.log=function(){
        print.apply(null, arguments);
    };
    
    mod.test=function(t, logger){
            
        for(var i=0;i<moduleNames.length;i++){
            var modName= 'test_' + moduleNames[i];
        
            var m = imprt(modName);
            try{
                m.test(t, logger);
            }catch(e){
                logger.log(e);
                throw(e)
            }
        }
    };
    
    mod.__main__=function(){
        var testing = imprt("testing");
        mod.test(testing, mod);
    };    

});
