/**
 * MockClock - Flux capacitor for time-bound JavaScript unit testing, including timeouts, intervals, and dates
 * 
 * http://michaelmonteleone.net/projects/mockclock
 * http://github.com/mmonteleone/mockclock
 *
 * Copyright (c) 2009 Michael Monteleone
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 */
 (function(){
    var global = this;
    var globalizedApi = false;
    var funcs = {};
    var offsetMs = 0;
    var funcCount = 0;

    var originalClock = {
        setTimeout: global.setTimeout,
        setInterval: global.setInterval,
        clearTimeout: global.clearTimeout,
        clearInterval: global.clearInterval,
        Date: global.Date
    };

    var ShiftedDate = function(year, month, date, hour, minute, second, millisecond) {
        var shiftedDate;
        if(arguments.length === 0) {
            shiftedDate = new originalClock.Date();
            shiftedDate.setMilliseconds(shiftedDate.getMilliseconds() + offsetMs);
        } else if(arguments.length == 1) {
            shiftedDate = new originalClock.Date(arguments[0]);
        } else {
            shiftedDate = new originalClock.Date(
                year || null, month || null, date || null, hour || null, 
                minute || null, second || null, millisecond || null);
        }
        return shiftedDate;
    };

    var extend = function(dest, src){
        for(var prop in src) {
            dest[prop] = src[prop];
        }
    };
    
    var reset = function(){
        funcs = {};
        funcCount = 0;
        offsetMs = 0;
    };
    
    var isNumeric = function(value) {
        return value !== null && !isNaN(value);
    };

    var advance = function(ms){
        if(!isNumeric(ms) || ms < 0) {
            throw("'ms' argument must be a positive number");
        }
        var toRun = [];
        var start = offsetMs;
        var fn;
        offsetMs += ms;

        // collect applicable functions to run
        for(var id in funcs) {
            fn = funcs[id];
            // non-repeating timeouts that fall within time range
            if(!fn.repeats && fn.firstRunAt <= offsetMs) {
                toRun.push({fn:fn, at:fn.firstRunAt});
            // collect applicable intervals        
            } else {
                if(fn.lastRunAt === null && 
                    fn.firstRunAt > start && 
                    (fn.lastRunAt || fn.firstRunAt) <= offsetMs) {                        
                    fn.lastRunAt = fn.firstRunAt;
                    toRun.push({fn:fn, at:fn.lastRunAt});
                }
                // add as many instances of interval fn as would occur within range
                while(fn.lastRunAt + fn.ms <= offsetMs) {
                    fn.lastRunAt += fn.ms;
                    toRun.push({fn:fn, at:fn.lastRunAt});
                }
            }
        }

        // sort functions to run in correct order
        toRun.sort(function(a,b){
            // ~ order by execution point ASC, interval length DESC, order of addition ASC
            var order = a.at - b.at;
            if(order === 0) {
                order = b.fn.ms - a.fn.ms;
                if(order === 0) {
                    order = a.fn.id - b.fn.id;
                }
            }
            return order;
        });

        // run functions
        for(var i=0; i<toRun.length; ++i) {
            fn = toRun[i].fn;
            // only run fn's that still exist, since a particular fn could
            // have been cleared by a run fn since the fn was previously scheduled
            if(!!funcs[fn.id]) {
                // run fn on global context
                fn.fn.apply(global); 
                // for efficiency, remove non-repeating after execution
                if(!fn.repeats) {
                    removeFunction(fn.id);
                }
            }
        }
    };

    var addFunction = function(fn, ms, repeats){        
        // if scheduled fn was old-school string of code
        // (yes, js officially allows for this)
        if(typeof(fn)=='string') {
            fn = new Function(fn);
        }
        var id = funcCount++;
        funcs[id] = {id:id, fn:fn, ms:ms, addedAt:offsetMs, firstRunAt:(offsetMs+ms), lastRunAt:null, repeats:repeats};        
        return id;
    };

    var removeFunction = function(id){
        delete funcs[id];
    };

    var globalApi = function(value){
        if(typeof(value)!=='undefined') {
            globalizedApi = value;
            extend(global, globalizedApi ? mockApi : originalClock);
        }
        return globalizedApi;
    };

    reset();

    var mockApi = {
        setTimeout: function(fn, ms){
            // handle exceptional parameters
            if(arguments.length === 0) {
                throw("Function setTimeout requires at least 1 parameter");
            } else if (arguments.length === 1 && isNumeric(arguments[0])) {
                throw("useless setTimeout call (missing quotes around argument?)");
            } else if (arguments.length === 1) {
                return addFunction(fn, 0, false);                
            }
            // schedule func
            return addFunction(fn, ms, false);
        },
        setInterval: function(fn, ms){
            // handle exceptional parameters
            if(arguments.length === 0) {
                throw("Function setInterval requires at least 1 parameter");
            } else if (arguments.length === 1 && isNumeric(arguments[0])) {
                throw("useless setTimeout call (missing quotes around argument?)");
            } else if (arguments.length === 1) {
                return addFunction(fn, 0, false);                
            } 
            // schedule func
            return addFunction(fn, ms, true);
        },
        clearTimeout: removeFunction,
        clearInterval: removeFunction,
        Date: ShiftedDate
    };

    // expose public api
    global.MockClock = {
        reset: reset,
        advance: advance,
        globalApi: globalApi
    };
    extend(global.MockClock, mockApi);
})();
