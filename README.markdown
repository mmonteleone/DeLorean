DeLorean
=========
Flux capacitor for accurately faking time-bound JavaScript unit testing, including timeouts, intervals, and dates
[http://github.com/mmonteleone/delorean][0]

*Documentation under heavy construction, but really there's not much to using this anyway*

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

Alternatively, you can download the [zipped release][2] containing a minified build and an example, or the development release with unit tests by cloning `git://github.com/mmonteleone/DeLorean.git`.

### API Documentation

#### DeLorean.globalApi
#### DeLorean.reset
#### DeLorean.advance
#### DeLorean.setTimeout
#### DeLorean.setInterval
#### DeLorean.clearTimeout
#### DeLorean.clearInterval
#### DeLorean.Date

Ronald Reagan?  The actor?
--------------------------

### How to Contribute



Make Like A Tree
----------------

### Changelog

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
[3]: http://github.com/mmonteleone/DeLorean/blob/master/src/delorean.js "DeLorean Script"
[4]: git://github.com/mmonteleone/DeLorean.git
