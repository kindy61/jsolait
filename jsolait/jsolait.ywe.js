/*
    Copyright (c) 2003-2005 Jan-Klaas Kollhof

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
    The helper script for using jsolait in the yahoo widget engine.
    It provides the core functionalities for creating classes, modules and for importing modules.

    @author Jan-Klaas Kollhof
    @lastchangedby $LastChangedBy$
    @lastchangeddate $Date$
    @revision $Revision$
**/

include(typeof JsolaitInstallPath == 'undefined' ? "./jsolait/jsolait.js" : JsolaitInstallPath);

jsolait.__imprt__ = function(name){

    if(jsolait.modules[name]){ //module already loaded
        return jsolait.modules[name];
    }else{
        var src,modPath;
        
        var searchURIs = [];
        
        if(jsolait.knownModuleURIs[name] != undefined){
            searchURIs.push(jsolait.knownModuleURIs[name].format(jsolait));
        }else{
            name = name.split('.');
            if(name.length>1){
                if(jsolait.knownModuleURIs[name[0]] != undefined){
                    var uri = jsolait.knownModuleURIs[name[0]].format(jsolait);
                    searchURIs.push("%s/%s.js".format(uri, name.slice(1).join('/')));
                }
                searchURIs.push("%s/%s.js".format(jsolait.packagesURI.format(jsolait),name.join('/')));
            }
            
            for(var i=0;i<jsolait.moduleSearchURIs.length; i++){
                searchURIs.push("%s/%s.js".format(jsolait.moduleSearchURIs[i].format(jsolait), name.join("/")));
            }
            name =  name.join(".");
        }
        
        var failedURIs=[];
        for(var i=0;i<searchURIs.length;i++){
            try{
                include(searchURIs[i]);
                if(jsolait.modules[name] != null){
                    return jsolait.modules[name];
                }else{
                    throw new jsolait.ImportFailed(name, failedURIs, new jsolait.Exception("Module did not register itself and cannot be imported. " + name));
                }
                break;
            }catch(e){
                failedURIs.push(searchURIs[i]);
            }
        }
        throw new jsolait.ImportFailed(name, failedURIs, new  jsolait.Exception("Module source could not be included. " + name));
    }
};
