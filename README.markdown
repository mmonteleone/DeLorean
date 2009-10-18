MockClock
=========
Flux capacitor for time-bound JavaScript unit testing, including timeouts, intervals, and dates
[http://github.com/mmonteleone/mockclock][0]

This is heavy, Doc
------------------

MockClock provides dead-simple and fully accurate simulation of the passage of time in a web browser to aid in JavaScript unit testing.  Any code which makes use of `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`, or `Date` can be run instantly against MockClock's own implementations.

### Features

* Time can be advanced by arbitrary amounts instantly
* Accurately simulates `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval`
  * Scheduled functions are executed precisely in order as native would be
  * Complex interweavings of intervals and timeouts are executed in proper native order
  * Supports complex scenarios involving clearing and scheduling of intervals from within (other) intervals the same as native
  * Functions scheduled to otherwise occur in parallel are executed in proper native order
  * Proper (though unrecommended) API features such as the passing of eval-able strings is supported
  * Throws identical exceptions as native when necessary
* `Date` objects instantiated to the "current" time respect mocked time advancement
* Keeps the DOM squeaky clean, and does not automatically replace native time APIs by default

### Example!

API Documentation
-----------------

### MockClock.globalApi
### MockClock.reset
### MockClock.advance
### MockClock.setTimeout
### MockClock.setInterval
### MockClock.clearTimeout
### MockClock.clearInterval

Ronald Reagan?  The actor?
--------------------------




[0]: http://github.com/mmonteleone/mockclock "MockClock"
[1]: http://michaelmonteleone.net "Michael Monteleone"
[2]: http://cloud.github.com/downloads/mmonteleone/mockclock/mockclock_0_1.zip "MockClock download"

