/*
  Copyright (c) 2005-2006 Jan-Klaas Kollhof

  This file is part of the JavaScript o lait library(jsolait).

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
    Provides a lightweight JSON-RPC imlementation for JSON-RPC over HTTP.
    @creator Jan-Klaas Kollhof
    @created 2005-02-25
    @lastchangedby       $LastChangedBy$
    @lastchangeddate    $Date$
**/
__version__="$Revision$";

import urllib;


/**
    Thrown if a  server did not respond with response status 200 (OK).
**/
class InvalidServerResponse  extends Exception({
    /**
        Initializes the Exception.
        @param status       The status returned by the server.
    **/
    publ __init__(status){
        supr.__init__.call(this, "The server did not respond with a status 200 (OK) but with: " + status);
        this.status = status;
    };
     ///The status returned by the server.
    publ status;
});

/**
    Thrown if an JSON-RPC response is not well formed.
**/
class MalformedJSONRpc  extends Exception({
    /**
        Initializes the Exception.
        @param msg          The error message of the user.
        @param json           The json source.
        @param trace=undefined  The error causing this Exception
    **/
    publ __init__(msg, s, trace){
        supr.__init__.call(this, msg,trace);
        this.source = s;
    };
     ///The json source which was mal formed.
    publ source;
});
/**
    Thrown if an JSON-RPC error is returned.
**/
class JSONRPCError  extends Exception({
    /**
        Initializes the Exception.
        @param err          The error object.
        @param trace=undefined  The error causing this Exception
    **/
    publ __init__(err, trace){
        supr.__init__.call(this, err,trace);
    };
});


/**
    Marshalls an object to JSON.(Converts an object into JSON conforming source.)
    It just calls the toJSON function of the objcect.
    So, to customize serialization of objects one just needs to specify/override the toXmlRpc method
    which should return an xml string conforming with XML-RPC spec.
    @param obj    The object to marshall
    @return         An xml representation of the object.
**/
publ marshall(obj){
    if(obj == null){
        return "null";
    }else if(obj.toJSON){
        return obj.toJSON();
    }else{
        var v=[];
        for(var attr in obj){
            if(typeof obj[attr] != "function"){
                v.push('"' + attr + '": ' + marshall(obj[attr]));
            }
        }
        return "{" + v.join(", ") + "}";
    }
};

/**
    Unmarshalls a JSON source to a JavaScript object.
    @param source    The source  to unmarshall.
    @return         The JavaScript object created.
**/
publ unmarshall(source){
    try {
        var obj;
        eval("obj=" + source);
        return obj;
    }catch(e){
        throw new MalformedJSONRpc("The server's response could not be parsed.", source, e);
    }
};
/**
    Class for creating JSON-RPC methods.
    Calling the created method will result in a JSON-RPC call to the service.
    The return value of this call will be the return value of the RPC call.
    RPC-Errors will be raised as Exceptions.

    Asynchronous operation:
    If the last parameter passed to the method is an JSONRPCAsyncCallback object,
    then the remote method will be called asynchronously.
    The results and errors are passed to the callback.
**/
class JSONRPCMethod({

    var postData = function(url, user, pass, data, callback){
        if(callback == null){//todo ===undefined
            var rslt = urllib.postURL(url, user, pass, data, [["Content-Type", "text/plain"]]);
            return rslt;
        }else{
            return urllib.postURL(url, user, pass, data, [["Content-Type", "text/plain"]], callback);
        }
    };

    var handleResponse=function(resp){
        var status=null;
        try{//see if the server responded with a response code 200 OK.
            status = resp.status;
        }catch(e){
        }
        if(status == 200){
            var respTxt = "";
            try{
                respTxt=resp.responseText;
            }catch(e){
            }
            if(respTxt == null || respTxt == ""){
                throw new MalformedJSONRpc("The server responded with an empty document.", "");
            }else{
                var rslt = unmarshall(respTxt);
                if(rslt.error != null){
                    throw new JSONRPCError(rslt.error);
                }else{
                    return rslt.result;
                }
            }
        }else{
            throw new InvalidServerResponse(status);
        }
    };

    var jsonRequest = function(id, methodName, args){
        var p = [marshall(id), marshall(methodName), marshall(args)];
        return '{"id":' + p[0] + ', "method":' + p[1] + ', "params":' + p[2] + "}";
    };
    /**
        Initializes the JSON-RPC method.
        @param url                 The URL of the service providing the method.
        @param methodName   The name of the method to invoke.
        @param user=null             The user name to use for HTTP authentication.
        @param pass=null             The password to use for HTTP authentication.
    **/
    publ __init__(url, methodName, user, pass){
        this.methodName = methodName;
        this.url = url;
        this.user = user;
        this.password=pass;
    };

    publ __call__(){
        var args=new Array();
        for(var i=0;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        //sync or async call
        if(typeof arguments[arguments.length-1] !='function'){
            var data=jsonRequest("httpReq", this.methodName, args);
            var resp = postData(this.url, this.user, this.password, data);
            return handleResponse(resp);
        }else{
            var cb = args.pop(); //get rid of the function argument
            var data=jsonRequest("httpReq", this.methodName, args);
            return postData(this.url, this.user, this.password, data, function(resp){
                var rslt = null;
                var exc =null;
                try{
                    rslt = handleResponse(resp);
                }catch(e){
                    exc = e;
                }
                try{//call the callback for the async call.
                    cb(rslt,exc);
                }catch(e){
                }
                args = null;
                resp = null;
            });
        }
    };
    /**
        Sets username and password for HTTP Authentication.
        @param user    The user name.
        @param pass    The password.
    **/
    publ setAuthentication(user, pass){
        this.user = user;
        this.password = pass;
    };

    /**
        Sends the call as a notification which does not have a response.
        Call this as if you would call the method itself. Callbacks are ignored.
    **/
    publ notify(){
        var args=new Array();
        for(var i=0;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        var data=jsonRequest(null, this.methodName, args);
        postData(this.url, this.user, this.password, data, function(resp){});
    };

    ///The name of the remote method.
    publ methodName;
    ///The url of the remote service containing the method.
    publ url;
    ///The user name used for HTTP authorization.
    publ user;
    ///The password used for HTTP authorization.
    publ password;
});

/**
    Creates proxy objects which resemble the remote service.
    Method calls of this proxy will result in calls to the service.
**/
class ServiceProxy({
    /**
        Initializes a new ServiceProxy.
        The arguments are interpreted as shown in the examples:
        ServiceProxy("url", ["methodName1",...])
        ServiceProxy("url", ["methodName1",...], "user", "pass")
        ServiceProxy("url", "user", "pass")

        @param url                     The url of the service.
        @param methodNames      Array of names of methods that can be called on the server.
        @param user=null             The user name to use for HTTP authentication.
        @param pass=null             The password to use for HTTP authentication.
    **/
    publ __init__(url, methodNames, user, pass){
        this._url = url;
        this._user = user;
        this._password = pass;
        this._addMethodNames(methodNames);
    };

    /**
        Adds new JSONRPCMethods to the proxy server which can then be invoked.
        @param methodNames   Array of names of methods that can be called on the server.
    **/
    publ _addMethodNames(methodNames){
        for(var i=0;i<methodNames.length;i++){
            var obj = this;
            //setup obj.childobj...method
            var names = methodNames[i].split(".");
            for(var n=0;n<names.length-1;n++){
                var name = names[n];
                if(obj[name]){
                    obj = obj[name];
                }else{
                    obj[name]  = new Object();
                    obj = obj[name];
                }
            }
            var name = names[names.length-1];
            if(obj[name]){
            }else{
                var mth = new JSONRPCMethod(this._url, methodNames[i], this._user, this._password);
                obj[name] = mth;
                this._methods.push(mth);
            }
        }
    };

    /**
        Sets username and password for HTTP Authentication for all methods of this service.
        @param user    The user name.
        @param pass    The password.
    **/
    publ _setAuthentication(user, pass){
        this._user = user;
        this._password = pass;
        for(var i=0;i<this._methods.length;i++){
            this._methods[i].setAuthentication(user, pass);
        }
    };

    ///The url of the service to resemble.
    publ _url;
    ///The user used for HTTP authentication.
    publ _user;
    ///The password used for HTTP authentication.
    publ _password;
    ///All methods.
    publ _methods=new Array();
});
    
class SimpleHTTPConnection({
     publ __init__(url, datahandler){
        this.url = url;
        this.datahandler = datahandler;
    };
    
    publ send(data){
        urllib.postURL(this.url, data, bind(this, function(req){
            this.processData(req.responseText);
        }));
    };
    
    publ processData(data){
        if(data!=''){
            this.datahandler(data);
        }
    };
});

class SocketConnection({
    publ __init__(host, port, datahandler){
        this.host = host;
        this.port = port;
        this.datahandler = datahandler;
        this.socket = jsolait.loadModule('net.sockets').createSocket();
        this.socket.onData = function(data){
            datahandler(data);
        };
        this.socket.connect(host, port);
    };
    
    publ send(data){
        this.socket.send(data);
    };
});

class RPCMethod({
    publ __init__(name,proxy){
        this._name = name;
        this.proxy = proxy;
    };
    
    publ __call__(){
        var args=new Array();
        for(var i=0;i<arguments.length;i++){
            args.push(arguments[i]);
        }
        if(typeof args[args.length-1] == "function"){
            var callback = args.pop();
            return this.proxy._sendRequest(this._name, args, callback);
        }else{
            return this.proxy._sendNotification(this._name, args);
        }
    };
});

class ServiceProxy2({
    publ __init__(serviceurl, methodNames, localService){
        this._url = serviceurl;    

        if(serviceurl.slice(0,10) == "jsonrpc://"){
            var hostport = serviceurl.slice(10).split(":");
            hostport.push(5766);//default json-rpc port
            var host =hostport.shift();
            var port = hostport.shift();
            this._connection = new SocketConnection(host, port, bind(this, this._handleData));
        }else{
            this._connection = new SimpleHTTPConnection(this._url, bind(this, this._handleData));
        }
        this._attachMethods(methodNames);
        this._localService = localService == null ? {}:localService;
        this._pendingRequests={};
    };
    
    /**
        Adds new JSONRPCMethods to the proxy server which can then be invoked.
        @param methodNames   Array of names of methods that can be called on the server.
    **/
    publ _attachMethods(methodNames){
        for(var i=0;i<methodNames.length;i++){
            var obj = this;
            //setup obj.childobj...method
            var names = methodNames[i].split(".");
            for(var n=0;n<names.length-1;n++){
                var name = names[n];
                if(obj[name]){
                    obj = obj[name];
                }else{
                    obj[name]  = new Object();
                    obj = obj[name];
                }
            }
            var name = names[names.length-1];
            if(obj[name]){
            }else{
                var mth = new RPCMethod(methodNames[i], this);
                obj[name] = mth;
            }
        }
    };
    
    publ _handleData(data){
        var d = 'return [' + data.replace(/\n/g, ",") + ']';
        try{
            f=new Function('',d);
            var messages = f();
        }catch(e){
            throw new MalformedJSONRpc("The JSON-RPC data is not parsable",  data, e);
        }
        
        for(var i=0;i<messages.length;i++){
            if(messages[i].method != null  && messages[i].params != null && messages[i].id !=null){
                this._handleInvokation(messages[i].method, messages[i].params, messages[i].id);
            }else if(messages[i].method != null  && messages[i].params != null && messages[i].id == null){
                this._handleNotification(messages[i].method, messages[i].params);
            }else if(messages[i].id != null){
                this._handleResponse(messages[i].result, messages[i].error, messages[i].id);
            }else{
                throw new MalformedJSONRpc("The JSON-RPC message does not contain appropriate properties", d);
            }
        }
    };
    
    publ _handleResponse(result, err, id){
        var r = this._pendingRequests[id];
        if(r){
            delete this._pendingRequests[id];
            r.handleResponse(result, err);
        }
    };
    
    publ _handleInvokation(method, params, id){
        if(this._localService[method]){
            var rslt = this._localService[method].apply(this._localService, params);
            this._sendResponse(rslt, null, id);
        }else{
            this._sendResponse(null, "Method Not Found", id);
        }
    };
    
    publ _handleNotification(method, params){
         if(this._localService[method]){
            this._localService[method].apply(this._localService, params);
        }
    };
    
    publ _sendMessage(data){
        this._connection.send(data + "\n");
    };
    
    publ _sendRequest(method, params, callback){
        var r = new PendingRequest(callback);
        this._pendingRequests[id(r)] = r;
        var data = marshall({method:method, params:params, id:id(r)});
        this._sendMessage(data);
        return r;
    };
    
    publ _sendNotification(method, params){
        var data = marshall({method:method, params:params, id:null});
        this._sendMessage(data);
    };
    
    publ _sendResponse(result, error, id){
        var data = marshall({result:result, error:error, id:id});
        this._sendMessage(data);
    };
    
});

class PendingRequest({
    publ __init__(callback){
        this.callback=callback;
    };
    
    publ handleResponse(result, error){
        this.callback.call(null, result, error);
    };
});

   
/**
    Converts a String to JSON.
**/
String.prototype.toJSON = function(){
    var s = '"' + this.replace(/(["\\])/g, '\\$1') + '"';
    s = s.replace(/(\n)/g,"\\n");
    return s;
};

/**
    Converts a Number to JSON.
**/
Number.prototype.toJSON = function(){
    return this.toString();
};

/**
    Converts a Boolean to JSON.
**/
Boolean.prototype.toJSON = function(){
    return this.toString();
};

/**
    Converts a Date to JSON.
    Date representation is not defined in JSON.
**/
Date.prototype.toJSON= function(){
    var padd=function(s, p){
        s=p+s;
        return s.substring(s.length - p.length);
    };
    var y = padd(this.getUTCFullYear(), "0000");
    var m = padd(this.getUTCMonth() + 1, "00");
    var d = padd(this.getUTCDate(), "00");
    var h = padd(this.getUTCHours(), "00");
    var min = padd(this.getUTCMinutes(), "00");
    var s = padd(this.getUTCSeconds(), "00");

    var isodate = y +  m  + d + "T" + h +  ":" + min + ":" + s;

    return '{"jsonclass":["sys.ISODate", ["' + isodate + '"]]}';
};

/**
    Converts an Array to JSON.
**/
Array.prototype.toJSON = function(){
    var v = [];
    for(var i=0;i<this.length;i++){
        v.push(marshall(this[i])) ;
    }
    return "[" + v.join(", ") + "]";
};

