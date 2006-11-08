/*
  Copyright (c) 2003 Jan-Klaas Kollhof

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
    Provides methods for making HTTP requests.
    @creator                 Jan-Klaas Kollhof
    @created                2003-07-10
    @lastchangedby       $LastChangedBy$
    @lastchangeddate    $Date$
*/
__version__="$Revision$";


/**
    Thrown if no request object could be instanciated.
*/
class NoHTTPRequestObject extends Exception({
    /**
        Initializes the Exception.
        @param trace The error causing this exception.
    */
    publ __init__(trace){
        supr.__init__.call(this,  "Could not create an HTTP request object", trace);
    };
});

/**
    Thrown if an HTTP request could not be opened.
*/
class RequestOpenFailed  extends Exception({
    /**
        Initializes the Exception.
        @param trace The error causing this exception.
    */
    publ __init__(trace){
        supr.__init__.call(this,  "Opening of HTTP request failed.", trace);
    };
});

/**
    Thrown is arequest could not be sent to the server.
*/
class SendFailed extends Exception({
     /**
        Initializes the Exception.
        @param trace The error causing this exception.
    */
    publ __init__(trace){
        supr.__init__.call(this,  "Sending of HTTP request failed.", trace);
    };
});

/**
    Mimics the HTTPRequest object using Adobe's SVG Viewer's postURL and getURL.
    It can only process asyncronous connection and the only header that's supported is 'Content-Type'.
*/
class  ASVRequest({
    /**
        Initializes the ASVRequest.
    */
    publ __init__(){
        if((getURL==null) || (postURL==null)){
            throw "getURL and postURL are not available!";
        }else{
            this.readyState=0;
            this.responseText="";
            this.__contType ="";
            this.status=200;
        }
    };
    /**
        Mimics the open method without actually opening a connection.
        @param type          "GET" or "POST".
        @param url             The url to open.
        @param async=true True for async. connection. Otherwhise an exception is thrown.
    */
    publ open(type,url,async){
        if (async == false){
            throw "Can only open asynchronous connections!";
        }
        this.__type = type;
        this.__url = url;
        this.readyState=0;
    };
    /**
        Sets a header.
        @param name  The header name. All but "Content-Type" are ignored.
        @param value  The value of the header.
    */
    publ setRequestHeader(name, value){
        if (name=="Content-Type"){
            this.__contType =value;
        }
    };
    /**
        Sends the request.
        @param data   The data to send when doing a post.
    */
    publ send(data){
        var self=this;
        var cbh=new Object();
        cbh.operationComplete = function(rsp){
            self.readyState=4;
            self.responseText=rsp.content;
            if(this.ignoreComplete == false){
                if(self.onreadystatechange){
                    self.onreadystatechange();
                }
            }
        };
        cbh.ignoreComplete = false;
        try{
            if(this.__type =="GET"){
                getURL(this.__url,cbh);
            }else if (this.__type == "POST"){
                postURL(this.__url, data, cbh, this.__contType);
            }
        }catch(e){
            cbh.ignoreComplete=true;
            throw e;
        }
    };
});

/**
    Creates an HTTP request object for retreiving files.
    @return  HTTP request object.
*/
publ getHTTP() {
    var obj;
    try{ //to get the mozilla httprequest object
        obj = new XMLHttpRequest();
    }catch(e){
        try{ //to get MS HTTP request object
            obj=new ActiveXObject("Msxml2.XMLHTTP.4.0");
        }catch(e){
            try{ //to get MS HTTP request object
                obj=new ActiveXObject("Msxml2.XMLHTTP");
            }catch(e){
                try{// to get the old MS HTTP request object
                    obj = new ActiveXObject("microsoft.XMLHTTP");
                }catch(e){
                    try{//to create the ASV request object.
                        obj = new ASVRequest();
                    }catch(e){
                        throw new NoHTTPRequestObject("Neither Mozilla, IE nor ASV found. Can't do HTTP request without them.");
                    }
                }
            }
        }
    }
    return obj;
};
/**
    Sends a request to a server.
    To explain the way the optional arguments work I will give examples:
    simple:
        sendRequest("get", "url")
        sendRequest("post", "url", "data")

    with headers:
        sendRequest("get", "url", [["headername","value"]])
        sendRequest("post", "url", "data", [["headername","value"]])

    with user information:
        sendRequest("get", "url", "user", "pass")
        sendRequest("post", "url", "user", "pass", "data")

    with headers and user information:
        sendRequest("get", "url", "user", "pass", [["headername","value"]])
        sendRequest("post", "url", "user", "pass", "data", [["headername","value"]])

    To make the request asynchronous just add a callback function as the last argument to the calls above.

    @param type              Type of connection (GET, POST, ...).
    @param url                 The URL to retrieve.
    @param user=null        The username for auth.
    @param pass=null        The password. (must be set if user is set!)
    @param data=""          The data to send with the request.
    @param headers=[]      Array of headers. Each element in the array should be another array containing [headername,value].
    @param callback=null   Callback for asynchronous connections. The callback is called after completion and is passed the request object as 1st Parameter.
    @return                     HTTP request object.
*/
publ sendRequest(type, url, user, pass, data, headers, callback){
    var async=false;
    //check if the last argument is a function and treat it as callback;
    if(typeof arguments[arguments.length-1]  == 'function'){
        var async=true;
        callback = arguments[arguments.length-1];
    }
    //treat sencond last(if callback)/last(if no callback) argument as headers
    var headindex=arguments.length-((async || arguments[arguments.length-1] == null) ?2:1);
    //is it an array then it's headers
    if(arguments[headindex] instanceof Array){
        headers=arguments[headindex];
    }else{
        headers=[];
    }
    //are user AND password not specified then assume data as 3rd argument.
    if(typeof user == "string" && typeof pass == "string"){
        if(typeof data != "string"){
            data="";
        }
    }else if (typeof user == "string"){
        data = user;
        user=null;
        pass=null;
    }else{
        user=null;
        pass=null;
    }
    var xmlhttp= getHTTP();
    try{
        if(user!=null){
            xmlhttp.open(type, url, async, user, pass);
        }else{
            xmlhttp.open(type, url, async);
        }
    }catch(e){
        throw new RequestOpenFailed(e);
    }
    //set headers
    for(var i=0;i< headers.length;i++){
        try{//opera 8b does not support setRequestHeader todo:
            xmlhttp.setRequestHeader(headers[i][0], headers[i][1]);
        }catch(e){
        }
    }

    if(async){//set up a callback
        xmlhttp.onreadystatechange=function(){
            if (xmlhttp.readyState==4) {
                callback(xmlhttp);
                xmlhttp.onreadystatechange = null; //help IE with garbage collection
                xmlhttp = null; 
            }else if (xmlhttp.readyState==2){
                //status property should be available (MS IXMLHTTPRequest documentation)
                //in Mozilla it is not if the request failed(server not reachable)
                //in IE it is not available at all ?!
                try{//see if it is mozilla otherwise don't care.
                    var isNetscape = netscape;
                    try{//if status is not available the request failed.
                        var s=xmlhttp.status;
                    }catch(e){//call the callback because Mozilla will not get to readystate 4
                        callback(xmlhttp);
                        xmlhttp = null;
                    }
                }catch(e){

                }
            }
        };
    }

    try{
        xmlhttp.send(data);
    }catch(e){
        if(async){
            callback(xmlhttp, e);
            xmlhttp=null;
        }else{
            throw new SendFailed(e);
        }
    }
    return xmlhttp;
};
/**
    Shorthand for a GET request.
    It calls sendRequest with "GET" as first argument.
    See the sendRequest method for more information.
    @param url                 The URL to retrieve.
    @param user=null        The username for auth.
    @param pass=null        The password. (must be set if user is set!)
    @param headers=[]      Array of headers. Each element in the array should be another array containing [headername,value].
    @param callback=null   Callback for asynchronous connections. The callback is called after completion and is passed the request object as 1st Parameter.
    @return                     HTTP request object.
*/
publ getURL(url, user, pass, headers, callback) {
    var a=["GET"];
    for(var i=0;i<arguments.length;i++){
        a.push(arguments[i]);
    }
    return sendRequest.apply(this,a);
};
/**
    Shorthand for a POST request.
    It calls sendRequest with "POST" as first argument.
    See the sendRequest method for more information.
    @param url                 The URL to retrieve.
    @param user=null        The username for auth.
    @param pass=null        The password. (must be set if user is set!)
    @param data=""          The data to send with the request.
    @param headers=[]      Array of headers. Each element in the array should be another array containing [headername,value].
    @param callback=null   Callback for asynchronous connections. The callback is called after completion and is passed the request object as 1st Parameter.
    @return                     HTTP request object.
*/
publ postURL(url, user, pass, data, headers, callback) {
    var a= ["POST"];
    for(var i=0;i<arguments.length;i++){
        a.push(arguments[i]);
    }
    return sendRequest.apply(this,a);
};


/**
    Returns wether or not the module is usable or not.
    @return True if the module can make HTTP requests, false otherwise.
**/
publ isUsable(){
    try{
        getHTTP();
        return true;                
    }catch(e){
        return false;
    }
};

