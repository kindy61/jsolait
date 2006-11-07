/*
  Copyright (c) 2004 Jan-Klaas Kollhof
  
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
    Module providing language services like tokenizing and parsing JavaScript code.
    
    @creator                 Jan-Klaas Kollhof
    @created                2004-03-14
    @lastchangedby       $LastChangedBy$
    @lastchangeddate    $Date$
*/

__version__="$Revision$";

import sets ;

var extractQoutedText=function(s, startEndChar){
    s=s.slice(startEndChar.length);
    var rs=startEndChar;
    var p= s.indexOf(startEndChar);
    while(p >= 0){ 
        if(s.charAt(p-1) == "\\"){
            rs+=s.slice(0,p+1);                            
            s=s.slice(p+1); 
        }else{
            return rs+s.slice(0,p+1);
        }
        p=s.indexOf(startEndChar);
    }
    throw new Exception(startEndChar + " expected.");
};
    
var extractSLComment=function(s){
    var p = s.search(/\n/);
    if(p>=0){
        return s.slice(0,p);
    }else{
        return s;
    }
};

var extractMLComment=function(s){
    var p = s.search(/\*\//);
    if(p>=0){
        return s.slice(0,p+2);
    }else{
        throw new Exception("End of comment expected.");
    }
};
    
class Token({
    publ __init__(value, pos, err){
        this.value = value;
        this.pos = pos;
        this.err= err;
    };
    
    publ toString(){
        return "[" + this.constructor.__name__+ " " + this.value+"]";
    };
});

class TokenWhiteSpace  extends Token({});
class TokenPunctuator  extends Token({});
class TokenNewLine  extends Token({});
class TokenNumber  extends Token({});
class TokenKeyword  extends Token({});
class TokenString  extends Token({});
class TokenRegExp  extends Token({});
class TokenIdentifier  extends Token({});
class TokenComment  extends Token({});
class TokenDocComment  extends TokenComment({});


var arithmaticOperators = new sets.Set(['/','+','-','*','%']);

var relationalOperators = new sets.Set(['<','>','<=','>=', 'instanceof']);

var equalityOperators = new sets.Set(['===','!==','==','!=']); 

var unaryPrefixOperators = new sets.Set(['!', '++', '--', '-', '~', 'typeof']);

var unaryPostfixOperators = new sets.Set(['++', '--']);

var unaryOperators = unaryPrefixOperators;

var bitwiseShiftOperators = new sets.Set(['>>', '<<', '>>>']);

var binaryBitwiseOperaters = new sets.Set(['&','|', '^']);

var binaryLogicalOperators = new sets.Set(['||', '^^', '&&']);

var conditionalOperators = new sets.Set(['?']);

var propertyOperators = new sets.Set(['.']);

var assignmentOperators = new sets.Set(['=','+=','-=','*=','%=','&=','|=','^=','/=', '<<=','>>=','>>>=']);
    
var operators=(new sets.Set()).unionUpdate(
                arithmaticOperators).unionUpdate(
                relationalOperators).unionUpdate(
                equalityOperators).unionUpdate(
                unaryOperators).unionUpdate(
                bitwiseShiftOperators).unionUpdate(
                binaryBitwiseOperaters).unionUpdate(
                binaryLogicalOperators).unionUpdate(
                propertyOperators).unionUpdate(
                conditionalOperators).unionUpdate(
                assignmentOperators);
    
var punctuators = (new sets.Set(['{','}','(',')','[',']',';',',',':'])).unionUpdate(operators);
   

var valueKeywords = new sets.Set(['null', 'undefined', 'true', 'false', 'this']); //todo is this included

var operatorKeywords = new sets.Set(['instanceof', 'typeof', 'new']);
    
var jsolaitStartStatementKeywords = new sets.Set(['Module', 'mod', 'publ']);
    
var startStatementKeywords = new sets.Set(['var','return','for','switch','while','continue','break', 'with','if','throw','delete','try', 'this', 'function']);

var subStatementKeywords =  new sets.Set(['else', 'var', 'catch', 'case','default']);

var startStatementToken = startStatementKeywords.union(new sets.Set(['(']));

var keywords=(new sets.Set()).unionUpdate(
                valueKeywords).unionUpdate(
                operatorKeywords).unionUpdate(
                startStatementKeywords).unionUpdate(
                subStatementKeywords).unionUpdate(
                startStatementToken);
                
    
var whiteSpace=/^[\s\t\f]+/;

var stringSQ=/^'((\\[^\x00-\x1f]|[^\x00-\x1f'\\])*)'/;
var stringDQ=/^"((\\[^\x00-\x1f]|[^\x00-\x1f"\\])*)"/;
var regExp =/^\/(\\[^\x00-\x1f]|\[(\\[^\x00-\x1f]|[^\x00-\x1f\\\/])*\]|[^\x00-\x1f\\\/\[])+\/[gim]*/;                
        
var identifiers=/^[a-zA-Z_$][\w_$]*\b/;
var intNumber = /^-?[1-9]\d*|0\b/;
var floatNumber = /^-?([1-9]\d*|0)\.\d+/;
var expNumber = /^-?([1-9]\d*|0)\.\d+e-?[1-9]\d*/;
var hexNumber = /^-?0x[0-9a-fA-F]+/;


class Tokenizer({
    
    publ __init__(s){
        this._working = s;
        this.source =s;
    };
            
    publ next(){
        if(this._working ==""){
            return undefined;
        } 
        var s1 = this._working.charAt(0);
        var s2 = s1 + this._working.charAt(1);
        var s3 = s2 + this._working.charAt(2);
        
        var isWS=false;
        if(s1 ==" " || s1 =="\t" || s1 =="\f"){
            tkn= new TokenWhiteSpace(whiteSpace.exec(this._working)[0]);
            isWS=true;
        }else if(s1 =="\n" || s1 =="\r"){
            tkn = new TokenNewLine(s1);
        }else if(s1=='"' || s1=="'"){
            if(tkn = (s1=="'"? stringSQ : stringDQ).exec(this._working)){
                tkn = new TokenString(tkn[0]);
            }else{
                throw "String expected";
            }
        }else if(s3 == "///"){
            tkn = new TokenDocComment(extractSLComment(this._working), this.source.length - this._working.length);
        }else if(s3 == "/**"){
            tkn = new TokenDocComment(extractMLComment(this._working), this.source.length - this._working.length);
        }else if(s2 == "//"){
            tkn = new TokenComment(extractSLComment(this._working), this.source.length - this._working.length);
        }else if(s2 =="/*"){
            tkn = new TokenComment(extractMLComment(this._working), this.source.length - this._working.length);        
        }else if(punctuators.contains(s3)){
            tkn = new TokenPunctuator(s3);
        }else if(punctuators.contains(s2)){
            tkn = new TokenPunctuator(s2);
        }else if(punctuators.contains(s1)){
            if(s1 == "/" && (",(=+[{".indexOf(this._lastNonWSTkn.value) > -1)){
                if(tkn=regExp.exec(this._working)){
                    tkn = new TokenRegExp(tkn[0]);
                }else{
                    tkn = new TokenPunctuator(s1);  
                }
            }else{
                tkn = new TokenPunctuator(s1);  
            }
        }else if(tkn = identifiers.exec(this._working)){
            tkn = tkn[0];
            if(keywords.contains(tkn)){
                tkn = new TokenKeyword(tkn);
            }else{
                tkn = new TokenIdentifier(tkn);
            }
        }else if(tkn=hexNumber.exec(this._working)){
            tkn = new TokenNumber(tkn[0], this.source.length - this._working.length);
        }else if(tkn=expNumber.exec(this._working)){
            tkn = new TokenNumber(tkn[0], this.source.length - this._working.length);
        }else if(tkn=floatNumber.exec(this._working)){
            tkn = new TokenNumber(tkn[0], this.source.length - this._working.length);
        }else if(tkn=intNumber.exec(this._working)){
            tkn = new TokenNumber(tkn[0], this.source.length - this._working.length);
        }else{
            throw "Unrecognized token at char %s, near:\n%s".format(this.source.length - this._working.length, this._working.slice(0,50));  
        }
        
        if(! isWS){
            this._lastNonWSTkn = tkn;
        }
        this._working=this._working.slice(tkn.value.length);
        return tkn;    
    };
            
    publ nextNonWhiteSpace(newLineIsWS){
        while(tkn=this.next()){
            if(!(tkn instanceof TokenWhiteSpace)){
                if(!(newLineIsWS && ( tkn instanceof TokenNewLine))){
                    break;
                }
            }
        }
        return tkn;
    };
    
    publ __iter__(){
        return new Tokenizer(this.source);
    };
    
    publ getPosition(){
        var a=this.source.split("\n");
        var p=this.source.length-this._working.length;
        for(var i=0;i<a.length;i++){
            p=p-(a[i].length+1);
            
            if(p<=0){
                return [i+1, a[i].length+p];
            }
        }
    };
});

var LookAhead=1;

class Script({
    publ __init__(source){
        this.publics=[];
        this.modules=[];
        this.tokens=new Tokenizer(source);
        
    };
    
    publ parse(){
        var tkn = this.tokens.next(IgonreWSAndNewLine, LookAhead);
        while(tkn!==undefined){
            if(tkn instanceof TokenDocComment){
                this.parseDocComment();
            }else if(this['parseStatement_' + tkn.value]){
                this['parseStatement_' + tkn.value].call(this);
            }else if(tkn instanceof TokenIdentifier){
                this.parseStatement_callOrAssignment();
            }else{
                throw "Beginning of a statement expected but found %s".format(tkn);
            }
        }
    };
    
    
    publ parseStatement_callOrAssignment(){
        
    };
    
    publ parseStatement_Module(){
        var tkn = this.lookAheadNonWhitespace();
        if(tkn.value = "("){
            var m = this.appendChild(new ModuleNode(this));
            this.publics.push(m);
            m.parse();
        }else{
            throw "Module not allowed here";
        }
    };
});
    
class CodeNode({
    publ __init__(){
        this.childNodes=[];
        this.dependencies=[];
    };
    
    publ appendChild(child){
        this.childNodes.push(child);
        child.parentNode = this;
        return child;
    };
    
    publ dependencies=[];
    publ parentNode;
    publ childNodes=[];
});


class PropertyNode extends CodeNode({
    publ name='';
    publ value=null;
});


class ScopeBase extends CodeNode({
    publ __init__(parentScope){
        this.childNodes=[];
        this.publics=[];
        this.parameters=[];
        this.dependencies=[];
        
    };
    
    publ addPublic(node){
        this.appendChild(node);
        this.publics.push(node);
        return node;
    };
    
    publ name='';
});

class GlobalNode extends ScopeBase({
}); 
  
class ModuleNode extends ScopeBase({

});

class ClassNode extends ScopeBase({
});


class MethodNode extends ScopeBase({
    publ name='';
});


class Parser extends Tokenizer({
    
    publ __init__(s, globalNode){
        supr.__init__.call(this, s);
        globalNode = globalNode === undefined ? new GlobalNode() : globalNode;
        this.currentNode=globalNode;
        this.globalNode= globalNode;
        this.lastDoc = '';
    };
    
    var isStatementStartToken=function(tkn){
        return (tkn instanceof TokenIdentifier) || (startStatementToken.contains(tkn.value));
    };
    
    publ nextNonWhiteSpaceExpect(expected, nlIsWS){
        var tkn = this.nextNonWhiteSpace();
        return this.expect(expected, tkn);
    };
    
    publ getDocumentation(){
        var d=this.lastDoc;
        this.lastDoc='';
        return d;
    };
    
    publ expect(expected, tkn){
        if(typeof expected == 'string'){ 
            if(tkn.value == expected){
                return tkn;
            }else{
                throw "Expected '%s' but found %s".format(expected , tkn);
            }
        }else if(expected instanceof Token){
            if(tkn.value == expected.value){
                return tkn;
            }else{
                throw "Expected %s but found %s".format(expected , tkn);
            }
        }else{
            if(tkn instanceof  expected){
                return tkn;
            }else{
                throw "Expected token of type %s but found %s".format(expected, tkn);
            }
        }
    };
    
    
    publ parseSource(){
        var tkn = this.parseStatements(this.next());
        if(tkn !== undefined){
            throw Expected("Expected end of source but found % .".format(tkn));
        }
    };
    
    publ parseStatements(tkn){
        while(tkn!==undefined){
            if(tkn instanceof TokenDocComment){
                tkn = this.parseDocComment(tkn);
            }else if(isStatementStartToken(tkn)){ //todo: create a TokenStatementStart
                tkn = this.parseStatement(tkn);
            }else if((tkn instanceof TokenWhiteSpace) || (tkn instanceof TokenNewLine) || (tkn instanceof TokenComment)){
                //ignore WS, NL and comments
                tkn = this.nextNonWhiteSpace(true);
            }else{
                return tkn;
            }
        }
        return tkn;
    };
    
    publ parseDocComment(tkn){
        if(tkn.value.charAt(2) == '*'){
            this.lastDoc=tkn.value.slice(3, -3);
        }else{
            this.lastDoc=tkn.value.slice(3);
        }
        tkn = this.nextNonWhiteSpace(true);
        return tkn;
    };
            
    publ parseStatement(tkn){
    
        if(this['parseStatement_' + tkn.constructor.__name__]){
            tkn = this['parseStatement_' + tkn.constructor.__name__].call(this,tkn);
        }else if(this['parseStatement_' + tkn.value]){
            tkn = this['parseStatement_' + tkn.value].call(this,tkn);
        }else if(tkn instanceof TokenIdentifier){//function call or assignment statement
            tkn = this.parseExpression(tkn);
            tkn = this.parseEndOfStatement(tkn);
        }else{
            throw "Beginning of a statement expected but found %s".format(tkn);
        }
        return tkn;
    };
    
    publ parseEndOfStatement(tkn){
        
        if((tkn !== undefined ) && (tkn.value == ";")){
            return this.nextNonWhiteSpace(true);
        }else{    
            throw "Expected ';' at end of statement but found %s".format(tkn);
        }
    };
    
    publ parseStatement_this(tkn){
        tkn = this.parseExpression(tkn);
        tkn = this.parseEndOfStatement(tkn);
        return tkn;
    };
    
    publ parseStatement_var(tkn){
        tkn = this.parseExpression_var(tkn);
        tkn = this.parseEndOfStatement(tkn);
        return tkn;
    };
    
    publ parseStatement_break(tkn){
        //todo: label
        tkn= this.nextNonWhiteSpace();
        return this.parseEndOfStatement(tkn);
    };        
    
    publ parseStatement_return(tkn){
        tkn= this.parseExpression(this.nextNonWhiteSpace());
        return this.parseEndOfStatement(tkn);
    };
    
    publ parseStatement_continue(tkn){
        //todo label ?!?!?!
        tkn= this.nextNonWhiteSpace();
        return this.parseEndOfStatement(tkn);
    };
    
    publ parseStatement_delete(tkn){
        tkn= this.parseExpression_objectAccess(this.nextNonWhiteSpace());
        return this.parseEndOfStatement(tkn);
    };

    publ parseStatement_for(tkn){
        tkn=this.nextNonWhiteSpaceExpect('(');
        tkn=this.parseCommaExpressions(this.nextNonWhiteSpace());
        if(tkn.value=='in'){
            tkn= this.nextNonWhiteSpace();
            tkn=this.parseExpression_objectAccess(tkn);
        }else{
            this.expect(';', tkn);
            tkn=this.parseCommaExpressions(this.nextNonWhiteSpace(true));
            this.expect(';', tkn);
            tkn=this.parseCommaExpressions(this.nextNonWhiteSpace(true));
        }
        this.expect(')', tkn);
        return this.parseBlock(this.nextNonWhiteSpace(true));
    };
    
    //todo: same as parseParensExpression ?
    publ parseCondition(tkn){
        this.expect('(', tkn);
        tkn = this.parseExpression(this.nextNonWhiteSpace());
        this.expect(')', tkn);
        return this.nextNonWhiteSpace(true);
    };
    
    publ parseStatement_while(tkn){
        tkn = this.parseCondition(this.nextNonWhiteSpace());
        return this.parseBlock(tkn);
    };
    
    publ parseStatement_if(tkn){
        tkn = this.parseCondition(this.nextNonWhiteSpace());
        tkn = this.parseBlock(tkn);
        if(tkn.value == "else"){
            tkn = this.nextNonWhiteSpace(true);
            if(tkn.value=='if'){
                tkn = this.parseStatement_if(tkn);
            }else{
                tkn = this.parseBlock(tkn);
            }
        }
        return tkn;
    };
    
    publ parseStatement_switch(tkn){
        tkn = this.parseCondition(this.nextNonWhiteSpace());
        this.expect('{', tkn);
        tkn = this.nextNonWhiteSpace(true);
        while((tkn.value == "}") || (tkn.value == "case") || (tkn.value == "default")){
            if(tkn.value == "}"){
                return this.nextNonWhiteSpace(true);
            }else{
                if(tkn.value =="case"){
                    tkn = this.parseExpression(this.nextNonWhiteSpace());
                }else{
                    tkn = this.nextNonWhiteSpace();
                }
                this.expect(':', tkn);
                tkn=this.parseStatements(this.nextNonWhiteSpace(true));
            }
        }
        throw "Expected 'case', 'default' or '}'  inside switch block but found %s".format(tkn);
    };
    
    publ parseStatement_throw(tkn){
        var tkn = this.parseExpression(this.nextNonWhiteSpace());
        return this.parseEndOfStatement(tkn);
    };
    
    publ parseStatement_try(tkn){
        tkn = this.parseBlock(this.nextNonWhiteSpace(true));
        this.expect('catch', tkn);
        tkn = this.nextNonWhiteSpaceExpect('(');
        tkn = this.nextNonWhiteSpaceExpect(TokenIdentifier);
        tkn = this.nextNonWhiteSpaceExpect(')');
        tkn = this.nextNonWhiteSpace(true);
        tkn = this.parseBlock(tkn);
        return tkn;
    };
            
    publ parseStatement_Module(tkn){
        tkn=this.nextNonWhiteSpace();
        if(tkn.value == '('){
        
            this.currentNode = this.currentNode.addPublic(new ModuleNode());
            tkn=this.nextNonWhiteSpaceExpect(TokenString, true);
            this.currentNode.name = tkn.value.slice(1,-1);
            
            tkn=this.nextNonWhiteSpaceExpect(',');
            tkn=this.nextNonWhiteSpaceExpect(TokenString, true);
            
            this.currentNode.version = tkn.value.slice(1,-1);
            this.currentNode.description = this.getDocumentation();
                        
            tkn=this.nextNonWhiteSpaceExpect(',');
            tkn=this.nextNonWhiteSpaceExpect('function', true);
            tkn=this.nextNonWhiteSpaceExpect('(');
            tkn=this.nextNonWhiteSpaceExpect('mod', true);
            tkn=this.nextNonWhiteSpaceExpect(')', true);
            tkn=this.nextNonWhiteSpaceExpect('{');
            tkn=this.parseBlock(tkn);
            this.expect(")", tkn);
            tkn = this.nextNonWhiteSpace();
            tkn = this.parseEndOfStatement(tkn);
        }else if(tkn.value=='='){
            tkn = this.nextNonWhiteSpaceExpect('function');    
            this.currentNode = this.currentNode.addPublic(new MethodNode());
            tkn = this.parseExpression_function(tkn);
            tkn = this.parseEndOfStatement(tkn);
        }else if(tkn.value=='.'){
            tkn=this.next();
            tkn = this.parseExpression(tkn);
            tkn = this.parseEndOfStatement(tkn);
            return tkn;
        }else{
            return tkn;
        }
        
        this.currentNode = this.currentNode.parentNode;
        return tkn;
    };
                
    publ parseStatement_Class(tkn){
        tkn=this.nextNonWhiteSpace();
        if(tkn.value=='='){
            tkn=this.nextNonWhiteSpaceExpect('function');
            tkn = this.parseExpression_function(tkn);
        }else if(tkn.value=='.'){
            tkn=this.next();
            tkn=this.parseExpression(tkn);
        }
        
        tkn = this.parseEndOfStatement(tkn);
        return tkn;
    };
    
    publ parseStatement_imprt(tkn){
        tkn=this.nextNonWhiteSpace();
        if(tkn.value='='){
            tkn = this.nextNonWhiteSpaceExpect('function');    
            tkn = this.parseExpression_function(tkn);
            tkn = this.parseEndOfStatement(tkn);
        }else{
            tkn=this.expect('(');
            tkn =this.nextNonWhiteSpace(TokenString);
            
            this.currentNode.dependencies.push(tkn.value.slice(1,-1));

            tkn = this.nextNonWhiteSpaceExpect(')');
            tkn = this.nextNonWhiteSpace();
            tkn = this.parseEndOfStatement(tkn);
        }
        return tkn;
    };
    
    publ parseStatement_mod(tkn){
        if(this.currentNode instanceof ModuleNode){
            return this.parseStatement_publProp(tkn);
        }else{
            tkn = this.parseExpression(tkn);
            return this.parseEndOfStatement(tkn);
        }
    };
    
    publ parseStatement_publ(tkn){
        return this.parseStatement_publProp(tkn);
    };
    
    publ parseStatement_publProp(tkn){
        tkn=this.nextNonWhiteSpaceExpect('.');
        tkn=this.nextNonWhiteSpaceExpect(TokenIdentifier);
        
        var name = tkn.value;
        
        tkn=this.nextNonWhiteSpace();
        if(tkn.value == "="){
            tkn = this.nextNonWhiteSpace(true);
            switch(tkn.value){
                case 'function':
                    this.currentNode = this.currentNode.addPublic(new MethodNode());
                    this.currentNode.name = name;
                    this.currentNode.description = this.getDocumentation();
                    tkn = this.parseExpression_function(tkn);
                    break;
                case 'Class':
                    this.currentNode = this.currentNode.addPublic(new ClassNode());
                    this.currentNode.name = name;
                    this.currentNode.description = this.getDocumentation();
                    tkn = this.parseExpression_Class(tkn);
                    break;
                default:
                    this.currentNode = this.currentNode.addPublic(new PropertyNode());
                    this.currentNode.name = name;
                    this.currentNode.description = this.getDocumentation();
                    tkn = this.parseExpression(tkn);
            }
        }else{
            this.currentNode = this.currentNode.addPublic(new PropertyNode());
            this.currentNode.name = name;
            this.currentNode.description = this.getDocumentation();
        }
        
        
        this.currentNode = this.currentNode.parentNode;
        
        tkn = this.parseEndOfStatement(tkn);
        return tkn;
    };
    
    publ parseBlock(tkn){
        this.expect('{', tkn);
        tkn=this.parseStatements(this.nextNonWhiteSpace(true));
        this.expect('}', tkn);
        tkn = this.nextNonWhiteSpace(true);
        return tkn;
    };
       
    publ parseCommaExpressions(tkn){
        tkn = this.parseExpression(tkn);
        while(tkn.value==','){
            tkn = this.parseExpression(this.nextNonWhiteSpace(true));
        }
        return tkn;
    };
    
    publ parseExpression(tkn){
        var objectAccessAllowed = true;          
        var invokationAllowed = true;          
        if(tkn.value == 'imprt'){
            tkn = this.parseExpression_imprt(tkn);
        }else if((tkn instanceof TokenIdentifier) || (tkn.value == 'this')){
            tkn =this.parseExpression_objectAccess(tkn);
        }else if(tkn.value == 'new'){
            tkn = this.parseExpression_new(tkn);
            invokationAllowed=false;
            objectAccessAllowed=false;
        }else if(tkn.value == 'var'){
            tkn = this.parseExpression_var(tkn);
            return tkn;
        }else if(tkn.value == "("){
            tkn = this.parseExpression_parens(tkn);
        }else if(tkn.value=='function'){
            tkn = this.parseExpression_function(tkn);
            objectAccessAllowed = false;
            return tkn;
        }else if(tkn.value =='{'){
            tkn = this.parseExpression_object(tkn);
            invokationAllowed = false;
        }else if(tkn.value =='['){
            tkn = this.parseExpression_array(tkn);
            invokationAllowed = false;
        }else if(tkn instanceof TokenString){
            tkn = this.nextNonWhiteSpace();
            invokationAllowed = false;
        }else if(tkn instanceof TokenRegExp){
            tkn= this.nextNonWhiteSpace();
            invokationAllowed = false;
        }else if(tkn instanceof TokenNumber){
            tkn = this.nextNonWhiteSpace();
            objectAccessAllowed = false;
            invokationAllowed = false;
        }else if(valueKeywords.contains(tkn.value)){
            tkn = this.nextNonWhiteSpace();
            objectAccessAllowed = false;
            invokationAllowed = false;
        }else if(unaryPrefixOperators.contains(tkn.value)){
            tkn = this.parseExpression_prefixOperator(tkn);
        }else{
            //todo is this an error
           return tkn;
            //throw "Expected Identifier, String, RegExp, Number, prefix operators, object expression, array expression, 'function' or 'this' but found %s".format(tkn);
        }
        
        if(objectAccessAllowed || invokationAllowed){
            while((tkn.value == '.') || (tkn.value=="[") || (tkn.value=="(")){
                if((tkn.value == '.') || (tkn.value=="[")){
                    //print(tkn)
                    tkn = this.parsePropertyAccess(tkn);
                    //print(tkn)
                }else if(tkn.value=="("){
                    tkn = this.parseInvokation(tkn);
                }
            }
        }
        
        if(tkn instanceof TokenWhiteSpace){
            tkn = this.nextNonWhiteSpace();
        }
        
        if(tkn.value == "?"){
            tkn = this.parseExpression_conditional(tkn);
        }else if(operators.contains(tkn.value)){
            tkn = this.parseExpression_operator(tkn);
        }else{
            return tkn;
        }
        return tkn;
    };
    
    publ parsePropertyAccess(tkn){
        while((tkn !== undefined) && ((tkn.value=='.')||(tkn.value=='['))){
            switch(tkn.value){
                case '.':
                    tkn=this.nextNonWhiteSpaceExpect(TokenIdentifier);
                    tkn=this.next();
                    break;
                case '[':
                    tkn = this.parseExpression(this.nextNonWhiteSpace(true));
                    this.expect(']', tkn);
                    tkn=this.nextNonWhiteSpace();
                    break;
            }
        }
        return tkn;
    };
    
    publ parseExpression_Class(tkn){
        tkn=this.nextNonWhiteSpace();
        tkn=this.nextNonWhiteSpace();
        if(tkn instanceof TokenString){
            this.currentNode.name = tkn.value.slice(1,-1);
            tkn=this.nextNonWhiteSpaceExpect(',');
            tkn=this.nextNonWhiteSpace(true);
        }
        
        //super classes
        if(tkn instanceof TokenIdentifier){
            while(tkn instanceof TokenIdentifier){
                tkn = this.parseExpression_objectAccess(tkn);
                this.expect(',', tkn);
                tkn=this.nextNonWhiteSpace(true);
            }
        }
        
        this.expect('function', tkn);
        tkn=this.nextNonWhiteSpaceExpect('(');
        tkn=this.nextNonWhiteSpaceExpect('publ');
        tkn=this.nextNonWhiteSpace();
         while(tkn.value == ','){
            tkn=this.nextNonWhiteSpaceExpect(TokenIdentifier);
            tkn=this.nextNonWhiteSpace();
        }
        this.expect(')', tkn);
        
        tkn=this.nextNonWhiteSpaceExpect('{');
        tkn=this.parseBlock(tkn);
        this.expect(")", tkn);
        tkn=this.nextNonWhiteSpace(true);
        
        return tkn;
    };
    
    publ parseExpression_imprt(tkn){
        tkn=this.nextNonWhiteSpaceExpect('(');
        tkn =this.nextNonWhiteSpaceExpect(TokenString);
        
        this.currentNode.dependencies.push(tkn.value.slice(1,-1));

        tkn = this.nextNonWhiteSpaceExpect(')');
        tkn = this.nextNonWhiteSpace(true);
        return tkn;
    };
    
    publ parseExpression_objectAccess(tkn){
        tkn = this.next();
        tkn = this.parsePropertyAccess(tkn);
        return tkn;
    };        
    
    publ parseExpression_prefixOperator(tkn){
        tkn = this.nextNonWhiteSpace();
        tkn=this.parseExpression(tkn);
        return tkn;
    };
    
    publ parseExpression_parens(tkn){
        tkn = this.parseExpression(this.nextNonWhiteSpace());
        this.expect(')', tkn);
        return this.nextNonWhiteSpace(true);
    };
            
    publ parseExpression_operator(tkn){
        switch(tkn.value){
            case "=":
                tkn = this.parseExpression_assignment(tkn);
                break;
            default:
                tkn=this.nextNonWhiteSpace(true);    
                tkn = this.parseExpression(tkn);
        }
        return tkn;
    };
    
    publ parseExpression_assignment(tkn){
        tkn=this.nextNonWhiteSpace(true);
        tkn = this.parseExpression(tkn);
        return tkn;
    };
    
    
    publ parseExpression_conditional(tkn){
        tkn=this.nextNonWhiteSpace();
        tkn=this.parseExpression(tkn);
        this.expect(":", tkn);
        tkn=this.parseExpression(this.nextNonWhiteSpace());
        return tkn;
    };
    
    publ parseExpression_array(tkn){
        tkn=this.nextNonWhiteSpace(true);
        if(tkn.value==']'){
            return this.nextNonWhiteSpace();
        }
        tkn = this.parseCommaExpressions(tkn);
        this.expect(']', tkn);
        tkn=this.nextNonWhiteSpace();
        return tkn;
    };
    
    publ parseExpression_object(tkn){
        tkn = this.nextNonWhiteSpace();
        
        while(tkn.value != '}'){
            if(tkn instanceof TokenString){
            }else{
                this.expect(TokenIdentifier, tkn);
            }
            tkn = this.nextNonWhiteSpaceExpect(':');
            tkn = this.nextNonWhiteSpace(true);
            tkn = this.parseExpression(tkn);
            if(tkn.value == ','){
                tkn = this.nextNonWhiteSpace(true);
            }
        }
        this.expect('}', tkn);
        tkn = this.nextNonWhiteSpace();
        return tkn;
    };
    
    publ parseExpression_function(tkn){
        tkn=this.nextNonWhiteSpaceExpect('(');
        tkn =this.nextNonWhiteSpace(true);
        while(tkn instanceof TokenIdentifier){
            try{
                this.currentNode.parameters.push(tkn.value);
            }catch(e){
            }
            
            tkn =this.nextNonWhiteSpace(true);
            if(tkn.value == ","){
                tkn =this.nextNonWhiteSpace(true);
            }else{
                break;
            }
        }
        this.expect(')', tkn);
        tkn=this.parseBlock(this.nextNonWhiteSpace(true));
        return tkn;
    };
    
    publ parseExpression_new(tkn){
        tkn=this.nextNonWhiteSpace(true);
        tkn=this.parseExpression_objectAccess(tkn);
        tkn=this.parseInvokation(tkn);
        return tkn;
    };
       
    publ parseExpression_var(tkn){
        var tkn = this.nextNonWhiteSpace();
        //next tkn should be an identifier
        while(tkn instanceof TokenIdentifier){
            var varName = tkn.value;
            //next should be either = , or ;
            tkn=this.nextNonWhiteSpace();
            switch(tkn.value){
                case ','://declaration without __init__ialization 
                    tkn=this.nextNonWhiteSpace(true);
                    break;
                case '='://declaration with __init__ialization
                    tkn = this.parseExpression(this.nextNonWhiteSpace(true)); 
                    if(tkn.value== ","){
                        tkn=this.nextNonWhiteSpace(true);
                    }else{
                        return tkn; 
                    }
                    break;
                default:
                    return tkn;
            }
        }
        //loop should have returned the function unless there was no identifier
        throw "Identifier expected in 'var'-statement but found %s".format(tkn===undefined?'undefined':tkn);
    };
    
     publ parseInvokation(tkn){
        this.expect('(', tkn);
        tkn= this.parseCommaExpressions(this.nextNonWhiteSpace(true));
        this.expect(')', tkn);
        tkn= this.nextNonWhiteSpace();
        return tkn;
    };       
});
    
class Compressor extends Tokenizer({
    publ __init__(source){
        supr.__init__.call(this, source);
        this.wsNeeded=false;
    };
    var leftAndRightSpace=new sets.Set(['instanceof' , 'in']);
    var rightSpace = new sets.Set(['var', 'delete', 'throw', 'new', 'return', 'else', 'instanceof','in', 'case', 'typeof']);
    
    publ next(){
        if(this.bufferedTkn){
            var tkn = this.bufferedTkn;
            this.bufferedTkn=null;
        }else{
            var tkn = supr.next.call(this);
            while((tkn instanceof TokenWhiteSpace) || (tkn instanceof TokenComment)|| ((tkn instanceof TokenNewLine ) && (this.lastTkn instanceof TokenNewLine))){
                tkn = supr.next.call(this);
            }
            if(tkn === undefined){
                return tkn;
            }else{
               if(leftAndRightSpace.contains(tkn.value)){
                    this.wsNeeded=false;
                    this.bufferedTkn=tkn;
                    return new TokenWhiteSpace(' ');
                }
            }
        }
        
        switch(tkn.value){
            case '(': case '{': case '[': case '"': case "'": case "!":
                this.wsNeeded=false;
                break;
        }
        
        if(this.wsNeeded){
            this.bufferedTkn = tkn;
            var tkn=new TokenWhiteSpace(' ');
            this.wsNeeded=false;
        }else{
            if(rightSpace.contains(tkn.value)){
                this.wsNeeded=true;
            }
        }
        
        this.lastTkn = tkn;
        return tkn;
    };
});


var xmlText=function(s){
    s=str(s);
    s= s.replace(/&/g,'&amp;');
    s= s.replace(/</g,'&th;');
    s= s.replace(/>/g,'&gt;');
    return s;
};


class DocParser({
    publ __init__(file){
        this.file=file;
    };
    
    publ pprint(m, indent){
        var m = m.split("\n");
        
        indent =(indent === undefined) ? 0 : indent;
        
        if(indent<0){
           this.pprintIndent+=indent;
        }
        
        var s=[];
        for(var i=0;i<this.pprintIndent;i++){
            s.push(' ');
        }
        s=s.join('');
        for(var i=0;i<m.length;i++){
            this.file.write(s + m[i] + '\n');
           //print(s + m[i] );
        }
        
        if(indent>0){
           this.pprintIndent += indent;
        }
    };
    publ pprintIndent=0;
    
    publ printGlobalNode(n){
       this.pprint('<global>', 4);
       this.pprint('<modules>', 4);
                  
        for(var i=0;i<n.publics.length;i++){
            var nn = n.publics[i];
            if(nn instanceof ModuleNode){
                this.printModuleNode(nn);
            }
        }
        
       this.pprint('</modules>', -4);
        
        
       this.pprint('</global>', -4);
    }; 
    
    publ printModuleNode(n){
       this.pprint('<module>',4);
       this.pprint('<name>'+ xmlText(n.name)+'</name>');
       this.pprint('<description>', 4);
       this.pprint(xmlText(n.description));
       this.pprint('</description>', -4);
       this.pprint('<dependencies>'+xmlText(n.dependencies)+'</dependencies>');
        
        this.printPublics(n);
        
       this.pprint('</module>',-4);
    };
    
    publ printClassNode(n){
       this.pprint('<class>',4);
       this.pprint('<name>'+xmlText(n.name)+'</name>');
        
       this.pprint('<description>', 4);
       this.pprint(xmlText(n.description));
       this.pprint('</description>', -4);
        
        this.printPublics(n);

       this.pprint('</class>',-4);
    };
    
    publ printPublics(n){
        var classes =[];
        var props =[];
        var methods =[];
        
        for(var i=0;i<n.publics.length;i++){
            var nn = n.publics[i];
            if(nn instanceof ClassNode){
                classes.push(nn);
            }else if(nn instanceof MethodNode){
                methods.push(nn);
            }else if(nn instanceof PropertyNode){
                props.push(nn);
            }
        }
        
        if(n.publics.length>0){
           this.pprint('<publics>',4);
            if(classes.length > 0){
               this.pprint('<classes>', 4);
                for(var i=0;i<classes.length;i++){
                    this.printClassNode(classes[i]);
                }
               this.pprint('</classes>', -4);
            }
            
            if(methods.length > 0){
               this.pprint('<methods>', 4);
                for(var i=0;i<methods.length;i++){
                    this.printMethodNode(methods[i]);
                }
               this.pprint('</methods>', -4);
            }
            
            if(props.length > 0){
               this.pprint('<properties>', 4);
                for(var i=0;i<props.length;i++){
                    this.printPropertyNode(props[i]);
                }
               this.pprint('</properties>', -4);
            }
           this.pprint('</publics>',-4);
        }
    };
    
    publ printPropertyNode(n){
       this.pprint('<property>',4);
       this.pprint('<name>' + xmlText(n.name )+ '</name>');
       this.pprint('<description>', 4);
       this.pprint(xmlText(n.description));
       this.pprint('</description>', -4);
       this.pprint('</property>',-4);
        
    };
    
    publ printMethodNode(n){
       this.pprint('<method>',4);
       this.pprint('<name>' + xmlText(n.name + '(' + n.parameters.join(', ') )+  ')</name>');
       this.pprint('<description>', 4);
       this.pprint(xmlText(n.description));
       this.pprint('</description>', -4);
       this.pprint('</method>',-4);
    };
});
   


