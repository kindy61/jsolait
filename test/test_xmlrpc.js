__version__ = "$Revision: 44 $";

imprt("testing");
imprt('xmlrpc');

mod.test=function(logger){
    
    logger.log("testing xmlrpc ...");
    var s = new xmlrpc.ServiceProxy("http://jsolait.net/services/test.xmlrpc");
    
    var o = [{a:"Hello ' \" World < & >", b:[1,2,3]}, true, false, new Date(0)];
    
    testing.assertEquals(xmlrpc.marshall(o), "<array><data><value><struct><member><name>a</name><value><string>Hello ' \" World &lt; &amp; ></string></value></member><member><name>b</name><value><array><data><value><int>1</int></value><value><int>2</int></value><value><int>3</int></value></data></array></value></member></struct></value><value><boolean>1</boolean></value><value><boolean>0</boolean></value><value><dateTime.iso8601>19700101T00:00:00:000</dateTime.iso8601></value></data></array>");
    var r = s.echo(o);
    testing.assertEquals(xmlrpc.marshall(r), "<array><data><value><struct><member><name>a</name><value><string>Hello ' \" World &lt; &amp; ></string></value></member><member><name>b</name><value><array><data><value><int>1</int></value><value><int>2</int></value><value><int>3</int></value></data></array></value></member></struct></value><value><boolean>1</boolean></value><value><boolean>0</boolean></value><value><dateTime.iso8601>19700101T00:00:00:000</dateTime.iso8601></value></data></array>");
};

mod.__main__=function(){
    mod.test({log:print});
};

