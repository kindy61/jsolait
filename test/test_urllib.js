Module("test_urllib", "0.0.1", function(mod){
    
    mod.test=function(testing,logger){
        logger.log("testing urllib ...");
        var urllib = imprt('urllib');
        testing.assertTrue("urllib usable", urllib.isUsable());
        
        var resp = urllib.getURL("http://jsolait.net/download/404.txt");
        testing.assertEquals(resp.status, 404)
        
        var resp = urllib.getURL("http://jsolait.net/download/test.txt");
        testing.assertEquals(resp.responseText, "test")
        
    };
    mod.__main__=function(){
        mod.test(imprt('testing'), {log:print});
    };
});
