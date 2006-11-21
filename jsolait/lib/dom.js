/*
    Copyright (c) 2005 Jan-Klaas Kollhof

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
    Module providing DOM implementations.

    @author                  Jan-Klaas Kollhof
    @lastchangedby       $LastChangedBy$
    @lastchangeddate    $Date$
**/
__version__="$Revision$";

import sets;

/**
    Event class.
**/
class Event({
    publ __init__(target){
        this.type = this.__class__.__name__;
        this.target = target;
    };
    ///The event type.
    publ type=null;
    ///The target of the event
    publ target=null;

    publ __str__(){
        return '[Event %s]'.format(this.type);
    
    };
});


/**
    An EventTarget implementation.
**/
class EventTarget({
    publ __init__(){
        this.eventListeners={};
    };
    /**
        Dispatches an event to it's listeners.
        @param evt The event to dispatch.
    **/
    publ dispatchEvent(evt){
        if(this.eventListeners[evt.type]){
            var l = this.eventListeners[evt.type].items;
            for(var h in l){
                if(typeof l == 'function'){
                    l(evt);
                }else{
                    l[h].handleEvent(evt);
                }
            }
        }
    };
    /**
        Adds an EventListener.
        @param evtType  The event type to register the listener for.
        @param listener   The EventListener object.
        @param useCapture  todo: Not used yet.
    **/
    publ addEventListener(evtType, listener, useCapture){
        if(this.eventListeners[evtType]===undefined){
            this.eventListeners[evtType] = new sets.Set();
        }
        //make sure the listener has an id that the set can use
        id(listener, true);
        this.eventListeners[evtType].add(listener);
    };
    /**
        Removes a registered EventListener.
        @param evtType  The event type the listener was registered for.
        @param listener   The EventListener object.
        @param useCapture  todo: Not used yet.
    **/
    publ removeEventListener(evtType, listener, useCapture){
        if(this.eventListeners[evtType]){
            this.eventListeners[evtType].discard(listener);
        }
    };
});

/**
    An EventListener wrapper.
    It forwards all events to handler methods using the evt.type as the name for the method.
**/
class EventListener({
    /**
        Handles events dispatched by an EventTarget.
        It forwards the evt to a handler method with the name == evt.type.
        @param  evt  The event to handle.
    **/
    publ handleEvent(evt){
        if(this['handleEvent_' +evt.type]){
            this['handleEvent_' + evt.type](evt);
        }
    };
});

/**
    A combination of an EventTarget and a EventListener.
**/
class EventListenerTarget extends EventTarget, EventListener({
});
