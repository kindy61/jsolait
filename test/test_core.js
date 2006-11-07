__version__ = "$Revision: 44 $";

import testing;

def test(logger){
    logger.log("testing core String methods ...");
    
    testing.assertEquals("%s", "...%s...".format("abc"), "...abc...");
    testing.assertEquals("%s", "...%s...".format(123), "...123...");
    testing.assertEquals("%s", "...%s...".format(123.456), "...123.456...");
    testing.assertEquals("%s", "...%s...".format([1,2,3]), "..." + [1,2,3] + "...");
    testing.assertEquals("%s", "...%s...".format({}), "..." + {} + "...");
    testing.assertEquals("%s", "...%%s...".format("abc"), "...%s...");
    
    testing.assertEquals("%()s", "...%(a)s...%(b)s...".format({a:12, b:'cdef'}), "...12...cdef...");
    
    testing.assertEquals("%d", "...%d...".format(1234), "...1234...");
    testing.assertEquals("%010d", "...%010d...".format(1234), "...0000001234...");
    testing.assertEquals("%-10d", "...%-10d...".format(1234), "...1234      ...");
    
    
    testing.assertEquals("%f", "...%f...".format(12.34), "...12.34...");
    testing.assertEquals("%09.3f", "...%09.3f...".format(12.3456789), "...00012.346...");
    testing.assertEquals("%F", "...%F...".format(12.3456789), "...12.3456789...");
    
    testing.assertEquals("%b", "...%b...".format(123456), "...11110001001000000...");
    
    testing.assertEquals("%o", "...%o...".format(123456), "...361100...");
    
    testing.assertEquals("%u", "...%u...".format(-12.3456), "...-12...");
    
    testing.assertEquals("%x", "...%x...".format(-0x12345abcdef), "...-12345abcdef...");
    testing.assertEquals("%x", "...%x...".format(0x12345abcdef), "...12345abcdef...");
    testing.assertEquals("%X", "...%X...".format(-0x12345abcdef), "...-12345ABCDEF...");
    testing.assertEquals("%X", "...%X...".format(0x12345abcdef), "...12345ABCDEF...");
    
    testing.assertEquals("%e", "...%e...".format(12.34e56), "...1.234e+57...");
    testing.assertEquals("%E", "...%0.1E...".format(12.34E-56), "...1.2E-55...");
    
    testing.assertEquals("%c", "...%c...".format(100), "...d...");
    testing.assertEquals("%c", "...%c...".format('a'), "...a...");
    
    
    testing.assertEquals("String::indent()", " abcde\n fghij".indent(4), "     abcde\n     fghij");
    testing.assertEquals("String::mul()", "abc".mul(4), "abcabcabcabc");
    
    logger.log("testing core functions ...");
    
    testing.assertEquals("repr(String)", repr("Hello JSON, '\" \\  \n \t \r"), '"Hello JSON, \'\\" \\\\  \\n 	 \\r"'); 
    testing.assertEquals("repr([])", repr([1,2,3,4,5]), '[1,2,3,4,5]'); 
    testing.assertEquals("repr(123)", repr(1234), '1234'); 
    testing.assertEquals("repr({a:1, b:'123', ...)", repr({a:1, b:'b', c:[1,2,3]}), '{"a":1,"b":"b","c":[1,2,3]}'); 
    
    
    testing.assertEquals("id()", id("a"), "$a");
    testing.assertEquals("id()", id("$a"), "$$a");
    testing.assertEquals("id()", id(123), "#123");
    testing.assertEquals("id()", id(mod), __id__);
    
    
    testing.assertTrue("isinstance('a', String)", isinstance("a", String))
    testing.assertTrue("isinstance([], Array)", isinstance([], Array))
    testing.assertTrue("isinstance(1, Number)", isinstance(1, Number))
    
    var f = bind({x:1}, function(){
        return this.x;
    });
    testing.assertEquals("testing bind()", {f:f, x:123}.f(), 1);
    
    var C=Class(Array, function(publ,priv,supr){});
    testing.assertEquals("Array subclassing", new C(1,2,3), [1,2,3]);
    
    var C=Class(function(publ,priv,supr){
        publ __call__(){
            return this;
        }
    });
    var o = new C();
    testing.assertEquals("callable()", o(), o);
    
    //testing.assertEquals("jsolait.loadURI()", str(jsolait.loadURI(__sourceURI__.slice(0,-2) + "txt")), "test\n");
};

def __main__(){
    test({log:print})
};
