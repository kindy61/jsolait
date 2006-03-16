Module("test_testing", "0.0.1", function(mod){
    mod.test=function(testing, logger){
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
        testing.assertEquals(mod,mod);
        testing.assertEquals([1,2,3], [1,2,3]);
        
        testing.assertNotEquals(1,2);
        testing.assertNotEquals("1",1);
        testing.assertNotEquals("1",1);
        testing.assertNotEquals("", false);
        testing.assertNotEquals(null, undefined);
        testing.assertNotEquals([1,2,3], [2,3]);
        
        
        testing.assertIs(mod,mod);
        testing.assertIs(null,null);
        testing.assertIs(undefined,undefined);
        testing.assertIs("ab","ab");
        testing.assertIs(123,123);
        var a=b=[123];
        testing.assertIs(a,b);
        var a=b={};
        testing.assertIs(a,b);
        
        testing.assertIsNot(null,undefined);
        testing.assertIsNot(mod,{});
        testing.assertIsNot([123],[123]);
        testing.assertIsNot({},{});
        
    };
    
    mod.__main__=function(){
        mod.test(imprt('testing'), {log:print})
    };    
});
