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
    Module providing functions implementing operators.
    
    @creator Jan-Klaas Kollhof
    @created 2005-12-30
    @lastchangedby       $LastChangedBy: Jan-Klaas Kollhof $
    @lastchangeddate    $Date: 2006-01-30 20:52:35 +0000 (Mon, 30 Jan 2006) $
**/
Module("operators", "$Revision: 20 $", function(mod){

    mod.lt=function(a, b){
        if((a!=null) && (a.__lt__!==undefined)){
            return a.__lt__(b);
        }else if((b!=null) && (b.__lt__!==undefined)){
            return b.__lt__(a);
        }else{
            return a<b;
        }
    };

    mod.le=function(a, b){
        if((a!=null) && (a.__le__!==undefined)){
            return a.__le__(b);
        }else if((b!=null) && (b.__le__!==undefined)){
            return b.__le__(a);
        }else{
            return a<=b;
        }
    };

    mod.eq=function(a, b){
        if((a!=null) && (a.__eq__!==undefined)){
            return a.__eq__(b);
        }else if((b!=null) && (b.__eq__!==undefined)){
            return b.__eq__(a);
        }else{
            return a==b;
        }
    };
    
    mod.ne=function(a, b){
        if((a!=null) && (a.__ne__!==undefined)){
            return a.__ne__(b);
        }else if((b!=null) && (b.__ne__!==undefined)){
            return b.__ne__(a);
        }else{
            return a != b;
        }
    };
    
    mod.is=function(a,b){
        if((a!=null) && (a.__is__!==undefined)){
            return a.__is__(b);
        }else if((b!=null) && (b.__is__!==undefined)){
            return b.__is__(a);
        }else{
            return a===b;
        }
    };
    
    mod.isnot=function(a,b){
        if((a!=null) && (a.__isnot__!==undefined)){
            return a.__isnot__(b);
        }else if((b!=null) && (b.__isnot__!==undefined)){
            return b.__isnot__(a);
        }else{
            return a!==b;
        }
    };
    
    mod.ge=function(a, b){
        if((a!=null) && (a.__ge__!==undefined)){
            return a.__ge__(b);
        }else if((b!=null) && (b.__ge__!==undefined)){
            return b.__ge__(a);
        }else{
            return a>=b;
        }
    };

    mod.gt=function(a, b){
        if((a!=null) && (a.__gt__!==undefined)){
            return a.__gt__(b);
        }else if((b!=null) && (b.__gt__!==undefined)){
            return b.__gt__(a);
        }else{
            return a>b;
        }
    };

    mod.not=function(a){
        if((a!=null) && (a.__not__!==undefined)){
            return a.__not__();
        }else{
            return ! a;
        }
    };

    mod.__main__=function(){

    };

});
