__version__ = "$Revision: 44 $";
imprt("testing");
imprt('strings')

publ.test=function( logger){
   
    logger.log("testing strings");
    
    var tmpl =str( jsolait.loadURI(__sourceURI__.slice(0,-2) + "txt"));
    testing.assertNotEquals("template loading", tmpl, "");
   
    var rslt = tmpl.exec({name:"test", b:2});
    testing.assertEquals("template result", rslt, "Template (test) run at Thu Jan 1 00:00:00 UTC 1970\n\n    loop 0\n\n    loop 1\n\n    loop 2\n\n    loop 3\n\n    loop 4\n\n    loop 5\n\n    loop 6\n\n    loop 7\n\n    loop 8\n\n    loop 9\n\n------------\n\n     b is set ? > <?\n     foo\n\n------------\n0,1,2,3,4,5,6,7,8,9,\n-----------\n")
           
    
    var a = ["jsolait 1","jsolait 11", "jsolait 2"];
    a.sort(strings.naturalCompare);
    testing.assertEquals("natural compare", a.join(", "), "jsolait 1, jsolait 2, jsolait 11");
};

publ.__main__=function(){
    test({log:print})
};
