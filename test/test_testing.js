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
        testing.assertEquals(1,1);
        testing.assertEquals("a","a");
        testing.assertEquals(null,null);
        testing.assertEquals(undefined,undefined);
        testing.assertEquals(mod,mod);
        testing.assertIs(mod,mod);
        testing.assertNotEquals(1,2);
        testing.assertNotEquals(mod,{});
        testing.assertIsNot(null,undefined);
        testing.assertIsNot(mod,{});
    
    };
});
