__version__ = "$Revision: 44 $";

import testing;
import urllib;

publ test(logger){
    logger.log("testing urllib ...");
    testing.assertTrue("urllib usable", urllib.isUsable());
    
    var resp = urllib.getURL("http://jsolait.net/download/404.txt");
    testing.assertEquals(resp.status, 404)
    
    var resp = urllib.getURL("http://jsolait.net/download/test.txt");
    testing.assertEquals(resp.responseText, "test")
    
};
publ __main__(){
    test({log:print});
};
