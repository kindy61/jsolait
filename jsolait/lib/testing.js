/*
    Copyright (c) 2005 Jan-Klaas Kollhof
      
    This file is part of jsolait
    
    jsolait is free software; you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation; either version 2.1 of the License, or
    (at your option) any later version.
    
    This software is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    
    You should have received a copy of the GNU Lesser General Public License
    along with this software; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
   
*/
/**
    
    @author                 Jan-Klaas Kollhof
    @created                2003-12-14    
    @lastchangedby       $LastChangedBy: Jan-Klaas Kollhof $
    @lastchangeddate    $Date: 2005-09-14 22:56:56 +0100 (Wed, 14 Sep 2005) $
**/

Module("testing", "$Revision: 53 $", function(mod){
    
    /**
        Returns the average time used for executing a function.
        @param repeat   How often the function should be executed.
        @param fn         The function to execute.
        @param ...         The rest of the parameters are sent to the function as arguments.
    */
    mod.timeExec=function(repeat, fn){
        var args = [];
        for(var i=2;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var t=(new Date()).getTime();
        for(var i=0;i<=repeat;i++){
            fn.apply(null, args);    
        }
        return ((new Date()).getTime()-t) / (repeat+1);
    }
    
    
    mod.testModule=function(modName){
        var t=(new Date()).getTime();
        log("Starting module test");
        log("importing '%s' for testing ...".format(modName));
        try{
            var m = jsolait.imprt(modName);
        }catch(e){
            log(e);
            log("Premeture exiting of module test because importing of '%s' failed.".format(modName), LogError);
            return;
        }
        
        if(m.test==null){
            log("Premeture exiting of module test because %s does not expose a 'test()' method.".format(m), LogError); 
            return;
        }
        log("%s imported, running '%s.test()' ...".format(m,modName)); 
        try{
            m.test(mod);
        }catch(e){
            log(e+"");
            log("Premeture exiting of module test due to an error running '%s.test()'".format(modName), LogError);
            return;
        }
        var t= (new Date()).getTime()-t ; 
        log("Testing of module '%s' completed in %s ms.".format(modName, t < 1? "< 1":t)) ;
    
    }
    
    mod.objectKeys=function(obj){
        var keys=[];
        for(var n in obj){
            keys.push(n)
        }
        return keys;
    }
})
