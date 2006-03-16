Module("build", "0.0.1", function(mod){
    
    mod.sourcePath = '../jsolait';
    mod.buildPath = '../build/jsolait';
    mod.docPath = '../build/doc';
    
    mod.jsolaitBaseURI='./jsolait';
    mod.libFolders=['lib'];
    
    var lang = imprt('lang');
    
    var fs= new ActiveXObject("Scripting.FileSystemObject");
    var wshShell= new ActiveXObject("WScript.Shell");
    var ForReading = 1, ForWriting = 2;

    var Set = imprt('sets').Set;
    mod.preprocessFiles=new Set([fs.getFile(fs.buildPath(mod.sourcePath, 'jsolait.js')).Path]);
    
    
    mod.parse = function(file){
        var s=file.OpenAsTextStream(ForReading).readAll();
        
        if(mod.preprocessFiles.contains(file.Path)){
            print('preprossessing', file);
            s=mod.preprocess(s);
        }
        
        var p = new lang.Parser(s, mod.gn);
        
        try{
            p.parseStatements(p.next());
        }catch(e){
            var l=p.getPosition();
            throw file.Path + '(' + (l[0] ) + ',' +l[1] + ') ' +   e + ' near:\n' + p._working.slice(0,200);
        } 
        
        return s;
    };
        
    mod.preprocess=function(s){
        s=s.split(/\/\*@(moduleURIs) begin\*\/((\/\*@\1 end\*\/){0}|.|\n)*\/\*@\1 end\*\//);
        
        if(s.length>1){
            var mods=[];
            for(var i=0;i<mod.libFolders.length;i++){
                var libFolder = mod.libFolders[i];
                try{
                    var fldr = fs.getFolder(fs.buildPath(mod.sourcePath,libFolder));
                }catch(e){
                    var fldr=null;
                }
                if(fldr){
                    var sfe = new Enumerator(fldr.Files);
                    for (;!sfe.atEnd(); sfe.moveNext()){
                         var f = sfe.item();
                         if(f.name.slice(-3) == ".js"){
                            var modName= f.name.slice(0,-3);
                            mods.push('"' + modName + '":"%(baseURI)s/'+libFolder+'/' + modName + '.js"');
                         }
                    }    
                    var sfe=new Enumerator(fldr.SubFolders);
                    for (;!sfe.atEnd(); sfe.moveNext()){
                        var f = sfe.item();
                        mods.push('"' + f.name  + '":"%(baseURI)s/'+libFolder+'/' + f.name + '/"');
                    }
                }
            }

            modDirs='mod.knownModuleURIs={' + mods.join(',') + '};';
            s=s.join(modDirs);
        }else{
            s=s.join("mod.knownModuleURIs={};");   
        }
        s=s.replace(/\/\*@(baseURI) begin\*\/((\/\*@\1 end\*\/){0}|.|\n)*\/\*@\1 end\*\//, 'mod.baseURI="' + mod.jsolaitBaseURI + '";');
        return s;
    };
    
    mod.compressFile=function(s, out){
        var c =new lang.Compressor(s);
        var tkn;
        var out = out.openAsTextStream(ForWriting);
        while((tkn=c.next() )!== undefined){
            out.write(tkn.value);
        }
        out.close();
    };
    
    mod.buildFile = function(src, dest){
        print("parsing", src);
        var s= mod.parse(src);
        print("compressing", src, '->', dest.Path);
        mod.compressFile(s, dest);        
    }    ;
    
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
    };
    
    
    mod.__main__=function(){
        
        this.gn = new lang.GlobalNode();
        try{
            fs.createFolder(mod.buildPath);
        }catch(e){
        
        }
                       
        
        mod.buildDir(fs.getFolder(mod.sourcePath), fs.getFolder(mod.buildPath));
        try{
            fs.createFolder(mod.docPath);
        }catch(e){
        }
        
        var dp = new lang.DocParser(fs.createTextFile(fs.buildPath(mod.docPath, 'doc.xml')), true);
        dp.printGlobalNode(this.gn);
        
        //run unittest
        
        var s =mod.__sourceURI__.slice(0,-14) + "test"
        jsolait.moduleSearchURIs.unshift(s);
        imprt('test').test(imprt('testing'), {log:print});
    };
});
