mod.__version__ = "$Revision: 44 $";

imprt("testing");
imprt('urllib')

mod.test=function(logger){
    logger.log("testing urllib ...");
    testing.assertTrue("urllib usable", urllib.isUsable());
    
    var resp = urllib.getURL("http://jsolait.net/download/404.txt");
    testing.assertEquals(resp.status, 404)
    
    var resp = urllib.getURL("http://jsolait.net/download/test.txt");
    testing.assertEquals(resp.responseText, "test")
    
};
mod.__main__=function(){
    mod.test({log:print});
};
