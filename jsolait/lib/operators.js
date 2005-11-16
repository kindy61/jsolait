Module("operators", "0.0.1", function(mod){

    lt=function(a, b){
        if((a!=null) && (a.__lt__!==undefined)){
            return a.__lt__(b);
        }else if((b!=null) && (b.__lt__!==undefined)){
            return b.__lt__(a);
        }else{
            return a<b;
        }
    }

    le=function(a, b){
        if((a!=null) && (a.__le__!==undefined)){
            return a.__le__(b);
        }else if((b!=null) && (b.__le__!==undefined)){
            return b.__le__(a);
        }else{
            return a<=b;
        }
    }

    eq=function(a, b){
        if((a!=null) && (a.__eq__!==undefined)){
            return a.__eq__(b);
        }else if((b!=null) && (b.__eq__!==undefined)){
            return b.__eq__(a);
        }else{
            return a===b;
        }
    }

    ne=function(a, b){
        if((a!=null) && (a.__ne__!==undefined)){
            return a.__ne__(b);
        }else if((b!=null) && (b.__ne__!==undefined)){
            return b.__ne__(a);
        }else{
            return a !== b;
        }
    }

    ge=function(a, b){
        if((a!=null) && (a.__ge__!==undefined)){
            return a.__ge__(b);
        }else if((b!=null) && (b.__ge__!==undefined)){
            return b.__ge__(a);
        }else{
            return a>=b;
        }
    }

    gt=function(a, b){
        if((a!=null) && (a.__gt__!==undefined)){
            return a.__gt__(b);
        }else if((b!=null) && (b.__gt__!==undefined)){
            return b.__gt__(a);
        }else{
            return a>b;
        }
    }

    not=function(a){
        if((a!=null) && (a.__not__!==undefined)){
            return a.__not__();
        }else{
            return ! a;
        }
    }

    mod.__main__=function(){

    }

});
