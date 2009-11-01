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

QUnit.specify("DeLorean", function() {

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
            var result = DeLorean.globalApi();
            assert(result).isFalse();
        });
        
        describe("when passed 'true'", function(){
            
            before(function(){
                DeLorean.globalApi(true);
            });
            
            it("should return 'true' on subsequent calls", function(){
                var result = DeLorean.globalApi();
                assert(result).isTrue();
            });
            
            it("should inject global api", function(){
                assert(window.Date).equals(DeLorean.Date);
                assert(window.setInterval).equals(DeLorean.setInterval);
                assert(window.setTimeout).equals(DeLorean.setTimeout);
                assert(window.clearInterval).equals(DeLorean.clearInterval);
                assert(window.clearTimeout).equals(DeLorean.clearTimeout);
            });
            
            it("should not inject 'globalApi', 'reset', or 'advance'", function(){
                assert(window.globalApi).isUndefined();
                assert(window.reset).isNotEqualTo(DeLorean.reset);
                assert(window.advance).isUndefined();
            });
        });
        
        describe("when passed 'false'", function(){
            before(function(){
                DeLorean.globalApi(false);                
            });
            
            it("should return 'false' on subsequent calls", function(){
                var result = DeLorean.globalApi();
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
                DeLorean.globalApi(true);
                assert(window.Date).equals(DeLorean.Date);
                assert(window.Date).isNotEqualTo(original.Date);
                
                // then remove and make sure fully removed
                DeLorean.globalApi(false);
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
            DeLorean.reset();            
        });
        
        describe("exceptional situations", function(){
            it("should throw exception when passed no params", function(){
                assert(function(){
                    DeLorean.setTimeout();
                }).throwsException("Function setTimeout requires at least 1 parameter");
            });
            it("should throw exception when passed just ms", function(){
                assert(function(){                    
                    DeLorean.setTimeout(45);
                }).throwsException("useless setTimeout call (missing quotes around argument?)")
            });
            it("should schedule fn at 0 ms when passed just fn", function(){
                var count = 0;
                DeLorean.setTimeout(function(){
                    count++;                                        
                });
                DeLorean.advance(5);
                assert(count).equals(1);
            });
        });
        describe("when passed a fn and time", function(){
            it("should return a timeout id", function(){
                var intervalId = null;
                intervalId = DeLorean.setTimeout(function(){}, 5);
                assert(intervalId).isNotNull();
            });
            it("should not run fn when advanced to before the time", function(){
                var count = 0;
                DeLorean.setTimeout(function(){
                    count++;
                }, 5);
                DeLorean.advance(4);
                assert(count).equals(0);                              
            });
            it("should run fn once when advanced to exactly the time", function(){
                var count = 0;
                DeLorean.setTimeout(function(){
                    count++;                    
                }, 5);
                DeLorean.advance(5);
                assert(count).equals(1);                
            });
            it("should have run fn once when advanced to time and a half", function(){
                var count = 0;
                DeLorean.setTimeout(function(){
                    count++;                    
                }, 5);
                DeLorean.advance(8);
                assert(count).equals(1);                
            });
            it("should only have run fn once when advanced three times the time", function(){
                var count = 0;
                DeLorean.setTimeout(function(){
                    count++;                    
                }, 5);
                DeLorean.advance(15);
                assert(count).equals(1);                
            });
        });
        describe("when passed a string instead of fn", function(){
            it("should schedule an evaling of fn", function(){
                // using a globally-scoped variable since 
                // eval-created functions don't have access to local scope
                window.windowedCount = 0;
                DeLorean.setTimeout("window.windowedCount++", 5);
                DeLorean.advance(15);
                assert(window.windowedCount).equals(1);                
            });
        });          
    });
    
    describe("setInterval", function(){
        after(function(){
            DeLorean.reset();            
        });
        
        describe("exceptional situations", function(){
            it("should throw exception when passed no params", function(){
                assert(function(){
                    DeLorean.setInterval();                                        
                }).throwsException("Function setInterval requires at least 1 parameter")
            });
            it("should throw exception when passed just ms", function(){
                assert(function(){
                    DeLorean.setInterval(45);                                        
                }).throwsException("useless setTimeout call (missing quotes around argument?)")                
            });
            it("should behave like setTimeout with 0 ms when passed just fn", function(){
                var count = 0;
                DeLorean.setInterval(function(){
                    count++;                                        
                });
                DeLorean.advance(5);
                assert(count).equals(1);                                
            });
        });
        describe("when passed a fn and time", function(){
            it("should return an interval id", function(){
                var intervalId = null;
                intervalId = DeLorean.setInterval(function(){}, 5);
                assert(intervalId).isNotNull();                
            });
            it("should not have run fn when advanced to before the time", function(){
                var count = 0;
                DeLorean.setInterval(function(){
                    count++;
                }, 5);
                DeLorean.advance(4);
                assert(count).equals(0);                
            });
            it("should have run fn once when advanced to exactly the time", function(){
                var count = 0;
                DeLorean.setInterval(function(){
                    count++;
                }, 5);
                DeLorean.advance(5);
                assert(count).equals(1);                
            });
            it("should have run fn once when advanced to time and a half", function(){
                var count = 0;
                DeLorean.setInterval(function(){
                    count++;
                }, 5);
                DeLorean.advance(5);
                assert(count).equals(1);                                
            });
            it("should have run fn thrice when advanced to exactly three times", function(){
                var count = 0;
                DeLorean.setInterval(function(){
                    count++;
                }, 5);
                DeLorean.advance(15);
                assert(count).equals(3);
            });
            it("should allow for the setting of intervals within other timeouts and reverse", function(){
                var runs = [];
                DeLorean.setTimeout(function(){
                    runs.push('a');
                    DeLorean.setTimeout(function(){
                        runs.push('b');
                        DeLorean.setInterval(function(){
                            runs.push('c');
                            DeLorean.setTimeout(function(){
                                runs.push('d');            
                            }, 1);
                        }, 2);
                    }, 3);
                }, 5);
                DeLorean.advance(15);
                assert(runs).isSameAs(['a','b','c','d','c','d','c','d']);
            });       
            it("should allow for setting of intervals within intervals", function(){
                var runs = [];
                DeLorean.setInterval(function(){
                    runs.push('a');
                    DeLorean.setInterval(function(){
                        runs.push('b');                                                                        
                    }, 3);                    
                }, 5);
                DeLorean.advance(20);
                assert(runs).isSameAs(['a','b','a','b','b','b','a','b','b','b','b','a','b']);
            });   
        });
        describe("when passed a string instead of fn", function(){
            it("should schedule an evaling of fn", function(){
                // using a globally-scoped variable since 
                // eval-created functions don't have access to local scope
                window.windowedCount = 0;
                DeLorean.setInterval("window.windowedCount++", 5);
                DeLorean.advance(15);
                assert(window.windowedCount).equals(3);
            });
        });
    });
    
    describe("clearTimeout", function(){
        after(function(){
            DeLorean.reset();           
        });
        
        it("should not throw exception when passed no key", function(){
            assert(function(){
                DeLorean.clearTimeout();                
            }).doesNotThrowException();
        });
        it("should not run when advanced past fn when passed a valid key", function(){
            var count = 0;
            var intervalId = DeLorean.setTimeout(function(){
                count++;                
            }, 5);
            DeLorean.clearTimeout(intervalId);
            DeLorean.advance(15);
            assert(count).equals(0);
        });
    });
    
    describe("clearInterval", function(){
       after(function(){
           DeLorean.reset();           
       });
       
       it("should not throw exception when passed no key", function(){
           assert(function(){
               DeLorean.clearTimeout();                
           }).doesNotThrowException();           
       });
       it("should not run when advanced past fn multiple times when passed a valid key", function(){
           var count = 0;
           var intervalId = DeLorean.setInterval(function(){
               count++;                
           }, 5);
           DeLorean.clearInterval(intervalId);
           DeLorean.advance(15);
           assert(count).equals(0);           
       });
       it("should not continue to run an interval which clears itself", function(){
           var count = 0;
           var intervalId = DeLorean.setInterval(function(){
               count++;
               if(count === 4) {
                   DeLorean.clearInterval(intervalId);                   
               }
           }, 5);      
           DeLorean.advance(100);
           assert(count).equals(4);     
       });
       it("should properly clear intervals when cleared from within a nested interval", function(){
           var runs = [];
           var outerCount = 0;
           var innerCount = 0;
           var outerInterval = DeLorean.setInterval(function(){
               runs.push('a');
               outerCount++;
               var innerInterval = DeLorean.setInterval(function(){
                   runs.push('b');                                      
                   innerCount++;
                   if(innerCount === 4) {
                       DeLorean.clearInterval(outerInterval);
                   }
               }, 3);
           }, 5);
           DeLorean.advance(15);
           assert(runs).isSameAs(['a','b','a','b','b','b']);
       });
    });
    
    describe("advance", function(){
        after(function(){
            DeLorean.reset();           
        });
        
        it("should throw exception when not passed a positive ms", function(){
            assert(function(){
                DeLorean.advance(-4);
            }).throwsException("'ms' argument must be a positive number");
            assert(function(){
                DeLorean.advance("somestring");
            }).throwsException("'ms' argument must be a positive number");
        });
        it("should run scheduled fns within range when passed a ms", function(){
            var funcRunA = false;
            var funcRunB = false;            
            DeLorean.setTimeout(function(){
                funcRunA = true;
            }, 5);
            DeLorean.setTimeout(function(){
                funcRunB = true;                
            }, 10)
            DeLorean.advance(11);
            assert(funcRunA).isTrue();
            assert(funcRunB).isTrue();
        });
        it("should run more scheduled fns on subsequent advances", function(){
            var funcRunACount = 0;
            var funcRunBCount = 0;
            var funcRunCCount = 0;
            DeLorean.setTimeout(function(){
                funcRunACount++;                
            }, 10);
            DeLorean.setTimeout(function(){
                funcRunBCount++;                
            }, 12);
            DeLorean.setInterval(function(){
                funcRunCCount++;                
            }, 5);
            DeLorean.advance(5);
            DeLorean.advance(5);
            DeLorean.advance(10);
            assert(funcRunACount).equals(1);
            assert(funcRunBCount).equals(1);
            assert(funcRunCCount).equals(4);
        });
        it("should execute timeouted functions with 'this' scoped to global", function(){
            var global = window;
            var scope = null;
            DeLorean.setTimeout(function(){
                scope = this;                
            }, 10);
            DeLorean.advance(10);
            assert(scope).equals(global);
        });
        it("should execute intervaled functions with 'this' scoped to global", function(){
            var global = window;
            var scope = null;
            DeLorean.setInterval(function(){
                scope = this;                
            }, 10);
            DeLorean.advance(10);
            assert(scope).equals(global);
        });
        it("should execute interweaving of intervals and timeouts in order they would occur", function(){
            var runs = [];
            DeLorean.setTimeout(function(){
                runs.push('a');
            }, 10);
            DeLorean.setInterval(function(){
                runs.push('b');                
            }, 3);
            DeLorean.setTimeout(function(){
                runs.push('c');                                
            }, 5);
            DeLorean.setInterval(function(){
                runs.push('d');                
            }, 7);
            DeLorean.advance(15);
            DeLorean.advance(7);
            assert(runs).isSameAs(['b','c','b','d','b','a','b','d','b','b','d','b']);
        });
        describe("when schedules collide", function() {
            it("should first run fns on longer intervals before those on shorter", function(){
                var runs = [];
                DeLorean.setInterval(function(){
                    runs.push('a');                    
                }, 7);                
                DeLorean.setInterval(function(){
                    runs.push('b');
                }, 21);
                DeLorean.advance(21);
                assert(runs).isSameAs(['a','a','b','a']);
            });
            it("should first run fns on longer intervals before those on shorter including timeouts", function(){
                var runs = [];
                DeLorean.setInterval(function(){
                    runs.push('a');                    
                }, 7);                
                DeLorean.setTimeout(function(){
                    runs.push('b');
                }, 21);
                DeLorean.setInterval(function(){
                    runs.push('c');
                }, 14);
                DeLorean.advance(21);
                assert(runs).isSameAs(['a','c','a','b','a']);
            });
            it("should then run fns in order of scheduling when intervals are equal", function(){
                var runs = [];
                DeLorean.setInterval(function(){
                    runs.push('a');
                }, 7);
                DeLorean.setInterval(function(){
                    runs.push('b');
                }, 7);
                DeLorean.setInterval(function(){
                    runs.push('c');
                }, 14);
                DeLorean.advance(6);
                DeLorean.advance(21);
                assert(runs).isSameAs(['a','b','c','a','b','a','b']);
            });
        });
        it("should return accumulation of elapsed ms", function() {
            DeLorean.advance(10);
            assert(DeLorean.advance()).equals(10);                        
            DeLorean.advance(3);
            assert(DeLorean.advance()).equals(13);
            DeLorean.advance(12);
            assert(DeLorean.advance()).equals(25);
        });
        
        it("should return proper accumulation of elapsed ms, even within intervaled callbacks", function(){
            var calls = [];
            DeLorean.setInterval(function(){
                calls.push(DeLorean.advance());
                DeLorean.setTimeout(function(){
                    calls.push(DeLorean.advance());
                }, 3);
            }, 5);
            DeLorean.advance(20);
            assert(calls).isSameAs([5,8,10,13,15,18,20]);
        });        
        it("should not advance when not passed ms, but also should still return accumulation", function(){
            // first advance to 15
            DeLorean.advance(15);
            var resultOfFirstTry = DeLorean.advance();            
            var resultOfSecondTry = DeLorean.advance();
            assert(resultOfFirstTry).equals(15);            
            assert(resultOfSecondTry).equals(15);            
        });
    });
    
    describe("reset", function(){
        after(function(){
            DeLorean.reset();           
        });
        
        it("should not have called fns when fns scheduled, reset called, and advanced", function(){
            var funcRunA = false;
            var funcRunB = false;            
            DeLorean.setTimeout(function(){
                funcRunA = true;
            }, 5);
            DeLorean.setTimeout(function(){
                funcRunB = true;                
            }, 10)
            DeLorean.reset();
            DeLorean.advance(11);
            assert(funcRunA).isFalse();
            assert(funcRunB).isFalse();
        });
        it("should reset offset so that new Dates are equal to real Date", function(){
            var originalDate = new original.Date();
            
            DeLorean.advance(200);
            var mockDateAdvance = new DeLorean.Date();
            var difference = mockDateAdvance - originalDate;
            
            DeLorean.reset();
            var mockDateAfterReset = new DeLorean.Date();
            var differenceReset = mockDateAfterReset - originalDate;
            
            assert(difference).equals(200);
            assert(differenceReset).equals(0);
        });
    });
    
    describe("Date", function(){
        after(function(){
            DeLorean.reset();           
        });
        
        it("should behave same as native Date when passed one argument", function(){
            var originalDate = new original.Date(699769876987);
            var mockDate = new DeLorean.Date(699769876987);
            DeLorean.advance(200);
            var advancedMockDate = new DeLorean.Date(699769876987);
            assert(originalDate).isSameAs(mockDate);
            assert(originalDate).isSameAs(advancedMockDate);
        });
        it("should behave same as native Date when passed multiple arguments", function(){
            var originalDate = new original.Date(1995,11,17);
            var mockDate = new DeLorean.Date(1995,11,17);
            DeLorean.advance(200);
            var advancedMockDate = new DeLorean.Date(1995,11,17);
            assert(originalDate).isSameAs(mockDate);
            assert(originalDate).isSameAs(advancedMockDate);            
        });
        describe("when passed no argument", function(){
            it("should create Date with value same as native Date when not yet advanced", function(){
                var originalDate = new original.Date();
                var mockDate = new DeLorean.Date();
                var difference = mockDate - originalDate;
                assert(difference).equals(0);                
            });
            it("should create Date offset by the advanced ms when advanced once", function(){
                var originalDate = new original.Date();
                DeLorean.advance(200);
                var mockDate = new DeLorean.Date();
                var difference = mockDate - originalDate;
                assert(difference).equals(200);                
            });
            it("should create Dates offset by accumulation of advancements when advanced multiple times", function(){
                var originalDate = new original.Date();
                
                DeLorean.advance(200);
                var mockDateOneAdvance = new DeLorean.Date();
                var differenceOneAdvance = mockDateOneAdvance - originalDate;
                
                DeLorean.advance(200);
                var mockDateTwoAdvance = new DeLorean.Date();
                var differenceTwoAdvance = mockDateTwoAdvance - originalDate;
                
                DeLorean.advance(200);
                var mockDateThreeAdvance = new DeLorean.Date();
                var differenceThreeAdvance = mockDateThreeAdvance - originalDate;
                
                assert(differenceOneAdvance).equals(200);
                assert(differenceTwoAdvance).equals(400);
                assert(differenceThreeAdvance).equals(600);
            });
            it("should create Dates offset by accumulation of elapsed time when created within nested callbacks", function(){
                var originalDate = new original.Date();
                var outerDate, innerDate;
                DeLorean.setTimeout(function(){
                    outerDate = new DeLorean.Date();
                    DeLorean.setTimeout(function(){
                        innerDate = new DeLorean.Date();
                    }, 3);
                }, 7);
                DeLorean.advance(10);
                assert(outerDate-originalDate).equals(7);
                assert(innerDate-originalDate).equals(10);
            })
        });
    });
});

