Module("build", "0.0.1", function(mod){
    
    var fs= new ActiveXObject("Scripting.FileSystemObject");
    var wshShell= new ActiveXObject("WScript.Shell");
    var ForReading = 1, ForWriting = 2;
    
    var lang = imprt('lang');
    
    
    mod.parse = function(file){
        var s=file.OpenAsTextStream(ForReading).readAll();
        var p = new lang.Parser(s, this.gn);

        try{
            p.parseStatements(p.next());
        }catch(e){
            var l=p.getPosition();
            throw file.Path + '(' + (l[0] ) + ',' +l[1] + ') ' +   e + ' near:\n' + p._working.slice(0,200);
        } 
    }
    
    mod.compressFile=function(file, out){
        var s=file.OpenAsTextStream(ForReading).readAll();
        var c =new lang.Compressor(s);
        var tkn;
        var out = out.openAsTextStream(ForWriting);
        while((tkn=c.next() )!== undefined){
            out.write(tkn.value);
        }
        out.close();
    }
    
    mod.buildFile = function(src, dest){
        print("parsing", src);
        mod.parse(src);
        print("compressing", src, '->', dest.Path);
        mod.compressFile(src, dest);        
    }    
    
    mod.buildDir = function(src, dest){
        
        var sfe = new Enumerator(src.Files);
        var s;
        for (;!sfe.atEnd(); sfe.moveNext()){
             s = sfe.item();
             if(s.name.slice(-3) == ".js"){
                fs.createTextFile(fs.buildPath(dest,s.name),true);
                mod.buildFile(s, fs.getFile(fs.buildPath(dest,s.name)));
             }else{
                fs.copyFile(s.path, fs.buildPath(dest,s.name));
             }
        }   

        var sfe = new Enumerator(src.SubFolders);
        var s;
        for (;!sfe.atEnd(); sfe.moveNext()){
             s = sfe.item();
             if(s.name !='.svn'){
                try{
                    var fout=fs.createFolder(fs.buildPath(dest,s.name));
                }catch(e){
                    var fout=fs.getFolder(fs.buildPath(dest,s.name));
                }
                mod.buildDir(s, fout);
             }
        }   


    }
    
    
    mod.__main__=function(){
        this.gn = new lang.GlobalNode();
        try{
            fs.createFolder('../build/jsolait');
        }catch(e){
        
        }
        
        mod.buildDir(fs.getFolder('../jsolait/'), fs.getFolder('../build/jsolait'));
        try{
            fs.createFolder('../build/doc');
        }catch(e){
        }
        
        var dp = new lang.DocParser(fs.createTextFile(fs.buildPath('../build/doc', 'doc.xml')), true);
        dp.printGlobalNode(this.gn);
    
    }
})