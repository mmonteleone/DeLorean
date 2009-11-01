/**
 * DeLorean - Flux capacitor for accurately faking time-bound JavaScript unit testing, including timeouts, intervals, and dates
 * 
 * http://michaelmonteleone.net/projects/delorean
 * http://github.com/mmonteleone/delorean
 *
 * Copyright (c) 2009 Michael Monteleone
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 */
 (function() {
        
    var global = this;          // capture reference to global scope     
    var globalizedApi = false;  // whether or not api has been injected into global scope    
    var funcs = {};             // collection of scheduled functions    
    var advancedMs = 0;         // accumulation of total requested ms advancements
    var elapsedMs = 0;          // accumulation of current time as of each callback    
    var funcCount = 0;          // number of scheduled functions
    var currentlyAdvancing = false;     // whether or not an advance is in motion
    var executionInterrupted = false;   // whether or not last advance was interrupted

    /**
     * Captures references to original values of timing functions
     */
    var originalClock = {
        setTimeout: global.setTimeout,
        setInterval: global.setInterval,
        clearTimeout: global.clearTimeout,
        clearInterval: global.clearInterval,
        Date: global.Date
    };

    /**
     * Extension of standard Date using "parasitic inheritance"
     * http://www.crockford.com/javascript/inheritance.html
     * Intercepts requests to create Date instances of current time
     * and offsets them by the faked time advancement
     * @param {Number} year year
     * @param {Number} month month
     * @param {Number} day day of month
     * @param {Number} hour hour of day
     * @param {Number} minute minute
     * @param {Number} second second
     * @param {Number} millisecond millisecond
     * @returns date
     */
    var ShiftedDate = function(year, month, day, hour, minute, second, millisecond) {
        var shiftedDate;
        if (arguments.length === 0) {
            shiftedDate = new originalClock.Date();
            shiftedDate.setMilliseconds(shiftedDate.getMilliseconds() + effectiveOffset());
        } else if (arguments.length == 1) {
            shiftedDate = new originalClock.Date(arguments[0]);
        } else {
            shiftedDate = new originalClock.Date(
            year || null, month || null, day || null, hour || null,
            minute || null, second || null, millisecond || null);
        }
        return shiftedDate;
    };

    /**
     * Basic extension helper for copying properties of one object to another
     * @param {Object} dest object to receive properties
     * @param {Object} src object containing properties to copy
     */
    var extend = function(dest, src) {
        for (var prop in src) {
            dest[prop] = src[prop];
        }
    };

    /**
     * Resets fake time advancement back to 0,
     * removing all scheduled functions
     */
    var reset = function() {
        funcs = {};
        funcCount = 0;
        advancedMs = 0;
        currentlyAdvancing = false;
        executionInterrupted = false;
        elapsedMs = 0;
    };

    /**
     * Helper function to return whether a variable is truly numeric
     * @param {Object} value value to test
     * @returns boolean of whether value was numeric
     */
    var isNumeric = function(value) {
        return value !== null && !isNaN(value);
    };
    
    /**
     * Helper function to return the effective current offset of time
     * from the perspective of executing callbacks
     * @returns milliseconds as Number
     */
    var effectiveOffset = function() {
        return currentlyAdvancing ? elapsedMs: advancedMs;
    };    
    
    /**
     * Advances fake time by an arbitrary quantity of milliseconds,
     * executing all scheduled callbacks that would have occurred within
     * advanced range in proper native order and context
     * @param {Number} ms quantity of milliseconds to advance fake clock
     */
    var advance = function(ms) {
        // advance can optionally accept no parameters 
        // for just returning accumulated advanced offset
        if(!!ms) {            
            if (!isNumeric(ms) || ms < 0) {
                throw ("'ms' argument must be a positive number");
            }
            // scheduled callbacks to be executed within range
            var schedule = [];         
            // build an object to hold time range of this advancement
            var range = {
                start: advancedMs,
                end: advancedMs += ms                
            };
            
            // register an instance of a callback to occur
            // at a particular point in this advance's schedule
            var register = function(fn, at) {
                schedule.push({
                    fn: fn,
                    at: at                    
                });
            };

            // loop through the scheduleing and execution of callback
            // functions since callbacks could possibly schedule more
            // callbacks of their own (which would interrupt execution)
            do {
                executionInterrupted = false;

                // collect applicable functions to run
                for (var id in funcs) {
                    var fn = funcs[id];
                    
                    // schedule all non-repeating timeouts that fall within advvanced range
                    if (!fn.repeats && fn.firstRunAt <= range.end) {
                        register(fn, fn.firstRunAt);
                    // schedule repeating inervals that would fall during the range
                    } else {
                        // schedule instances of first runs of intervals
                        if (fn.lastRunAt === null &&
                            fn.firstRunAt > range.start &&
                            (fn.lastRunAt || fn.firstRunAt) <= range.end) {
                                fn.lastRunAt = fn.firstRunAt;
                                register(fn, fn.lastRunAt);
                        }
                        // add as many instances of interval callbacks as would occur within range
                        while ((fn.lastRunAt || fn.firstRunAt) + fn.ms <= range.end) {
                            fn.lastRunAt += fn.ms;
                            register(fn, fn.lastRunAt);
                        }
                    }
                }

                // sort all the scheduled functions to execute in correct browser order
                schedule.sort(function(a, b) {
                    // ~ order by execution point ASC, interval length DESC, order of addition ASC
                    var order = a.at - b.at;
                    if (order === 0) {
                        order = b.fn.ms - a.fn.ms;
                        if (order === 0) {
                            order = a.fn.id - b.fn.id;
                        }
                    }
                    return order;
                });        

                // run functions
                var ran = [];
                for (var i = 0; i < schedule.length; ++i) {
                    var fn = schedule[i].fn;                    
                    // only run fn's that still exist, since a particular fn could
                    // have been cleared by a subsequent run of anther callback
                    if ( !! funcs[fn.id]) {
                        elapsedMs = schedule[i].at;
                        // run fn surrounded by a state of
                        // currently advancing
                        currentlyAdvancing = true;
                        try {
                            // run callback function on global context
                            fn.fn.apply(global);
                        } finally {
                            currentlyAdvancing = false;
                            
                            // record this fn instance as having occurred, and thus trashable
                            ran.push(i);

                            // completely trash non-repeating instance 
                            // from ever being scheduled again 
                            if (!fn.repeats) {
                                removeFunction(fn.id);
                            }
                            
                            // execution could have been interrupted if 
                            // a callback had performed some scheduling of its own
                            if (executionInterrupted) {
                                break;
                            }
                        }                        
                    }
                }
                // remove all run callback instances from schedule
                for (var i = ran.length - 1; i >= 0; i--) {
                    schedule.splice(ran[i], 1);
                }
            }
            while (executionInterrupted);            
        }
        return effectiveOffset();
    };

    var addFunction = function(fn, ms, repeats) {
        // if scheduled fn was old-school string of code
        // (yes, js officially allows for this)
        if (typeof(fn) == 'string') {
            fn = new Function(fn);
        }
        var at = effectiveOffset();
        var id = funcCount++;
        funcs[id] = {
            id: id,
            fn: fn,
            ms: ms,
            addedAt: at,
            firstRunAt: (at + ms),
            lastRunAt: null,
            repeats: repeats
        };
        return id;
    };

    var removeFunction = function(id) {
        delete funcs[id];
    };

    var globalApi = function(value) {
        if (typeof(value) !== 'undefined') {
            globalizedApi = value;
            extend(global, globalizedApi ? api: originalClock);
        }
        return globalizedApi;
    };

    var conditionallyInterruptExecution = function() {
        if (currentlyAdvancing) {
            executionInterrupted = true;
        }
    };
    
    var api = {
        setTimeout: function(fn, ms) {
            // handle exceptional parameters
            if (arguments.length === 0) {
                throw ("Function setTimeout requires at least 1 parameter");
            } else if (arguments.length === 1 && isNumeric(arguments[0])) {
                throw ("useless setTimeout call (missing quotes around argument?)");
            } else if (arguments.length === 1) {
                return addFunction(fn, 0, false);
            }
            // stop any currently executing range of fns
            conditionallyInterruptExecution();
            // schedule func
            return addFunction(fn, ms, false);
        },
        setInterval: function(fn, ms) {
            // handle exceptional parameters
            if (arguments.length === 0) {
                throw ("Function setInterval requires at least 1 parameter");
            } else if (arguments.length === 1 && isNumeric(arguments[0])) {
                throw ("useless setTimeout call (missing quotes around argument?)");
            } else if (arguments.length === 1) {
                return addFunction(fn, 0, false);
            }
            // stop any currently executing range of fns
            conditionallyInterruptExecution();
            // schedule func
            return addFunction(fn, ms, true);
        },
        clearTimeout: removeFunction,
        clearInterval: removeFunction,
        Date: ShiftedDate
    };

    // expose public api
    global.DeLorean = {
        reset: reset,
        advance: advance,
        globalApi: globalApi
    };
    extend(global.DeLorean, api);
    
    reset();    
})();
