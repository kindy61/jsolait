

Critical=50;
Error=40;
Warning=30;
Info=20;
Debug=10;
NotSet=0;

levelNames = {
    50 : 'CRITICAL',
    40 : 'ERROR',
    30 : 'WARNING',
    20 : 'INFO',
    10 : 'DEBUG',
    0 : 'NOTSET'
};


publ getLevelName(lvl){
    return levelNames[lvl];
};
publ setLevelName(lvl, name){
    levelNames[lvl]=name;
};
 
publ debug(msg){
    if(rootLogger.handlers.length==0){
        basicConfig(0);
    }
    rootLogger.debug.apply(rootLogger, arguments);
};

publ info(msg){
    if(rootLogger.handlers.length==0){
        basicConfig(0);
    }
    rootLogger.info.apply(rootLogger, arguments);
};

publ warning(msg){
    if(rootLogger.handlers.length==0){
        basicConfig(0);
    }
    rootLogger.warning.apply(rootLogger, arguments);
};

publ error(msg, args){
    if(rootLogger.handlers.length==0){
        basicConfig(0);
    }
    rootLogger.error.apply(rootLogger, arguments);
};

publ critical(msg, args){
    if(rootLogger.handlers.length==0){
        basicConfig(0);
    }
    rootLogger.critical.apply(rootLogger, arguments);
};

publ log(level, msg, args){
    if(rootLogger.handlers.length==0){
        basicConfig(0);
    }
    rootLogger.log.apply(rootLogger, arguments);
};



class LogRecord({
    publ __init__(name, lvl, msg, args){
        this.name = name;
        this.level=lvl;
        this.levelName=getLevelName(lvl);
        this.args=args;
        this.created = new Date();
        this.msg=msg;
        if(args.length){
            this.message= msg.format.apply(msg,args);
        }else{
            this.message=msg;
        }
    };
    
    publ __str__(){
        return '<LogRecord: %s, %s, %s ">'.format(this.name, this.level, this.msg);
    };
});

class Formatter({
    publ __init__(fmt){
        this.fmt=fmt==null?"%(message)s":fmt;
    };
    
    publ format(rec){
        return this.fmt.format(rec);
    };
});

class Filter({
     publ __init__(name){
        this.filters=[];
     }
     
     publ addFilter(fltr){
         this.filters.push(fltr);
     };
     
     publ removeFilter(){
         
     };
     
     publ filter(){
        var rslt = true;
        for(var i=0;i<this.filters.length;i++){
            if(! this.filters[i].filter(rec)){
                rslt = false;
                break;
            }
        }
        return rslt;
     };
});


class Handler extends Filter({
    publ __init__(level, formatter){
        supr.__init__.call(this);
        this.level = level==undefined?NotSet:level;
        this.formatter=formatter;
    };

    publ emit(rec){
        
    };
    
    publ format(rec){
        var fmt;
        if(this.formatter){
            fmt = this.formatter;
        }else{
            fmt = defaultFormatter;
        }
        return fmt.format(rec);
    };
    
    publ handle(rec){
        var rslt = this.filter(rec);
        if(rslt){
            try{
                this.emit(rec);
            }catch(e){
            }
        }
        return rslt;
    };
});



class Logger extends Filter({
    publ __init__(name,level){
        supr.__init__.call(this);
        this.name=name;
        this.parent = null;
        this.propagate = 1;
        this.handlers = [];
        this.level = level==undefined?NotSet:level;
        this.disabled = false;
    };
    
    publ debug(msg){
        var args=[];
        for(var i=1;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var rec = this.makeRecord(this.name, Debug, msg, args); 
        this.handle(rec);
    };

    publ info(msg){
        var args=[];
        for(var i=1;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var rec = this.makeRecord(this.name, Info, msg, args); 
        this.handle(rec);
    };

    publ warning(msg){
        var args=[];
        for(var i=1;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var rec = this.makeRecord(this.name, Warning, msg, args); 
        this.handle(rec);
    };

    publ error(msg){
        var args=[];
        for(var i=1;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var rec = this.makeRecord(this.name, Error, msg, args); 
        this.handle(rec);
    };

    publ critical(msg){
        var args=[];
        for(var i=1;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var rec = this.makeRecord(this.name, Critical, msg, args); 
        this.handle(rec);
    };

    publ log(level, msg){
        var args=[];
        for(var i=2;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var rec = this.makeRecord(this.name, level, msg, args); 
        this.handle(rec);
    };
    
    publ addHandler(hdlr){
        this.handlers.push(hdlr);
    };
    
    publ removeHandler(hdlr){

    };
    
    publ handle(rec){
        if((! this.disabled) && this.filter(rec)){
            this.callHandlers(rec);
        }
    };
    
    publ callHandlers(rec){
        var c = this;
        var found = 0;
        while(c!=null){
            for(var i=0;i<c.handlers.length;i++){
                var hdlr=c.handlers[i];
                found+=1;
                if(rec.level >= hdlr.level){
                    hdlr.handle(rec);
                }
            }
            if(! c.propagate){
                c = null;
            }else{
                c = c.parent;
            }
        }
    };
    
    publ makeRecord(name, lvl, msg, args){
        return new LogRecord(name,lvl,msg,args); 
    };
});
    

publ basicConfig(level, format){
      
    if(rootLogger.handlers.length == 0){ 
        hdlr = new Handler();
        hdlr.formatter=new Formatter(format==null?"%(levelName)s:%(name)s:%(message)s":format);
        
        rootLogger.addHandler(hdlr);
        rootLogger.level=level;
    }
};


var rootLogger=new Logger('root');
var loggerClass=Logger;
var defaultFormatter= new Formatter();
var loggers={};

publ getLogger(name){
    if(name==undefined){
        l=rootLogger;
    }else{
        var l=loggers[name];
        if(l==undefined){
            l = new loggerClass(name);
            loggers[name]=l;
            var names=name.split(".");
            if(names.length>1){
                var parentLoggerName=names.slice(-1).join('.')
                l.parent=getLogger(parentLoggerName);
            }else{
                l.parent=rootLogger;
            }
        }
    }
    return l;
};

publ getLoggerClass(){
    return loggerClass;
};

publ setLoggerClass(lc){
    loggerClass=lc;
};





