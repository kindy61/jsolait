Module("test_iter", "0.0.1", function(mod){
    
    mod.test=function(t,logger){
        logger.log("testing iter module ...");
        
        var range = imprt('iter').range;
        var iter = imprt('iter').iter;
        var filter = imprt('iter').filter;
        var map = imprt('iter').map;
        var list = imprt('iter').list;
        
        
        var a=[0,1,2,3,4,5,6,7,8,9];
        var b=list(range(0,9));
        t.assertEquals('[0,1,2,3,4,5,6,7,8,9] == list(range(0,9))', a.join(","),b.join(","));            
            
        var a=[2,3,4,5,6];
        var b=list(range(2,6));
        t.assertEquals('[2,3,4,5,6] == list(range(2,6))', a.join(","),b.join(","));
        
        var a=[0,3,6,9];
        var b=list(range(0,9,3));
        t.assertEquals('[0,1,2,3,4,5,6,7,8,9] == list(range(0,9,3))', a.join(","),b.join(","));
        
        var a=[0,1,2,3,4,5,6,7,8,9];
        var b=list(a);
        t.assertEquals('a == list(a)', a.join(","),b.join(","));            
                
        var a=[0,1,2,3,4,5,6,7,8,9];
        var b=[];
        iter(range(0,9), function(i){
            b.push(i);
        });
        t.assertEquals('[0,1,2,3,4,5,6,7,8,9] == iter range(0-9)', a.join(","),b.join(","));
        
        var a=[0,1,2,3,4,5,6,7,8,9];
        var b=[];
        iter(a,function(item){
            b.push(item);
        });
        t.assertEquals('iter([0..9])', a.join(","),b.join(","));
        
        var s = ''
        iter(a,function(item, it){
            if(item == 4){
                s+=item;
                return null;
            }else{
                s+=item + ',';
            };
        });
        t.assertEquals('iter(a) with stop during iteration.', s, "0,1,2,3,4");
        
        var a=[0,2,4,6,8,10];
        var n = filter(range(0,10), function(item){
                return item % 2 == 0
        });
        t.assertEquals('filter(range(0,10), mod 2)  == 0,2,4 .. 10', n.join(","), a.join(","));
        
        var a=[2,3,4,5,6,7,8];
        var n = map(range(0,6), function(item){
            return item + 2;
        });
        t.assertEquals('map(range(0,20), item + 2)  == 2 .. 22', n.join(","), a.join(","));
    };
    
    
    mod.profile=function(){
    var iter = imprt('iter').iter;
        var filter = imprt('iter').filter;
        
        var  testing = imprt('testing');
        
        mod.__test__(testing);
        
        var task=function(){
            var s='';
            for(var i=0;i<100;i++){
                s+=i;
            }
        };

        r = [];
        for(var i=0;i<100;i++){
            r[i] = i;
        }
        
        print("for loop \t\t\t" + testing.profile(function(){
            var s=[];
            for(var i=0;i<=99;i++){
                s.push(r[i]);
                task();
            }
        }));

        print("Range iter \t\t" + testing.profile(function(){
            var s=[];
            iter(mod.range(0,99), function(item,i){
                s.push(r[item]);
                task();
            });
        }));

        print("--------------------------------------------------")
        
        print("for loop on Array \t" + testing.profile(function(){
            var s='';
            for(var i=0;i<r.length;i++){
                s+=r[i];
                task();
            }
        }));
        
        print("for in on Array \t\t" + testing.profile(function(){
            var s='';
            for(var i in r){
                s+=r[i];
                task();
            }
        }));
        
        print("--------------------------------------------------")
        
        print("iter Array \t\t\t" + testing.profile(function(){
            var s='';
            iter(r , function(item){
                s+=item;
                task();
            });
        }));
        
        print("for on Array iter \t" + testing.profile(function(){
            var s='';
            for(var i=r.__iter__(); item=i.next() !==undefined;){
                s+= item;
                task();
            }
        }));
        
        print("--------------------------------------------------")

        r = [];
        for(var i=0;i<100;i++){
            r["k"+i] = i;
        }

        print("for in on assoc. Array\t" + testing.profile(function(){
            var s='';
            for(var i in r){
                s+=r[i];
                task();
            }
        }));

        r = {};
        for(var i=0;i<100;i++){
            r["k"+i] = i;
        }

        print("for in on dictionary \t" + testing.profile(function(){
            var s='';
            for(var i in r){
                s+=r[i];
                task();
            }
        }));
        
        print("iter dictionary \t" + testing.profile(function(){
            var s='';
            iter(r, function(key){
                s+=r[key];
                task();
            });
        }));
    
    };
});
