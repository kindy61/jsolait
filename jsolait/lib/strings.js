/*
    Copyright (c) 2006 Jan-Klaas Kollhof

    This file is part of jsolait

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
    Module providing String functionality (String templates, Fast writable Strings, ...).
    
    @creator Jan-Klaas Kollhof
    @created 2006-03-01
    @lastchangedby       $LastChangedBy: Jan-Klaas Kollhof $
    @lastchangeddate    $Date: 2006-01-30 20:52:35 +0000 (Mon, 30 Jan 2006) $
**/
__version__ = "$Revision: 43$";
   
publ.WordNumberStringSplitter = Class(function(publ,priv,supr){
    publ.__init__=function(s){
        this.s=s;
    };
    
    publ.next=function(){
        if(this.s.length==0){
            return;
        }
        var m = this.s.match(/^(\s*[0-9]+\s*)/);
        
        if(m){
            this.s=this.s.slice(m[1].length);
            return Number(m[1]);
        }else{
            m = this.s.match(/^([^0-9]+)/);
            if(m){
                this.s=this.s.slice(m[1].length);
                return m[1].replace(" ","");
            }else{
                return;
            }
        }
    };
});

publ.naturalCompare=function(a, b){
    var asplitter=new WordNumberStringSplitter(a);
    var bsplitter=new WordNumberStringSplitter(b);
    
    while(true){
        var x = asplitter.next();
        var y = bsplitter.next();
        if(x<y){
            return -1;
        }else if(x>y){
            return 1;
        }else if(x == null && y == null){
            return 0;
        }
    }
};
 

/**
    Fast writable String. 
    Use it when you need a writable stream to generate a large String.
    This is much faster than using string concatinations (e.g. s += "new string data)
**/
publ.WritableString=Class(Array, function(publ,supr){
    /**
        Initializes a WritableString object.
        @param value   The initial value of the WritableString.
    **/
    publ.__init__ = function(value){
        value = value == null ? "": value;
        if(value != ""){
            this.write(value);
        }
    };
    
    /**
        Writes data to the object.
        @param data  The data to write to the object.
    **/
    publ.write = Array.prototype.push;
    
    publ.__str__ = function(){
        return this.join("");
    };
    
    publ.__repr__ = function(){
        return repr(this.join(""));
    };
});

/**
    Default value for String::exec's codeStartDelimiter.
**/
publ.templateCodeStartDelimiter = "<?";
/**
    Default value for String::exec's codeEndDelimiter.
**/
publ.templateCodeEndDelimiter = "?>";


/**
    Executes script inside a template String.
    This is similar to PHP, ASP, JSP, PSP, ... in the way that script code inside special delimiters is executed and everything else is returned as is.
    Each template is compiled to script code which is then executed.
    There is always an 'out' object exposed to the script code run from the template. 
    This object is a WritableString object. The script can use it to write to the output.
    It is possible to add objects to the script scope before it is run by providing a 'locals' parameter.
    Inside the template one can either use the <?= someValue ?>  to insert a value at the location of the script code or
    use the <? out.write(someValue) ?> syntax.
    You can yse any JavaScript statements and constructs inside the template.
    
    e.g.:
        "Template (<?=name?>) run at <? out.write(new Date()) ?>.".exec({name:'example template'}) 
      results in:
        "Template (example template) run at Thu Mar 2 10:53:05 UTC 2006."
    

    @param locals={} A dictionary containing name:value-pairs for local variables exposed to the script that is run from the template.
    @param codeStartDelimiter = templateCodeStartDelimiter  The start of a codeblock.
    @param codeEndDelimiter = templateCodeEndDelimiter     The end of a codeblock.
    @return A string that results from running the template.
**/
String.prototype.exec=function(locals, codeStartDelimiter, codeEndDelimiter){
    codeStartDelimiter = codeStartDelimiter == null ? templateCodeStartDelimiter : codeStartDelimiter;
    codeEndDelimiter = codeEndDelimiter == null ? templateCodeEndDelimiter : codeEndDelimiter;
    
    var s=this + "";
    var code = [];
    var p, text;
    while(s.length>0){
        var p = s.indexOf(codeStartDelimiter);
        if(p>=0){
            text = s.slice(0,p);
            code.push(';out.write("' + text.replace(/\\/g,"\\\\").replace(/\"/g,"\\\"").replace(/\n/g, "\\n").replace(/\r/g,"\\r") + '");');
            s=s.slice(p + codeStartDelimiter.length);
            p = s.indexOf(codeEndDelimiter);
            if(p>=0){
                text = s.slice(0, p);
                s = s.slice(p + codeEndDelimiter.length);
                if(text.slice(0,1) == "="){
                    code.push(';out.write(' + text.slice(1) + ');');
                }else{
                    code.push(text);
                }
            }else{
                throw Exception("No code end dilimiter: '%s' found".format(codeEndDelimiter));
            }
        }else{
            code.push(';out.write("' + s.replace(/\\/g,"\\\\").replace(/\"/g,"\\\"").replace(/\n/g, "\\n").replace(/\r/g,"\\r") + '");');
            s="";
        }
    }
    
    var sout=new WritableString();
    var params  = [sout];
    
    var paramNames = ["out"];
    for(var key in locals){
        paramNames.push(key);
        params.push(locals[key]);
    }
    try{
        var f = new Function(paramNames.join(","), code.join(""));
    }catch(e){
        throw new Exception("Error compiling template:\n\n%s".format(code.join("")),e);
    }
    f.apply(sout, params);
    return str(sout);
};

