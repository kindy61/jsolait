

mod.Critical=50;
mod.Error=40;
mod.Warning=30;
mod.Info=20;
mod.Debug=10;
mod.NotSet=0;

var levelNames = {
    50 : 'CRITICAL',
    40 : 'ERROR',
    30 : 'WARNING',
    20 : 'INFO',
    10 : 'DEBUG',
    0 : 'NOTSET'
};


mod.getLevelName=function(lvl){
    return levelNames[lvl];
};
mod.setLevelName=function(lvl, name){
    levelNames[lvl]=name;
};
 
mod.debug=function(msg){
    if(rootLogger.handlers.length==0){
        mod.basicConfig(0);
    }
    rootLogger.debug.apply(rootLogger, arguments);
};

mod.info=function(msg){
    if(rootLogger.handlers.length==0){
        mod.basicConfig(0);
    }
    rootLogger.info.apply(rootLogger, arguments);
};

mod.warning=function(msg){
    if(rootLogger.handlers.length==0){
        mod.basicConfig(0);
    }
    rootLogger.warning.apply(rootLogger, arguments);
};

mod.error=function(msg, args){
    if(rootLogger.handlers.length==0){
        mod.basicConfig(0);
    }
    rootLogger.error.apply(rootLogger, arguments);
};

mod.critical=function(msg, args){
    if(rootLogger.handlers.length==0){
        mod.basicConfig(0);
    }
    rootLogger.critical.apply(rootLogger, arguments);
};

mod.log=function(level, msg, args){
    if(rootLogger.handlers.length==0){
        mod.basicConfig(0);
    }
    rootLogger.log.apply(rootLogger, arguments);
};



mod.LogRecord=Class(function(publ,priv,supr){
    publ.__init__=function(name, lvl, msg, args){
        this.name = name;
        this.level=lvl;
        this.levelName=mod.getLevelName(lvl);
        this.args=args;
        this.created = new Date();
        this.msg=msg;
        if(args.length){
            this.message= msg.format.apply(msg,args);
        }else{
            this.message=msg;
        }
    };
    
    publ.__str__=function(){
        return '<LogRecord: %s, %s, %s ">'.format(this.name, this.level, this.msg);
    };
});

mod.Formatter=Class(function(publ,priv,supr){
    publ.__init__=function(fmt){
        this.fmt=fmt==null?"%(message)s":fmt;
    };
    
    publ.format= function(rec){
        return this.fmt.format(rec);
    };
});

mod.Filter=Class(function(publ,priv,supr){
     publ.__init__ = function(name){
        this.filters=[];
     }
     
     publ.addFilter=function(fltr){
         this.filters.push(fltr);
     };
     
     publ.removeFilter=function(){
         
     };
     
     publ.filter=function(){
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


mod.Handler=Class(mod.Filter, function(publ,priv,supr){
    publ.__init__ = function(level, formatter){
        supr.__init__.call(this);
        this.level = level==undefined?mod.NotSet:level;
        this.formatter=formatter;
    };

    publ.emit=function(rec){
        
    };
    
    publ.format=function(rec){
        var fmt;
        if(this.formatter){
            fmt = this.formatter;
        }else{
            fmt = defaultFormatter;
        }
        return fmt.format(rec);
    };
    
    publ.handle=function(rec){
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



mod.Logger=Class(mod.Filter, function(publ,priv,supr){
    publ.__init__ = function(name,level){
        supr.__init__.call(this);
        this.name=name;
        this.parent = null;
        this.propagate = 1;
        this.handlers = [];
        this.level = level==undefined?mod.NotSet:level;
        this.disabled = false;
    };
    
    publ.debug=function(msg){
        var args=[];
        for(var i=1;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var rec = this.makeRecord(this.name, mod.Debug, msg, args); 
        this.handle(rec);
    };

    publ.info=function(msg){
        var args=[];
        for(var i=1;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var rec = this.makeRecord(this.name, mod.Info, msg, args); 
        this.handle(rec);
    };

    publ.warning=function(msg){
        var args=[];
        for(var i=1;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var rec = this.makeRecord(this.name, mod.Warning, msg, args); 
        this.handle(rec);
    };

    publ.error=function(msg){
        var args=[];
        for(var i=1;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var rec = this.makeRecord(this.name, mod.Error, msg, args); 
        this.handle(rec);
    };

    publ.critical=function(msg){
        var args=[];
        for(var i=1;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var rec = this.makeRecord(this.name, mod.Critical, msg, args); 
        this.handle(rec);
    };

    publ.log=function(level, msg){
        var args=[];
        for(var i=2;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var rec = this.makeRecord(this.name, level, msg, args); 
        this.handle(rec);
    };
    
    publ.addHandler=function(hdlr){
        this.handlers.push(hdlr);
    };
    
    publ.removeHandler=function(hdlr){

    };
    
    publ.handle=function(rec){
        if((! this.disabled) && this.filter(rec)){
            this.callHandlers(rec);
        }
    };
    
    publ.callHandlers=function(rec){
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
    
    publ.makeRecord=function(name, lvl, msg, args){
        return new mod.LogRecord(name,lvl,msg,args); 
    };
});
    

mod.basicConfig=function(level, format){
      
    if(rootLogger.handlers.length == 0){ 
        hdlr = new mod.Handler();
        hdlr.formatter=new mod.Formatter(format==null?"%(levelName)s:%(name)s:%(message)s":format);
        
        rootLogger.addHandler(hdlr);
        rootLogger.level=level;
    }
};


var rootLogger=new mod.Logger('root');
var loggerClass=mod.Logger;
var defaultFormatter= new mod.Formatter();
var loggers={};

mod.getLogger=function(name){
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
                l.parent=mod.getLogger(parentLoggerName);
            }else{
                l.parent=rootLogger;
            }
        }
    }
    return l;
};

mod.getLoggerClass=function(){
    return loggerClass;
};

mod.setLoggerClass=function(lc){
    loggerClass=lc;
};





