__version__ = "$Revision: 44 $";
import testing;
import sets;

def test(logger){
    var s1=new sets.Set("0123456".split(""));
    var s2=new sets.Set("3456789".split(""));
    logger.log("testing sets...");

    testing.assertEquals("checking %s | %s".format(s1, s2),
                                new sets.Set("0123456789".split("")), s1.union(s2));

    testing.assertEquals("checking %s | %s".format(s2, s1),
                                new sets.Set("0123456789".split("")), s2.union(s1));

    testing.assertEquals("checking %s & %s".format(s1, s2),
                                 new sets.Set("3456".split("")), s1.intersection(s2));

    testing.assertEquals("checking %s & %s".format(s2, s1),
                                new sets.Set("3456".split("")), s2.intersection(s1));

    testing.assertEquals("checking %s - %s".format(s1, s2),
                                new sets.Set("012".split("")), s1.difference(s2));

    testing.assertEquals("checking %s - %s".format(s2, s1),
                                new sets.Set("789".split("")), s2.difference(s1));

    testing.assertEquals("checking %s ^ %s".format(s1, s2),
                                new sets.Set("012789".split("")),s1.symmDifference(s2));

    testing.assertEquals("checking %s ^ %s".format(s2, s1),
                                new sets.Set("012789".split("")),s2.symmDifference(s1));
};

def __main__(){
    test({log:print})
};
