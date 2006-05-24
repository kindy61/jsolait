/*
  Copyright (c) 2005 Jan-Klaas Kollhof

  This file is part of the JavaScript O Lait library(jsolait).

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
    A module providing Sets.

    @creator                 Jan-Klaas Kollhof
    @created                2005-03-11
    @lastchangedby       $LastChangedBy$
    @lastchangeddate    $Date$
**/
Module("sets", "$Revision$", function(mod){

    /**
        Thrown if an item was not found in the set.
    **/
    mod.ItemNotFoundInSet=Class(mod.Exception, function(publ, supr){
        ///The set the item was not found in.
        publ.set;
        ///The item that was not found.
        publ.item;

        publ.__init__=function(set, item){
            this.set =set;
            this.item=item;
        };
    });

    /**
        The Set class.
        All Items added to a set must be id-able using jsolait's id() function.
    **/
    mod.Set=Class(function(publ, supr){
        /**
            Initializes a Set instance.
            @param elem*   An element which is added to the set or an Array object of which the elements are added to the set.
        **/
        publ.__init__=function(elem){
            this.items = {};
            
            if(arguments.length > 1){
                for(var i=0;i<arguments.length;i++){
                    this.add(arguments[i]);
                }
            }else if(arguments.length == 1){
                var elems = arguments[0];
                if(elems instanceof Array){
                    for(var i=0;i<elems.length;i++){
                        this.add(elems[i]);
                    }
                }else{
                    throw new mod.Exception("Expecting an Array object or multiple arguments");
                }
            }
        };

        /**
            Adds an item to the set if it does not exist yet.
            @param item  A hashable item to add.
            @return        The item added.
        **/
        publ.add=function(item){
            this.items[id(item)] = item;
            return item;
        };

        /**
            Removes an item from the set raising
            an ItemNotFoundInSet error if the item is not present
            @param item The item to remove.
            @return        The item that was removed.
        **/
        publ.remove=function(item){
            var h = id(item);
            if(this.items[h] === undefined){
                throw new mod.ItemNotFoundInSet(this, item);
            }else{
                item = this.items[h];
                delete this.items[h];
                return item;
            }
        };

        /**
            Removes an item from the set wether or not the item realy exists.
            @param item The item to remove.
            @return        The item that was removed.
        **/
        publ.discard=function(item){
            var h = id(item);
            item = this.items[h];
            delete this.items[h];
            return item;
        };

        /**
            Returns wether or not an item is part of the set.
            @param item The item in question.
            @return        True if the item is found in the set, false otherwise.
        **/
        publ.contains=function(item){
            return (this.items[id(item)] !== undefined);
        };
        /**
            Returns wether or not the set is a sub set of another set.
            @param setObj The set to check against.
            @return True if the set is a subset of setObj. False otherwise.
        **/
        publ.isSubset = function(setObj){
            for(var n in this.items){
                if(setObj.contains(this.items[n])==false){
                    return false;
                }
            }
            return true;
        };

        /**
            Returns wether or not the set is a super set of another set.
            @param setObj The set to check against.
            @return True if the set is a super set of setObj. False otherwise.
        **/
        publ.isSuperset = function(setObj){
            return setObj.isSubset(this);
        };

        /**
            Returns wether or not the set is equal to the other set.
            @param setObj The set to check against.
            @return True if the set is equal to setObj. False otherwise.
        **/
        publ.equals=function(setObj){
            return (this.isSubset(setObj) && setObj.isSubset(this));
        };

        publ.__eq__=function(setObj){
            if(setObj.isSubset!==undefined){
                return this.equals(setObj);
            }else{
                return false;
            }
        };

        /**
            Creates a new set containing all elements of set and setObj (newSet = set | setObj).
            @param set The set to union with.
            @return A new set.
        **/
        publ.union=function(setObj){
            var ns= this.copy();
            ns.unionUpdate(setObj);
            return ns;
        };

        /**
            Creates a new set containing elements common to the set and setObj (newSet = set & setObj).
            @param set The set to intersect with.
            @return A new set.
        **/
        publ.intersection=function(setObj){
            var ns=new mod.Set();
            for(var n in this.items){
                var item=this.items[n];
                if(setObj.contains(item)){
                    ns.add(item);
                }
            }
            return ns;
        };
        /**
            Creates a new set containing only elements of the set that are not found in setObj (newSet = set - setObj).
            @param setObj The set containing the elements to subtract from the set.
            @return A new set.
        **/
        publ.difference=function(setObj){
            var ns=new mod.Set();
            for(var n in this.items){
                var item=this.items[n];
                if(setObj.contains(item)==false){
                    ns.add(item);
                }
            }
            return ns;
        };


        /**
            Creates a new set containing elements from the set and setObj but no elements present in both(newSet = (set - setObj) | (setObj - set)).
            @param setObj The set to create a symmetric difference with.
            @return A new set.
        **/
        publ.symmDifference=function(setObj){
            var ns = this.difference(setObj);
            return ns.unionUpdate(setObj.difference(this));
        };


        /**
            Updates the set adding all elements from setObj (set = set | setObj).
            @param set The set to union with.
            @return The set itself.
        **/
        publ.unionUpdate=function(setObj){
            for(var n in setObj.items){
                this.add(setObj.items[n]);
            }
            return this;
        };

        /**
            Updates the set keeping only elements also found in setObj (set = set & setObj).
            @param set The set to intersect with.
            @return The set itself.
        **/
        publ.intersectionUpdate=function(setObj){
            for(var n in this.items){
                var item=this.items[n];
                if(setObj.contains(item)==false){
                    this.remove(item);
                }
            }
            return this;
        };

        /**
            Updates the set removing all elements found in setObj  (set = set - setObj).
            @param setObj The set containing the elements to subtract from the set.
            @return The set itself.
        **/
        publ.differenceUpdate=function(setObj){
            for(var n in this.items){
                var item=this.items[n];
                if(setObj.contains(item)){
                    this.remove(item);
                }
            }
            return this;
        };

        /**
            Updates the set to only contain elements from the set and setObj but no elements present in both(set = (set - setObj) | (setObj - set)).
            @param setObj The set to create a symmetric difference with.
            @return The set itself.
        **/
        publ.symmDifferenceUpdate=function(setObj){
            var union = setObj.difference(this);
            this.differenceUpdate(setObj);
            return this.unionUpdate(union);
        };

        /**
            Creates a copy of the set.
            @return A new copy of the set.
        **/
        publ.copy=function(){
            var ns = new mod.Set();
            return ns.unionUpdate(this);
        };

        /**
            Removes all elements from teh set.
        **/
        publ.clear=function(){
            this.items={};
        };

        /**
            Returns an array containing all elements of the set.
            @return An array containing all elements of the set.
        **/
        publ.toArray=function(){
            var a=[];
            for(var n in this.items){
                a.push(this.items[n]);
            }
            return a;
        };

        publ.__str__=function(){
            var items =[];
            for(var n in this.items){
                items.push(this.items[n]);
            }
            return "{"+ items.join(",") + "}";
        };
    });
});

