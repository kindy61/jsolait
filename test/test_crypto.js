__version__ = "$Revision: 44 $";

imprt("testing");
imprt('crypto');
imprt('codecs');

publ.test=function(logger){
    
    logger.log("testing crypto ...");
    
    
    testing.assertEquals('encoders', crypto.listEncrypters(), ['xor','rc4']);
    testing.assertEquals('decoders', crypto.listDecrypters(), ['xor','rc4']);
    
    var key= "abcdefg1234567890";
    
    var s='';
    for(var i=0;i<256;i++){
        s +=String.fromCharCode(i);
    }
    testing.assertEquals('encrypt("xor")', s.encrypt("xor", key).encode("base64"), "YWNhZ2FjYTY6Oj4+Ojo2NiBwcHBwcHBwKSspLykrKScZEUNBR0FDQU8YGBgYGBgYCAgCUlZWUlJeXgsJDwkLCXd5e3MlJyUjLS8ten5+enpmZmpqZDQ0NDw8PDxtb21rVVdVW11VBwULDQ8NC1xcXERERERMTEYWGhoeHhoaT02ztbe1s72/t+nr6e/p6+m+oqKmpqKirq6o+Pj4+Pj4+JGTkZeRk5GfkZnLyc/Jy8nXgICAgICAgICAitre3trapqbz8ffx8/H/8fP7ra+tq7W3teLm5uLi7u7i4uy8vLyEhISE1dfV093f3dPV3Y+Nk5WXlZPExMTMzMzMxMTOng==");
    testing.assertEquals('encrypt("rc4")', s.encrypt("rc4", key).encode("base64"), "KYNkxjTbYmI0cqwd/IOCw56wFR7fhio6xn3xprldajko6/Mw13Vou0h1x80+1KiI06/aRYF0Be+sjirI1ILCTVVFJCa+YzpMa8EhdAiAvlTCZp5FE/sCyvkIAIQ6fjUtGrPnEAPJYYhU+nPq9pDch4A2nZEIcbH8sLFU2ygI61DrPeNlTkEEdqNYl0NtLucBsTsWDJT163jSAaIu48k86e/G+yOru/fxcz+YS5AE5iadak24hZvSTrDFGQ6aHtNmGzJQecihB3Ltv7zl9zzvDNP+fUpPcdgnCQYus0z63TlCmC3SnmfeQ3Aly7+dpABl0ocBZv5M21zcxWqgwbTyzQ==");
    
    testing.assertEquals('decrypt("xor")', "YWNhZ2FjYTY6Oj4+Ojo2NiBwcHBwcHBwKSspLykrKScZEUNBR0FDQU8YGBgYGBgYCAgCUlZWUlJeXgsJDwkLCXd5e3MlJyUjLS8ten5+enpmZmpqZDQ0NDw8PDxtb21rVVdVW11VBwULDQ8NC1xcXERERERMTEYWGhoeHhoaT02ztbe1s72/t+nr6e/p6+m+oqKmpqKirq6o+Pj4+Pj4+JGTkZeRk5GfkZnLyc/Jy8nXgICAgICAgICAitre3trapqbz8ffx8/H/8fP7ra+tq7W3teLm5uLi7u7i4uy8vLyEhISE1dfV093f3dPV3Y+Nk5WXlZPExMTMzMzMxMTOng==".decode("base64").decrypt("xor", key), s);
    testing.assertEquals('decrypt("rc4")', "KYNkxjTbYmI0cqwd/IOCw56wFR7fhio6xn3xprldajko6/Mw13Vou0h1x80+1KiI06/aRYF0Be+sjirI1ILCTVVFJCa+YzpMa8EhdAiAvlTCZp5FE/sCyvkIAIQ6fjUtGrPnEAPJYYhU+nPq9pDch4A2nZEIcbH8sLFU2ygI61DrPeNlTkEEdqNYl0NtLucBsTsWDJT163jSAaIu48k86e/G+yOru/fxcz+YS5AE5iadak24hZvSTrDFGQ6aHtNmGzJQecihB3Ltv7zl9zzvDNP+fUpPcdgnCQYus0z63TlCmC3SnmfeQ3Aly7+dpABl0ocBZv5M21zcxWqgwbTyzQ==".decode("base64").decrypt("rc4", key), s);
};

publ.__main__=function(){
    test({log:print})
};
