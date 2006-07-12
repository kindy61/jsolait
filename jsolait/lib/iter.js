/*
  Copyright (c) 2004-2006 Jan-Klaas Kollhof

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
    Iteration module providing functionality for working with iterable objects.
    
    To enable any object to be iterable the module introduces a number of iteration protocolls
    and provides default implementation for it.
    
    For an object to be iterable it must provide an __iter__() method that returns an Iterator object.
    See iter.iter() and iter.Iterator for more info.
    
    There are also some function provided for iterating over iterable object and performing operations on it's items.
    iter() - for iterating over iterable objects,
    map() - for maping items from an iterable object to a list,
    filter() - for creating a list caontaining only certain items from an iterable object
    list() - for creating a list containing all items from an iterable object.
    
    The above methods only create an iterator for an iteratable object and call one of it's methods depending on what protocoll is used.
    See iter.Iterator for more information.
    
    There is also a range() method for creating a iterator for a range of numbers.
        
    @creator                 Jan-Klaas Kollhof
    @created                2004-12-08
    @lastchangedby       $LastChangedBy$
    @lastchangeddate    $Date$
**/
Module("iter", "$Revision$", function(mod){

    /**
        Base class for Iterators.
    **/
    mod.Iterator=Class(function(publ, supr){
        /**
            Returns the next item in the iteration.
            If there is no item left it throws StopIteration
        **/
        publ.next=function(){
            return undefined;
        };
                
        /**
            Used so an Iterator can be passed to iteration functions.
        **/
        publ.__iter__ = function(){
            return this;
        };
        
        publ.__iterate__=function(thisObj, cb){
            var result;
            thisObj = thisObj==null?this:thisObj;
            var item;
            while(((item=this.next()) !== undefined) && result===undefined){
                if(item.__tupleResult__){
                    item.push(this);
                    result=cb.apply(thisObj, item);
                }else{
                    result=cb.call(thisObj, item, this);
                }
            }
            return result;
        };
        
        publ.__filter__ = function(thisObj, cb){
            var result=[];
            thisObj = thisObj==null?this:thisObj;
            var item, doKeep;
            while((item=this.next()) !== undefined){
                if(item.__tupleResult__){
                    item.push(this);
                    doKeep=cb.apply(thisObj, item);
                }else{
                    doKeep=cb.call(thisObj, item, this);
                }
                if(doKeep){
                    result.push(item);
                }
            }
            return result;
        };
        
        publ.__map__ = function(thisObj, cb){
            var result=[];
            thisObj = thisObj==null?this:thisObj;
            var  item, mapedItem;
            while((item=this.next()) !== undefined){
                if(item.__tupleResult__){
                    item.push(this);
                    mapedItem=cb.apply(thisObj, item);
                }else{
                    mapedItem=cb.call(thisObj, item, this);
                }
                result.push(mapedItem);
            }
            return result;
        };
        
        publ.__list__ = function(){
            var list = [];
            var item;
            while((item=this.next()) !== undefined){
                list.push(item);
            }
            return list;
        };
        
        publ.replace = function(item){
            throw new mod.Exception("Iterator::replace() not implemented");
        };
    });

    /**
        A simple range class to iterate over a range of numbers.
    **/
    mod.Range =Class(mod.Iterator, function(publ, supr){
        /**
            Initializes a new range.
            @param start=0  The first item in the range.
            @param end       The last item in the range.
            @param step=1 The steps between each Item.
        **/
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
            var n = this.current + this.step;
            if(n > this.end){
                this.current=this.start;
                return undefined;
            }else{
                this.current = n;
                return this.current;
            }
        };
        
        publ.__iterate__=function(thisObj, cb){
            var result=undefined;
            for(this.current += this.step; this.current <= this.end && result===undefined;this.current += this.step){
                result=cb.call(thisObj, this.current, this);
            }
            return result;
        };
    });
    
    /**
        Returns a new Range object.
        @param start=0  The first item in the range.
        @param end       The last item in the range.
        @param step=1 The steps between each Item.
    **/
    mod.range = function(start, end, step){
        var r=new mod.Range(Class);
        r.__init__.apply(r, arguments);
        return r;
    };

    /**
        Iterator for Arrays.
    **/
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
        
        publ.__iterate__=function(thisObj, cb){
            var result=undefined;
            thisObj = thisObj==null?this:thisObj;
            var args = [null,this];
            for(this.index++; this.index<this.array.length && result===undefined; this.index++){
                result= cb.call(thisObj, this.array[this.index], this);
            }
        };
        
        publ.__list__ = function(){
            return [].concat(this.array);
        };
        
        publ.replace=function(item1, item2){
            switch(arguments.length){
                case 0:
                    this.array.splice(this.index, 1);
                    break;
                case 1:
                    this.array.splice(this.index, 1, item);
                    break;
                default:
                    var a=[this.index, arguments.length];
                    for(var i=0;i<arguments.length;i++){
                        a.push(arguments[i]);
                    }
                    this.array.splice.apply(this.array,a);
            }
            this.index += arguments.length -1;
        };
    });
    
    Array.prototype.__iter__ = function(){
        return new mod.ArrayItereator(this);
    };
    
    /**
        Iterator for Objects.
    **/
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

    /**
        Returns the iterator for an iterable object or iterates over al items of the iterable object by
        using the iterable's iterator's __iterate__ method.
        
        An iteration stops if the callback returns any value except undefined.
        The value returned by the callback will be returned to the caller of iter().
        @param iterable          The iterable object.
        @param thisObj=return The this object to use when calling the callback.
        @param cb                  An IterationCallback object to call for each step.
        @return                      An iterator object or the return value returned by the callback.
    **/
    mod.iter=function(iterable, thisObj, cb){
        var iterator;
        if(iterable.__iter__ !==undefined){
            iterator = iterable.__iter__();
        }else if(iterable.length != null){
            iterator = new mod.ArrayItereator(iterable);
        }else if(iterable.constructor == Object){
            iterator  = new mod.ObjectIterator(iterable);
        }else{
            throw new mod.Exception("Iterable object does not provide __iter__ method or no Iterator found.");
        }
        if(arguments.length==1){
            return iterator;
        }else{
            if(cb == null){
                cb = thisObj;
                thisObj = null;
            }
            return iterator.__iterate__(thisObj, cb);
        }
    };
    
    /**
        Interface of a IterationCallback.
        @param item The item returned by the iterator for the current step.
        @param iteration The Iteration object handling the iteration.
    **/
    mod.IterationCallback = function(item, iteration){};

    /**
        Returns a list containing all elements from an iteratable object for which the callback returns true.
        
        @param iterable          The iterable object.
        @param thisObj=return The this object to use when calling the callback.
        @param cb                  An IterationCallback object to call for each item.
        @return                      A list containing all elements that were filtered.
    **/
    mod.filter=function(iterable, thisObj,cb){
        var iterator = mod.iter(iterable);
        if(cb == null){
            cb = thisObj;
            thisObj = null;
        }
        return iterator.__filter__(thisObj, cb);
    };
    
    /**
        Returns a list containing elements returned by the callback for each item form the itrable object.
        
        @param iterable          The iterable object.
        @param thisObj=return The this object to use when calling the callback.
        @param cb                  An IterationCallback object to call for each item.
        @return                      A list containing new elements.
    **/        
    mod.map=function(iterable, thisObj, cb){
        var iterator  = mod.iter(iterable);
        if(cb == null){
            cb = thisObj;
            thisObj = null;
        }
        return iterator.__map__(thisObj, cb);
    };
    
    /**
        Returns a list containing all elements from an iteratable object.
        I.e. this function turns any iterable object into a list(Array).
        
        @param iterable          The iterable object.
        @return                      A list containing all elements.
    **/    
    mod.list=function(iterable){
        return mod.iter(iterable).__list__();
    };
    
    /**
        An itereator that iterates over a number of given iterators.
        use zip() to create a Zipper.
    **/
    mod.Zipper = Class(mod.Iterator, function(publ,priv,supr){
        
        publ.__init__=function(iterators){
            this.iterators = iterators;
        };
        
        publ.next=function(){
            var r =[];
            r.__tupleResult__ = true;
            var item;
            for(var i=0;i<this.iterators.length;i++){
                item=this.iterators[i].next();
                if(item === undefined){
                    return undefined;
                }else{
                    r.push(item);
                }
            }
            return r;
        };
    });
    
    /**
        Creates an iterator which iterates over the iterable objects given simultanously.
        @param iterable*  Any number of iterable objects.
        @return a Zipper iterator.
    **/
    mod.zip = function(iterable){
        var iterators =[];
        for(var i=0;i<arguments.length;i++){
            iterators.push(mod.iter(arguments[i]));
        }
        return new mod.Zipper(iterators);
    };

});
