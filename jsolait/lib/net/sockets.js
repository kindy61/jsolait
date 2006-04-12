/*
    Copyright (c) 2004-2006 Jan-Klaas Kollhof

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
    Provides networking sockets.
**/
Module("net.sockets", "0.0.1", function(mod){

    //the flash object that provides the sockets
    var flashSocketProvider;
    
    var flashSocketWrappers={};

    mod.prepare=function(){
        addFlashToPage();
    };
    
    /**
        Returns a new Socket object.
    **/
    mod.createSocket=function(){
        return new mod.FlashSocket();
    };
    
    /**
        Basic Socket class.
    **/
    mod.Socket=Class(function(publ,priv,supr){
         
        publ.connect=function(host, port){};
        
        publ.send=function(data){};
        
        publ.close=function(){};
        
        publ.onConnect=function(success){};
        
        publ.onData=function(data){};
        
        publ.onClose=function(){};
    });
    
    
    mod.FlashSocket=Class(mod.Socket, function(publ,priv,supr){
        
        publ.connect=function(host, port){
            if(this.id != null){
                this.close();
            }else{
                this.id = flashSocketProvider.newSocket();
                flashSocketWrappers[this.id] = this;
            }
            flashSocketProvider.connect(this.id, host, port);
        };
        
        publ.send=function(data){
            if(this.id != null){
                flashSocketProvider.send(this.id, data);
            }else{
                throw new mod.Exception("Socket not connected");
            }
        };
        
        publ.close=function(){
            flashSocketProvider.close(this.id);
            delete this['id'];
        };
    });
    
    
    var ie= '<object  id="__SocketProvider__"  classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"  style="visibility:hidden;" width="0" height="0" ><param name="allowScriptAccess" value="sameDomain" /><param name="movie" value="%s" /></object>';
    var moz = '<embed id="__SocketProvider__" src="%s" width="100" height="30"  allowScriptAccess="sameDomain" type="application/x-shockwave-flash" />';
    
    var addFlashToPage=function(){
        var url = jsolait.baseURI + "/lib/net/SocketProvider.swf";
        if (navigator.appName.indexOf("Microsoft") != -1) {
            document.getElementsByTagName('body')[0].innerHTML+=ie.format(url);
        }else{
            var d = document.createElement('embed');
            d.setAttribute("src", url);
            d.setAttribute("width", "0");
            d.setAttribute("height", "0");
            d.setAttribute("style", "visibility:hidden;");
            d.setAttribute( "type","application/x-shockwave-flash");
            d.setAttribute( "allowScriptAccess","sameDomain");
            d.setAttribute( "id","__SocketProvider__");
            document.documentElement.appendChild(d);
            flashSocketProvider=d;
        }
    };
        
    mod.handleFlashMessage=function(id, type, data, data2){
        if(type=="socketProviderLoaded"){
            if (flashSocketProvider == null) {
                flashSocketProvider=document.getElementById("__SocketProvider__");
            }
        }else{
            var s = flashSocketWrappers[id];
            if(s[type] != null){
                s[type].call(s, data, data2);
            }
            if(type == "onClose"){
                delete flashSocketWrappers[id];
            }
        }
    };
    
   
    
    mod.isReady = function(){
        return flashSocketProvider != null;
    };
});
