__version__ = "$Revision: 44 $";

imprt("testing");

publ.test=function( logger){
    logger.log("testing testing ...");
    
    testing.assert(true);
    
    testing.assertTrue(true);
    
    testing.assertFalse(false);
    
    testing.assertNull(null);
    testing.assertNotNull(undefined);
    testing.assertNotNull('');
    testing.assertNotNull({});
    testing.assertNotNull(0);
    
    testing.assertUndefined(undefined);
    
    testing.assertNotUndefined(null);
    
    testing.assertNaN(NaN);
    
    testing.assertNotNaN(435);
    
    testing.assertEquals(1,1);
    testing.assertEquals("a","a");
    testing.assertEquals(null,null);
    testing.assertEquals(undefined,undefined);
    testing.assertEquals(publ,publ);
    testing.assertEquals([1,2,3], [1,2,3]);
    
    testing.assertNotEquals(1,2);
    testing.assertNotEquals("1",1);
    testing.assertNotEquals("1",1);
    testing.assertNotEquals("", false);
    testing.assertNotEquals(null, undefined);
    testing.assertNotEquals([1,2,3], [2,3]);
    
    
    testing.assertIs(publ,publ);
    testing.assertIs(null,null);
    testing.assertIs(undefined,undefined);
    testing.assertIs("ab","ab");
    testing.assertIs(123,123);
    var a=b=[123];
    testing.assertIs(a,b);
    var a=b={};
    testing.assertIs(a,b);
    
    testing.assertIsNot(null,undefined);
    testing.assertIsNot(publ,{});
    testing.assertIsNot([123],[123]);
    testing.assertIsNot({},{});
    
};

publ.__main__=function(){
    test({log:print})
};    
