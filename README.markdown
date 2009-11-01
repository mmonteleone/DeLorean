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

### Example!

88 MPH
------

### Requirements

### Downloading/Installation

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

Copyright (c) 2009 Michael Monteleone  
Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.



[0]: http://github.com/mmonteleone/delorean "DeLorean"
[1]: http://michaelmonteleone.net "Michael Monteleone"
[2]: http://cloud.github.com/downloads/mmonteleone/DeLorean/DeLorean_0_1.zip "DeLorean download"

