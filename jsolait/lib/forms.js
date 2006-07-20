/*
  Copyright (c) 2005-2006 Jan-Klaas Kollhof
  
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
    A module providing HTML forms functionality.
    
    @creator                 Jan-Klaas Kollhof
    @created                2005-03-20
    @lastchangedby       $LastChangedBy$
    @lastchangeddate    $Date$
**/

__version__="$Revision$";
/**
    A class that resembles the functionality of an HTML form.
    One can access the elements using the elements property of the form or
    by accessing the element as a named property of the form object(formObj.elemName ...).
**/
publ.Form=Class(function(publ, supr){
    ///Contains the form elements.
    publ.elements=[];
    ///The URL to submit the form to.
    publ.action="";
    ///The method to use for subitting the form(GET/POST)
    publ.method="GET";
    
    /**
        Initializes a Form object.
        @param action=""  The URL to submit the form to.
        @param method="GET"  The method to use for submitting(GET, POST).
    **/
    publ.__init__=function(action, method){
        this.elements=[];
        this.action= (action==null)?"":action;
        this.method= (method==null)?"GET":method;
    };
    
    /**
        Adds a new form element to the form or sets the value of an existing element. 
        @param name The name of the form element.
        @param value The value of the form element.
        @return The Element set.
    **/
    publ.set=function(name, value){
        var f = null;
        for(var i=0;i<this.elements;i++){
            if(name == this.elements[i].name){
                f = this.elements[i];
                f.value = value;
            }
        }
        if(f == null){//add a new element
            f = new Element(name, value);
            this.elements.push(f);
        }
        //add the element as a properyt to the form object
        //if that name is not taken yet.
        if(this[name] == null){
            this[name] = f;
        }
        return f;
    };
    
    /**
        Encodes the form to a form data String.
        @return The encoded form.
    **/
    publ.encode=function(){
        var data=[];
        for(var i=0;i<this.elements.length;i++){
            data.push(this.elements[i].encode());
        }
        return data.join("&");
    };
    
    /**
        Creates a query URL using the action property and
        appending it with a "?" and the URL encoded data.
        This can be used for GET requests.
        @return The query string of the form.
    **/
    publ.queryString=function(){
        return this.action + "?" + this.encode();
    };
            
    /**
        Submits the form to the server, reloading the page.
        In HTML a hidden form will be generated which is submitted.
        In SVG only forms with GET method wil be submitted by setting the browsers 
        location to the action URL appended with the data.
    **/
    publ.submit=function(){
        if(this.method.toLowerCase() == "get"){
            try{//this should work in HTML browsers
                location.href = this.queryString();
            }catch(e){
                try{//this is a fallback for SVG
                    var s = 'location="' + this.queryString().replace(/(["\\])/g, '\\$1') + '"';
                    browserEval(encodeURI(s)); 
                }catch(e){
                    throw "Cannot set new location.";
                }
            }
        }else{//this will only work in HTML
            var frm = document.createElement("form");
            frm.setAttribute("action", this.action);
            frm.setAttribute("method", this.method);
            document.getElementsByTagName("body")[0].appendChild(frm);
            for(var i=0;i<this.elements.length;i++){
                var elem = this.elements[i];
                var inp = document.createElement("input");
                inp.setAttribute("type", "hidden");
                inp.setAttribute("name", elem.name);
                inp.setAttribute("value", elem.value);
                frm.appendChild(inp);
            }
            frm.submit();
        }
    };
    
    /**
        Submits the form to the server without reloading the page.
        The urllib module is used to accomplish this by sending a request to the server.
        See urllib for information on callback usage and return values.
    **/
    publ.submitNoReload=function(callback){
        if(this.action && this.method){
            var urllib = imprt("urllib");
            
            switch(this.method.toLowerCase()){
                case "get":
                    return urllib.getURL(this.queryString(),[["Content-Type", "application/x-www-form-urlencoded"]], callback);
                    break;
                case "post":
                    return urllib.postURL(this.action, this.encode(),[["Content-Type", "application/x-www-form-urlencoded"]], callback);
                    break;
                default:
                    throw "Method can only be POST or GET but is: " + this.method;
            }
        }else{
            throw "No action and/or method defined";
        }
    };
});
    
/**
    A form element class.
**/
publ.Element=Class(function(publ, supr){
    ///The name of the element.
    publ.name="";
    ///The value of the elenet.
    publ.value="";
    
    /**
        Initializes a form element.
        @param name  The name of the element.
        @param value  The value of the element.
    **/
    publ.__init__=function(name, value){
        this.name = name;
        this.value = value;
    };
    /**
        Encodes an element as form data.
        @return The encoded element data.
    **/
    publ.encode=function(){
        return encodeURIComponent(this.name) + "=" + encodeURIComponent(this.value);
    };
}) ;   

publ.__main__=function(){
    var fm = new Form("http://localhost/echoform.py", "get");
    print("testing all sorts of chars, the should be encoded.");
    fm.set("testchars", "abcdefghijklmnopqrstuvwxyz1234567890 \n\t!@#$%^&*()_+-=[]{};'\\:\"|,./<>?");
    print(fm.encode());
    try{
        print(fm.submitNoReload().responseText);
    }catch(e){
        print(e);
    }
    fm.method="post";
    print(fm.submitNoReload().responseText);
};
