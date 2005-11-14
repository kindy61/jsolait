/*
  Copyright (c) 2004 Jan-Klaas Kollhof
 
  This is free software; you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation; either version 2 of the License, or
  (at your option) any later version.
 
  This software is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
 
  You should have received a copy of the GNU General Public License
  along with this software; if not, write to the Free Software
  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 
*/

/**
    Iterator module providing iteration services.
    There is one global function iter() which can be used to iterate over iterable objects synchronously or
    if given a callback asynchronously.
    An iterable object is an object which has an iterator function (__iter__) which returns an Iterator object.
    
    The Range class is there to create an iterable object over a range of numbers.
    
    @creator                 Jan-Klaas Kollhof
    @created                2004-12-08
    @lastchangedby       $LastChangedBy$
    @lastchangeddate    $Date$
*/
Module("iter", "$Revision$", function(mod){
        
    /**
        Base class for Iterators.
    */
    mod.Iterator=Class(function(publ, supr){
        /**
            Returns the next item in the iteration.
            If there is no item left it throws StopIteration
        */
        publ.next=function(){
            return undefined;
        };
        /**
            Used so an Iterator can be passed to iteration functions.
        */
        publ.__iter__ = function(){
            return this;
        };
    });
    
    /**
        A simple range class to iterate over a range of numbers.
    */
    mod.Range =Class(mod.Iterator, function(publ, supr){
        /**
            Initializes a new range.
            @param start=0  The first item in the range.
            @param end       The last item in the range.
            @param step=1 The steps between each Item.
        */
        publ.__init__=function(start, end, step){
            switch(arguments.length){
                case 1:
                    this.start = 0;
                    this.end = start;
                    this.step = 1;
                    break;
                case 2:
                    this.start = start;
                    this.end = end;
                    this.step =1;
                    break;
                default:
                    this.start = start;
                    this.end = end;
                    this.step = step;
                    break;
            }
            this.current=this.start - this.step;
        };
        
        publ.next = function(){
            if(this.current + this.step > this.end){
                this.current=this.start;
                return undefined;
            }else{
                this.current = this.current + this.step;
                return this.current;
            }
        };
        
    });
    
    Range = mod.Range;
    
    /**
        Iterator for Arrays.
    */
    mod.ArrayItereator=Class(mod.Iterator, function(publ, supr){
        publ.__init__=function(array){
            this.array = array;
            this.index = -1;
        };
        publ.next = function(){
            this.index += 1;
            if(this.index >= this.array.length){
                return undefined;
            }else{
                return this.array[this.index];
            }
        };
    });
    
    /**
        Iterator for Objects.
    */
    mod.ObjectIterator=Class(mod.Iterator, function(publ, supr){
        publ.__init__=function(obj){
            this.obj = obj;
            this.keys=[];
            for(var n in obj){
                this.keys.push(n);
            }
            
            this.index = -1;
        };
        
        publ.next = function(){
            this.index += 1;
            if(this.index >= this.keys.length){
                return undefined;
            }else{
                var key=this.keys[this.index];
                var rslt = {key:key};
                try{
                    rslt.value = this.obj[key];
                }catch(e){
                }
                return rslt;
            }
        };
    });
    
    Array.prototype.__iter__ = function(){
        return new mod.ArrayItereator(this);
    };
        
    /**
        Interface of a IterationCallback.
        @param item The item returned by the iterator for the current step.
        @param iteration The Iteration object handling the iteration.
    */
    mod.IterationCallback = function(item, iteration){};
    
    /**
        Iteration class for handling iteration steps and callbacks.
    */
    mod.Iteration = Class(function(publ,supr){
        /**
            Initializes an Iteration object.
            @param iterable An itaratable object.
            @param thisObj
            @param callback An IterationCallback object.
        */
        publ.__init__=function(iterable, thisObj, callback){
            this.doStop = false;
            this.thisObj=thisObj;
            if(iterable.__iter__ !==undefined){
                this.iterator = iterable.__iter__();
            }else{
                this.iterator = new mod.ObjectIterator(iterable);
            }
            
            this.callback = callback;
        };
        
        ///Resumes a stoped iteration.
        publ.resume = function(){
            this.doStop = false;
            var item;
            while(!this.doStop){
                item=this.iterator.next();
                if(item === undefined){
                    this.stop();
                }else{
                    //let the callback handle the item
                    this.callback.call(this.thisObj==null?this : this.thisObj,  item, this);
                }
            }
        };
        
        ///Stops an iteration
        publ.stop = function(){
            this.doStop = true;
        };
        
        ///Starts/resumes an iteration        
        publ.start = function(){
            this.resume();
        };
    });
    
    /**
        Class for handling asynchronous iterations.
    */
    mod.AsyncIteration = Class(mod.Iteration, function(publ, supr){
        /**
            Initializes an AsyncIteration object.
            @param iterable An itaratable object.
            @param interval The time in ms betwen each step.
            @param thisObj 
            @param callback An IterationCallback object.
        */
        publ.__init__=function(iterable, interval, thisObj, callback){
            this.doStop = false;
            this.thisObj=thisObj;
            if(iterable.__iter__ !==undefined){
                this.iterator = iterable.__iter__();
            }else{
                this.iterator = new mod.ObjectIterator(iterable);
            }
            this.interval = interval;
            this.callback = callback;
            this.isRunning = false;
        };
        
        publ.stop=function(){
            if(this.isRunning){
                this.isRunning = false;
                clearTimeout(this.timeout);    
                delete iter.iterations[this.id];
            }
        };
        
        publ.resume = function(){
            if(this.isRunning == false){
                this.isRunning = true;
                var id=0;//find unused id
                while(iter.iterations[id]!==undefined){
                    this.id++;
                }
                this.id = "" + id;
                iter.iterations[this.id] = this;
                //let the iteration be handled using a timer
                this.timeout = setTimeout("iter.handleAsyncStep('" + this.id + "')", this.interval);
            }
        };
    
        publ.handleAsyncStep = function(){
            if(this.isRunning){
                tem=this.iterator.next();
                if(item === undefined){
                    this.stop();
                }else{
                    //let the callback handle the item
                    this.callback.call(this.thisObj==null?this : this.thisObj,  item, this);
                    this.timeout = setTimeout("iter.handleAsyncStep('" + this.id + "')", this.interval);
                }
            }
        };
    });
    
    
    /**
        Iterates over an iterable object and calls a callback for each item.
        @param iterable          The iterable object.
        @param delay=-1         If delay >-1 specifies the time between each iteration step and creates a ansync iteration.
        @param thisObj=return The this object to use when calling the callback.
        @param cb                  An IterationCallback object to call for each step.
        @return         An Iteration object.
    */
    iter = function(iterable, delay, thisObj, cb){
        cb=arguments[arguments.length-1];
        if((arguments.length == 3) && (typeof delay =='object')){
            thisObj=delay;
            delay=-1;
        }else{
            thisObj=null;
        }
        if(delay >-1){
            var it = new mod.AsyncIteration(iterable, delay, thisObj, cb);      
        }else{
            var it = new mod.Iteration(iterable, thisObj, cb);
        }
        it.start();
        return it;
    };
    
    iter.handleAsyncStep = function(id){
        if(iter.iterations[id]){
           iter.iterations[id].handleAsyncStep();
        }
    };
    ///Helper object containing all async. iteration objects.
    iter.iterations = {};
      
    
    mod.__main__=function(){
        
        
        var  testing = imprt('testing');
        var task=function(){
            var s='';
            for(var i=0;i<10;i++){
                s+=i;
            }
        };
        
        r = [];
        for(var i=0;i<100;i++){
            r[i] = i;
        }
                       
        print("for loop \t\t\t" + testing.timeExec(100,function(){
            var s='';
            for(var i=0;i<100;i++){
                s+=r[i];
                task();
            }
        }));
        
        print("Range iter \t\t" + testing.timeExec(100,function(){
            var s='';
            iter(new mod.Range(100), function(item,i){
                s+=r[item];
                task();
            });
        }));
        
        print("Array iter \t\t\t" + testing.timeExec(100,function(){
            var s='';
            iter(r , function(item,i){
                s+=item;
                task();
            });
            
        }));
        
        print("for in on Array \t\t" + testing.timeExec(100,function(){
            var s='';
            for(var i in r){
                s+=r[i];
                task();
            }
        }));
        
        r = [];
        for(var i=0;i<100;i++){
            r["k"+i] = i;
        }
        
        print("for in  on as.Array \t" + testing.timeExec(100,function(){
            var s='';
            for(var i in r){
                s+=r[i];
                task();
            }
        }));
        
        r = {};
        for(var i=0;i<100;i++){
            r["k"+i] = i;
        }
        
        print("for in on dictionary \t" + testing.timeExec(100,function(){
            var s='';
            for(var i in r){
                s+=r[i];
                task();
            }
        }));
        
        r = [];
        for(var i=0;i<100;i++){
            r[i] = i;
        }
        
        print("for on Array + iter \t" + testing.timeExec(100,function(){
            var s='';
            for(i=r.__iter__(); item=i.next() !==undefined;){
                s+= item;
                task();
            }
        }));
    };
});
