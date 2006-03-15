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
    @lastchangedby       $LastChangedBy$
    @lastchangeddate    $Date$
**/

Module("testing", "$Revision$", function(mod){

    var ops=imprt('operators');

    mod.minProfileTime=500;
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
    };


    /**
        Messures the time it takes to run a function given as a parameter.
        @param min=mod.minProfileTime  The minimum time to use for profiling.
        @param fn                              The function to profile. The function wil be called until the min-time is reached.
        @return                                  The time it took to run the function a single time. The time is averaged by the total time/repetitions
    **/
    mod.profile=function(min,fn){
        if(arguments.length==1){
            fn=min;
            min=mod.minProfileTime;
        }
        var args = [];
        for(var i=2;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var cnt=0;
        var t1=(new Date()).getTime();
        t2=t1;
        while(t2-t1<min){
            cnt++;
            fn.apply(null, args);
            t2=(new Date()).getTime();
        }
        return (t2-t1) / cnt;
    };

    /**
        Provides a test task.
    **/
    mod.Test=Class(function(publ,supr){
        publ.__init__=function(name, testScope){
            if(testScope === undefined){
                testScope=name;
                name = 'anonymous';
            }
            this.name = name;
            this.testScope=testScope;
        };

        /**
            Runs the test and generates a report.
        **/
        publ.run=function(){
            this.failed=false;
            this.error=null;
            this.startTime=(new Date()).getTime();
            try{
                this.testScope();
            }catch(e){
                if(e.constructor == mod.AssertFailed){
                    this.error = e;
                    this.failed=true;
                }else{
                    throw new mod.Exception("Failed to run test.", e);
                }
            }
            this.endTime=(new Date()).getTime();
            this.duration=this.endTime-this.startTime;
        };

        /**
            Returns a report about the test run.
        **/
        publ.report=function(){
            if(this.error){
                return "Test '%s' has failed after %s ms due to:\n\n%s".format(this.name, this.duration, this.error.toTraceString().indent(4));
            }else{
                return "Test '%s' completed in %s ms".format( this.name, this.duration);
            }
        };
        publ.failed=false;
        publ.error;
        publ.startTime;
        publ.endTime;
        publ.duration;
    });

    /**
        Runs a test on the given function.
        @param name='anonymous' The name for the test.
        @param testScope  A function to test.
    **/
    mod.test=function(name, testScope){
        if(arguments.length == 1){
            testScope = name;
            name = 'anonymous';
        }
        var t= new mod.Test(name, testScope);
        t.run();
        return t.report();
    };

    /**
        Raised when an assertion fails.
    **/
    mod.AssertFailed=Class(mod.Exception, function(publ,supr){
        publ.__init__=function(comment, failMsg){
            this.failMessage = failMsg;
            this.comment = comment;
            supr.__init__.call(this, "%s failed: %s".format(comment, failMsg));
        };
    });

    /**
        Basic assert method.
        @param comment=''  A comment for the assertion.
        @param value          A boolean to testfor true.
        @param failMsg=''     A message to pass to the AssertFailed constructor in case the assertion fails.
    **/
    mod.assert=function(comment, value, failMsg){
        if(typeof comment == 'boolean'){
            failMsg=value;
            value = comment;
            comment ='';
        }

        if(value!==true){
            throw new mod.AssertFailed(comment, failMsg===undefined ? "Expected true but found: %s".format(value) : failMsg);
        }
    };

    /**
        Assert for true;
        @param comment=''  A comment for the assertion.
        @param value          A boolean to test.
    **/
    mod.assertTrue=function(comment, value){
        if(arguments.length==1){
            value = comment;
            comment ='';
        }
        mod.assert(comment, value===true, "Expected true but found: %s".format(value));
    };

    /**
        Assert for false;
        @param comment=''  A comment for the assertion.
        @param value          A boolean to test.
    **/
    mod.assertFalse=function(comment, value){
        if(arguments.length==1){
            value = comment;
            comment ='';
        }
        mod.assert(comment, value===false, "Expected false but found: %s".format(value));
    };

    /**
        Assert for 2 values being equal;
        @param comment=''  A comment for the assertion.
        @param value          A boolean to test.
    **/
    mod.assertEquals=function(comment, value1, value2){
        if(arguments.length==2){
            value2=value1;
            value1 = comment;
            comment ='';
        }
        mod.assert(comment, ops.eq(value1, value2), "Expected %s == %s.".format(value1, value2));
    };
        
    mod.assertNotEquals=function(comment, value1, value2){
        if(arguments.length==2){
            value2=value1;
            value1 = comment;
            comment ='';
        }
        mod.assert(comment, ops.ne(value1, value2), "Expected %s != %s.".format(value1, value2));
    };

    mod.assertIs=function(comment, value1, value2){
        if(arguments.length==2){
            value2=value1;
            value1 = comment;
            comment ='';
        }
        mod.assert(comment, ops.is(value1, value2), "Expected %s === %s.".format(value1, value2));
    };
        
    mod.assertIsNot=function(comment, value1, value2){
        if(arguments.length==2){
            value2=value1;
            value1 = comment;
            comment ='';
        }
        mod.assert(comment, ops.isnot(value1, value2), "Expected %s !== %s.".format(value1, value2));
    };
    
    mod.assertNull=function(comment, value){
        if(arguments.length==1){
            value = comment;
            comment ='';
        }
        mod.assert(comment, value===null, "Expected %s === null.".format(value));
    };

    mod.assertNotNull=function(comment, value){
        if(arguments.length==1){
            value = comment;
            comment ='';
        }
        mod.assert(comment, value !==null, "Expected %s !== null.".format(value));
    };

    mod.assertUndefined=function(comment, value){
        if(arguments.length==1){
            value = comment;
            comment ='';
        }
        mod.assert(comment, value===undefined, "Expected %s === undefined.".format(value));
    };

    mod.assertNotUndefined=function(comment, value){
        if(arguments.length==1){
            value = comment;
            comment ='';
        }
        mod.assert(comment, value!==undefined, "Expected %s !== undefined".format(value));
    };

    mod.assertNaN=function(comment, value){
        if(arguments.length==1){
            value = comment;
            comment ='';
        }
        mod.assert(comment, isNaN(value)===true, "Expected %s === NaN.".format(value));
    };

    mod.assertNotNaN=function(comment, value){
        if(arguments.length==1){
            value = comment;
            comment ='';
        }
        mod.assert(comment, isNaN(value)!==true, "Expected %s !== NaN".format(value));
    };

    mod.fail=function(comment){
        throw new mod.AssertFailed(comment, "Fail was called");
    };

    mod.objectKeys=function(obj){
        var keys=[];
        for(var n in obj){
            keys.push(n);
        }
        return keys;
    }; 

});


