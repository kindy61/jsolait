__version__ = "$Revision: 44 $";

imprt("testing");
imprt('jsonrpc');

mod.test=function(logger){
    
    logger.log("testing jsonrpc ...");
    var s = new jsonrpc.ServiceProxy("http://jsolait.net/services/test.jsonrpc",["echo"]);
    
    var o = [1.234, 5, {a:"Hello ' \" World", b:[12,3]}, "{ [ "];
    
    testing.assertEquals(jsonrpc.marshall(o),'[1.234, 5, {"a": "Hello \' \\" World", "b": [12, 3]}, "{ [ "]');
    var r = s.echo(o);
    testing.assertEquals(jsonrpc.marshall(r), '[1.234, 5, {"a": "Hello \' \\" World", "b": [12, 3]}, "{ [ "]');
};

mod.__main__=function(){
    mod.test({log:print});
};

