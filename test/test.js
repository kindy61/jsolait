Module("test", "0.0.1", function(mod){
    
    var moduleNames=['async','codecs','crypto','dom','forms','iter','jsonrpc','lang','operators','sets','strings','testing','urllib','xml','xmlrpc', 'net.sockets'];

    mod.log=function(){
        print.apply(null, arguments);
    };
    
    mod.test=function(t, logger){
            
        for(var i=0;i<moduleNames.length;i++){
            var modName= 'test_' + moduleNames[i];
            try{
                var m = imprt(modName);
                try{
                    m.test(t, logger);
                }catch(e){
                    logger.log(e);
                }
            }catch(e){
            }
        }
    };
    
    mod.__main__=function(){
        var testing = imprt("testing");
        mod.test(testing, mod);
    };    

});
