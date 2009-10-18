QUnit.specify.extendAssertions({
    doesNotThrowException: function(actual, message) {
        try {
            actual();
            ok(true, message)
        } catch(e) {
            ok(!true, message)
        }
    }    
});

QUnit.specify("MockClock", function() {

    // capture a reference to default timing APIs
    var original = {
        Date: window.Date,
        setInterval: window.setInterval,
        setTimeout: window.setTimeout,
        clearInterval: window.clearInterval,
        clearTimeout: window.clearTimeout
    };            

    describe("globalApi", function(){
        
        it("should return 'false' by default", function(){
            var result = MockClock.globalApi();
            assert(result).isFalse();
        });
        
        describe("when passed 'true'", function(){
            
            before(function(){
                MockClock.globalApi(true);
            });
            
            it("should return 'true' on subsequent calls", function(){
                var result = MockClock.globalApi();
                assert(result).isTrue();
            });
            
            it("should inject global api", function(){
                assert(window.Date).equals(MockClock.Date);
                assert(window.setInterval).equals(MockClock.setInterval);
                assert(window.setTimeout).equals(MockClock.setTimeout);
                assert(window.clearInterval).equals(MockClock.clearInterval);
                assert(window.clearTimeout).equals(MockClock.clearTimeout);
            });
            
            it("should not inject 'globalApi', 'reset', or 'advance'", function(){
                assert(window.globalApi).isUndefined();
                assert(window.reset).isNotEqualTo(MockClock.reset);
                assert(window.advance).isUndefined();
            });
        });
        
        describe("when passed 'false'", function(){
            before(function(){
                MockClock.globalApi(false);                
            });
            
            it("should return 'false' on subsequent calls", function(){
                var result = MockClock.globalApi();
                assert(result).isFalse();
            });
            
            it("should reset global api to default value", function(){
                assert(window.Date).equals(original.Date);
                assert(window.setInterval).equals(original.setInterval);
                assert(window.setTimeout).equals(original.setTimeout);
                assert(window.clearInterval).equals(original.clearInterval);
                assert(window.clearTimeout).equals(original.clearTimeout);                                
            });
            
            it("should remove injected api if previously injected", function(){
                // first inject the api and make sure it injected
                MockClock.globalApi(true);
                assert(window.Date).equals(MockClock.Date);
                assert(window.Date).isNotEqualTo(original.Date);
                
                // then remove and make sure fully removed
                MockClock.globalApi(false);
                assert(window.Date).equals(original.Date);
                assert(window.setInterval).equals(original.setInterval);
                assert(window.setTimeout).equals(original.setTimeout);
                assert(window.clearInterval).equals(original.clearInterval);
                assert(window.clearTimeout).equals(original.clearTimeout);                                                
            });
        });
    });
    
    describe("setTimeout", function(){
        
        after(function(){
            MockClock.reset();            
        });
        
        describe("exceptional situations", function(){
            it("should throw exception when passed no params", function(){
                assert(function(){
                    MockClock.setTimeout();
                }).throwsException("Function setTimeout requires at least 1 parameter");
            });
            it("should throw exception when passed just ms", function(){
                assert(function(){                    
                    MockClock.setTimeout(45);
                }).throwsException("useless setTimeout call (missing quotes around argument?)")
            });
            it("should schedule fn at 0 ms when passed just fn", function(){
                var count = 0;
                MockClock.setTimeout(function(){
                    count++;                                        
                });
                MockClock.advance(5);
                assert(count).equals(1);
            });
        });
        describe("when passed a fn and time", function(){
            it("should return a timeout id", function(){
                var intervalId = null;
                intervalId = MockClock.setTimeout(function(){}, 5);
                assert(intervalId).isNotNull();
            });
            it("should not run fn when advanced to before the time", function(){
                var count = 0;
                MockClock.setTimeout(function(){
                    count++;
                }, 5);
                MockClock.advance(4);
                assert(count).equals(0);                              
            });
            it("should run fn once when advanced to exactly the time", function(){
                var count = 0;
                MockClock.setTimeout(function(){
                    count++;                    
                }, 5);
                MockClock.advance(5);
                assert(count).equals(1);                
            });
            it("should have run fn once when advanced to time and a half", function(){
                var count = 0;
                MockClock.setTimeout(function(){
                    count++;                    
                }, 5);
                MockClock.advance(8);
                assert(count).equals(1);                
            });
            it("should only have run fn once when advanced three times the time", function(){
                var count = 0;
                MockClock.setTimeout(function(){
                    count++;                    
                }, 5);
                MockClock.advance(15);
                assert(count).equals(1);                
            });
        });
        describe("when passed a string instead of fn", function(){
            it("should schedule an evaling of fn", function(){
                // using a globally-scoped variable since 
                // eval-created functions don't have access to local scope
                window.windowedCount = 0;
                MockClock.setTimeout("window.windowedCount++", 5);
                MockClock.advance(15);
                assert(window.windowedCount).equals(1);                
            });
        });          
    });
    
    describe("setInterval", function(){
        after(function(){
            MockClock.reset();            
        });
        
        describe("exceptional situations", function(){
            it("should throw exception when passed no params", function(){
                assert(function(){
                    MockClock.setInterval();                                        
                }).throwsException("Function setInterval requires at least 1 parameter")
            });
            it("should throw exception when passed just ms", function(){
                assert(function(){
                    MockClock.setInterval(45);                                        
                }).throwsException("useless setTimeout call (missing quotes around argument?)")                
            });
            it("should behave like setTimeout with 0 ms when passed just fn", function(){
                var count = 0;
                MockClock.setInterval(function(){
                    count++;                                        
                });
                MockClock.advance(5);
                assert(count).equals(1);                                
            });
        });
        describe("when passed a fn and time", function(){
            it("should return an interval id", function(){
                var intervalId = null;
                intervalId = MockClock.setInterval(function(){}, 5);
                assert(intervalId).isNotNull();                
            });
            it("should not have run fn when advanced to before the time", function(){
                var count = 0;
                MockClock.setInterval(function(){
                    count++;
                }, 5);
                MockClock.advance(4);
                assert(count).equals(0);                
            });
            it("should have run fn once when advanced to exactly the time", function(){
                var count = 0;
                MockClock.setInterval(function(){
                    count++;
                }, 5);
                MockClock.advance(5);
                assert(count).equals(1);                
            });
            it("should have run fn once when advanced to time and a half", function(){
                var count = 0;
                MockClock.setInterval(function(){
                    count++;
                }, 5);
                MockClock.advance(5);
                assert(count).equals(1);                                
            });
            it("should have run fn thrice when advanced to exactly three times", function(){
                var count = 0;
                MockClock.setInterval(function(){
                    count++;
                }, 5);
                MockClock.advance(15);
                assert(count).equals(3);
            });
            it("should allow for the setting of intervals within other intervals", function(){
                var runs = [];
                MockClock.setTimeout(function(){
                    runs.push('a');
                    MockClock.setTimeout(function(){
                        runs.push('b');
                        MockClock.setInterval(function(){
                            runs.push('c');
                        }, 2)
                    }, 3);
                }, 5);
                MockClock.advance(12);
                assert(runs).isSameAs(['a','b','c','c']);
            });
        });
        describe("when passed a string instead of fn", function(){
            it("should schedule an evaling of fn", function(){
                // using a globally-scoped variable since 
                // eval-created functions don't have access to local scope
                window.windowedCount = 0;
                MockClock.setInterval("window.windowedCount++", 5);
                MockClock.advance(15);
                assert(window.windowedCount).equals(3);
            });
        });
    });
    
    describe("clearTimeout", function(){
        after(function(){
            MockClock.reset();           
        });
        
        it("should not throw exception when passed no key", function(){
            assert(function(){
                MockClock.clearTimeout();                
            }).doesNotThrowException();
        });
        it("should not run when advanced past fn when passed a valid key", function(){
            var count = 0;
            var intervalId = MockClock.setTimeout(function(){
                count++;                
            }, 5);
            MockClock.clearTimeout(intervalId);
            MockClock.advance(15);
            assert(count).equals(0);
        });
    });
    
    describe("clearInterval", function(){
       after(function(){
           MockClock.reset();           
       });
       
       it("should not throw exception when passed no key", function(){
           assert(function(){
               MockClock.clearTimeout();                
           }).doesNotThrowException();           
       });
       it("should not run when advanced past fn multiple times when passed a valid key", function(){
           var count = 0;
           var intervalId = MockClock.setInterval(function(){
               count++;                
           }, 5);
           MockClock.clearInterval(intervalId);
           MockClock.advance(15);
           assert(count).equals(0);           
       });
       it("should not continue to run an interval which clears itself", function(){
           var count = 0;
           var intervalId = MockClock.setInterval(function(){
               count++;
               if(count === 4) {
                   MockClock.clearInterval(intervalId);                   
               }
           }, 5);      
           MockClock.advance(100);
           assert(count).equals(4);     
       });
    });
    
    describe("advance", function(){
        after(function(){
            MockClock.reset();           
        });
        
        it("should throw exception when not passed a positive ms", function(){
            assert(function(){
                MockClock.advance(-4);
            }).throwsException("'ms' argument must be a positive number");
            assert(function(){
                MockClock.advance("somestring");
            }).throwsException("'ms' argument must be a positive number");
        });
        it("should run scheduled fns within range when passed a ms", function(){
            var funcRunA = false;
            var funcRunB = false;            
            MockClock.setTimeout(function(){
                funcRunA = true;
            }, 5);
            MockClock.setTimeout(function(){
                funcRunB = true;                
            }, 10)
            MockClock.advance(11);
            assert(funcRunA).isTrue();
            assert(funcRunB).isTrue();
        });
        it("should run more scheduled fns on subsequent advances", function(){
            var funcRunACount = 0;
            var funcRunBCount = 0;
            var funcRunCCount = 0;
            MockClock.setTimeout(function(){
                funcRunACount++;                
            }, 10);
            MockClock.setTimeout(function(){
                funcRunBCount++;                
            }, 12);
            MockClock.setInterval(function(){
                funcRunCCount++;                
            }, 5);
            MockClock.advance(5);
            MockClock.advance(5);
            MockClock.advance(10);
            assert(funcRunACount).equals(1);
            assert(funcRunBCount).equals(1);
            assert(funcRunCCount).equals(4);
        });
        it("should execute timeouted functions with 'this' scoped to global", function(){
            var global = window;
            var scope = null;
            MockClock.setTimeout(function(){
                scope = this;                
            }, 10);
            MockClock.advance(10);
            assert(scope).equals(global);
        });
        it("should execute intervaled functions with 'this' scoped to global", function(){
            var global = window;
            var scope = null;
            MockClock.setInterval(function(){
                scope = this;                
            }, 10);
            MockClock.advance(10);
            assert(scope).equals(global);
        });
        it("should execute interweaving of intervals and timeouts in order they would occur", function(){
            var runs = [];
            MockClock.setTimeout(function(){
                runs.push('a');
            }, 10);
            MockClock.setInterval(function(){
                runs.push('b');                
            }, 3);
            MockClock.setTimeout(function(){
                runs.push('c');                                
            }, 5);
            MockClock.setInterval(function(){
                runs.push('d');                
            }, 7);
            MockClock.advance(15);
            MockClock.advance(7);
            assert(runs).isSameAs(['b','c','b','d','b','a','b','d','b','b','d','b']);
        });
        describe("when schedules collide", function() {
            it("should first run fns on longer intervals before those on shorter", function(){
                var runs = [];
                MockClock.setInterval(function(){
                    runs.push('a');                    
                }, 7);                
                MockClock.setInterval(function(){
                    runs.push('b');
                }, 21);
                MockClock.advance(21);
                assert(runs).isSameAs(['a','a','b','a']);
            });
            it("should first run fns on longer intervals before those on shorter including timeouts", function(){
                var runs = [];
                MockClock.setInterval(function(){
                    runs.push('a');                    
                }, 7);                
                MockClock.setTimeout(function(){
                    runs.push('b');
                }, 21);
                MockClock.setInterval(function(){
                    runs.push('c');
                }, 14);
                MockClock.advance(21);
                assert(runs).isSameAs(['a','c','a','b','a']);
            });
            it("should then run fns in order of scheduling when intervals are equal", function(){
                var runs = [];
                MockClock.setInterval(function(){
                    runs.push('a');
                }, 7);
                MockClock.setInterval(function(){
                    runs.push('b');
                }, 7);
                MockClock.setInterval(function(){
                    runs.push('c');
                }, 14);
                MockClock.advance(6);
                MockClock.advance(21);
                assert(runs).isSameAs(['a','b','c','a','b','a','b']);
            });
        });
    });
    
    describe("reset", function(){
        after(function(){
            MockClock.reset();           
        });
        
        it("should not have called fns when fns scheduled, reset called, and advanced", function(){
            var funcRunA = false;
            var funcRunB = false;            
            MockClock.setTimeout(function(){
                funcRunA = true;
            }, 5);
            MockClock.setTimeout(function(){
                funcRunB = true;                
            }, 10)
            MockClock.reset();
            MockClock.advance(11);
            assert(funcRunA).isFalse();
            assert(funcRunB).isFalse();
        });
        it("should reset offset so that new Dates are equal to real Date", function(){
            var originalDate = new original.Date();
            
            MockClock.advance(200);
            var mockDateAdvance = new MockClock.Date();
            var difference = mockDateAdvance - originalDate;
            
            MockClock.reset();
            var mockDateAfterReset = new MockClock.Date();
            var differenceReset = mockDateAfterReset - originalDate;
            
            assert(difference).equals(200);
            assert(differenceReset).equals(0);
        });
    });
    
    describe("Date", function(){
        after(function(){
            MockClock.reset();           
        });
        
        it("should behave same as native Date when passed one argument", function(){
            var originalDate = new original.Date(699769876987);
            var mockDate = new MockClock.Date(699769876987);
            MockClock.advance(200);
            var advancedMockDate = new MockClock.Date(699769876987);
            assert(originalDate).isSameAs(mockDate);
            assert(originalDate).isSameAs(advancedMockDate);
        });
        it("should behave same as native Date when passed multiple arguments", function(){
            var originalDate = new original.Date(1995,11,17);
            var mockDate = new MockClock.Date(1995,11,17);
            MockClock.advance(200);
            var advancedMockDate = new MockClock.Date(1995,11,17);
            assert(originalDate).isSameAs(mockDate);
            assert(originalDate).isSameAs(advancedMockDate);            
        });
        describe("when passed no argument", function(){
            it("should create Date with value same as native Date when not yet advanced", function(){
                var originalDate = new original.Date();
                var mockDate = new MockClock.Date();
                var difference = mockDate - originalDate;
                assert(difference).equals(0);                
            });
            it("should create Date offset by the advanced ms when advanced once", function(){
                var originalDate = new original.Date();
                MockClock.advance(200);
                var mockDate = new MockClock.Date();
                var difference = mockDate - originalDate;
                assert(difference).equals(200);                
            });
            it("should create Dates offset by accumulation of advancements when advanced multiple times", function(){
                var originalDate = new original.Date();
                
                MockClock.advance(200);
                var mockDateOneAdvance = new MockClock.Date();
                var differenceOneAdvance = mockDateOneAdvance - originalDate;
                
                MockClock.advance(200);
                var mockDateTwoAdvance = new MockClock.Date();
                var differenceTwoAdvance = mockDateTwoAdvance - originalDate;
                
                MockClock.advance(200);
                var mockDateThreeAdvance = new MockClock.Date();
                var differenceThreeAdvance = mockDateThreeAdvance - originalDate;
                
                assert(differenceOneAdvance).equals(200);
                assert(differenceTwoAdvance).equals(400);
                assert(differenceThreeAdvance).equals(600);
            });
        });
    });
});

