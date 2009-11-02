DeLorean
=========
Flux capacitor for accurately faking time-bound JavaScript unit testing, including timeouts, intervals, and dates  
[http://github.com/mmonteleone/delorean][0]

This is heavy, Doc
------------------

DeLorean provides dead-simple and fully accurate simulation of the passage of time in a web browser to aid in JavaScript unit testing.  Any code which makes use of `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`, or `Date` can be run instantly against DeLorean's own implementations.

### Features

* Time can be advanced by arbitrary amounts instantly
* Accurately simulates `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`
  * Scheduled functions are executed precisely in order as native would be
  * Complex interweavings of intervals and timeouts are executed in proper native order
  * Supports complex scenarios involving clearing and scheduling of intervals from within (other) intervals the same as native
  * Functions scheduled to otherwise occur in parallel are executed in proper native order
  * Proper (though unrecommended) API features such as the passing of eval-able strings is supported
  * Throws identical exceptions as native when necessary
  * Scheduled functions are properly executed on the global scope
* `Date` objects instantiated to the "current" time respect mocked time advancement
* Keeps the DOM squeaky clean, and does not automatically replace native time APIs by default
* Not coupled to any particular testing or general purpose JavaScript framework.  Go nuts.

### Quick Example:

    // schedule a message to be logged every 10 seconds
    DeLorean.setInterval(function(){
        console.log('executing callback');
    }, 10000);
    
    // instantly advance fake clock ahead 30 seconds
    DeLorean.advance(30000);
    
**Output:**

    > executing callback
    > executing callback
    > executing callback
    
### Example of support for complex, nested, scheduling and clearing of intervals:

    // optionally overwrite native api 
    DeLorean.globalApi(true);  

    var intervalCount = 0,
        timeoutCount = 0;

    // log a message every 5 seconds        
    var intervalId = setInterval(function(){                
        console.log('interval ' + intervalCount++); 
                    
        // schedule another message to be logged 3 seconds from here                
        setTimeout(function(){
            console.log('timeout  ' + timeoutCount++);
            
            // clear the outer interval if has occurred 4 times
            if(intervalCount >= 4) {
                clearInterval(intervalId);
            }
            
        }, 3000);       
        
    }, 5000);

    // instantly advance fake clock ahead 30 seconds
    DeLorean.advance(30000);

**Output:**

    > interval 0
    > timeout  0
    > interval 1
    > timeout  1
    > interval 2
    > timeout  2
    > interval 3
    > timeout  3
    
### Example of advancing the Date, and resetting

    // optionally overwrite native api
    DeLorean.globalApi(true);
    
    // set an interval to occur every 24 hours
    setInterval(function(){
        // get the "current" time
        var now = new Date();
        console.log(now);
    }, 1000 * 60 * 60 * 24);
    
    // instantly advance fake clock by 5 days
    DeLorean.advance(1000 * 60 * 60 * 24 * 5);
    
    console.log('resetting DeLorean');
    
    // travel back to the present (and clear all timeouts/intervals)
    DeLorean.reset();
    
    console.log(new Date());    
        
**Output:**

    > Mon Nov 02 2009 19:13:03 GMT-0600 (CST)
    > Tue Nov 03 2009 19:13:03 GMT-0600 (CST)
    > Wed Nov 04 2009 19:13:03 GMT-0600 (CST)
    > Thu Nov 05 2009 19:13:03 GMT-0600 (CST)
    > Fri Nov 06 2009 19:13:03 GMT-0600 (CST)
    > resetting DeLorean
    > Sun Nov 01 2009 19:13:03 GMT-0600 (CST)

88 MPH
------

### Requirements

DeLorean has no external library dependencies, and is tested across all modern browsers.

### Downloading/Installation

Simply download [delorean.js][3] and include it.  

Alternatively, you can download the [zipped release][2] containing a minified build and an example or the development master with unit tests by cloning `git://github.com/mmonteleone/DeLorean.git`.

### API Documentation

#### DeLorean.globalApi(shouldOverrideGlobal)

Gets (and optinally sets) value of whether the native timing functions (`setInterval`, `clearInterval`, `setTimeout`, `clearTimeout`, `Date`) should be overwritten by DeLorean's fakes.  This allows for DeLorean to not intrude upon the DOM if not desired.  

When `false`, DeLorean's timing methods can be used via `DeLorean.setTimeout()` etc.  When `true`, anything that calls `setTimeout()` calls DeLorean's version.

Defaults to `false`.  

*Parameters*  

* shouldOverrideGlobal (Boolean) - optional value, when passed, adds or removes the api from global scope

*Returns*  
true if native API is overwritten, false if not

#### DeLorean.reset()

Resets fake time advancement back to 0, removing all clearing all intervals and timeouts in the process.

#### DeLorean.advance(ms)

Advances fake time by an arbitrary quantity of milliseconds, executing all scheduled callbacks that would have occurred within advanced range in proper native order and scope.

*Parameters*  

* ms (Number) - [optional] number of milliseconds to advance fake clock.  When not passed, does not advance clock, but still returns current offset.

*Returns*  
Total current offset (Number of milliseconds) of faked time advancement

#### DeLorean.setTimeout(func, delay)

Fake of a native [window.setTimeout][5].  Schedules a code snippet or a function to be executed after specified delay.  Timeouts do not proceed automatically, instead requiring the manual advancement of time with `DeLorean.advance()`.  

*Parameters*  

* func (Function) or (String) - function to execute after the delay, or the string to evaluate
* delay (Number) - number of milliseconds to delay execution of the function

*Returns*  
New unique timeout id which can be used with a `DeLorean.clearTimeout(timeoutId)`

#### DeLorean.setInterval(func, delay)

Fake of a native [window.setInterval][6].  Schedules a code snippet or a function to be executed repeatedly, with a fixed time delay between each call to that function.  Intervals do not proceed automatically, instead requiring the manual advancement of time with `DeLorean.advance()`.  

*Parameters*  

* func (Function) or (String) - function to execute repeatedly, or the string to evaluate
* delay (Number) - number of milliseconds to wait before each execution

*Returns*  
New unique interval id which can be used with a `DeLorean.clearInterval(intervalId)`

#### DeLorean.clearTimeout(id)

Fake of a native [window.clearTimeout][7].  Clears the delay set by `DeLorean.setTimeout()`.  

*Parameters*

* id (Number) - the ID of the timeout you wish to clear, as returned by `DeLorean.setTimeout()`

#### DeLorean.clearInterval

Fake of a native [window.clearInterval][8].  Clears the interval set by `DeLorean.setInterval()`.  

*Parameters*

* id (Number) - the ID of the timeout you wish to clear, as returned by `DeLorean.setInterval()`

#### DeLorean.Date

Fake of a native [Date][9].  Creates `Date` instances which let you work with dates and times identically to native dates, except that `Date`s instantiated to the "current" time respect whatever time may have been artificially advanced via DeLorean.

When passed parameters, instantiates a normal `Date`, identically to the [native API][9].  When passed no parameters, assumes the "current" date and time.

Ronald Reagan?  The actor?
--------------------------

### How to Contribute

Development Requirements (for building and test running):

* Ruby + Rake, PackR, rubyzip gems: for building and minifying
* Java: if you want to test using the included JsTestDriver setup

Clone the source at `git://github.com/mmonteleone/DeLorean.git` and have at it.

The following build tasks are available:

    rake build     # builds package and minifies
    rake test      # runs Pavlov specs against QUnit testrunner in default browser
    rake server    # downloads, starts [JsTestDriver][2] server, binds common browsers
    rake testdrive # runs Pavlov specs against running JsTestDriver server
    rake release   # builds a releasable zip package

&lt;shameless&gt;Incidentally DeLorean's unit tests use QUnit along with my other project, [Pavlov][10], a behavioral QUnit extension.&lt;/shameless&gt;

Make Like A Tree
----------------

### Changelog

* 0.1.2 - Advance now returns millisecond offset, refactoring, more documentation
* 0.1.1 - Renamed from MockClock to DeLorean for strictly technical reasons
* 0.1 - Initial Release

And Get Outta Here
------------------

### License

Copyright (c) 2009 Michael Monteleone, http://michaelmonteleone.net

The MIT License

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



[0]: http://github.com/mmonteleone/delorean "DeLorean"
[1]: http://michaelmonteleone.net "Michael Monteleone"
[2]: http://cloud.github.com/downloads/mmonteleone/DeLorean/DeLorean.zip "DeLorean Release"
[3]: http://github.com/mmonteleone/DeLorean/raw/master/delorean.js "DeLorean Script"
[4]: git://github.com/mmonteleone/DeLorean.git
[5]: https://developer.mozilla.org/En/Window.setTimeout "MDC: setTimeout"
[6]: https://developer.mozilla.org/En/Window.setInterval "MDC: setInterval"
[7]: https://developer.mozilla.org/En/Window.clearTimeout "MDC: clearTimeout"
[8]: https://developer.mozilla.org/En/Window.clearInterval "MDC: clearInterval"
[9]: https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Date "MDC: Date"
[10]: http://github.com/mmonteleone/pavlov "Pavlov"