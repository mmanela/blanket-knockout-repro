QUnit.extensions = {
    /// <summary>
    /// QUnit Extensions
    /// Author: John Kurlak (kurlak@microsoft.com)
    /// Last Updated: 9/14/2012
    /// Version 0.2
    ///
    /// Makes it easy to add extensions to QUnit.
    ///
    /// Current extensions:
    ///  - Function Tracker
    /// </summary>

    extend: function (destination, source) {
        /// <summary>
        /// This "extension" is useful for adding other
        /// extensions to the global namespace.
        /// </summary>
        /// <param name="destination">The object to end</param>
        /// <param name="source">The object with which to extend</param>

        var property;

        for (property in source) {
            if (property !== 'init') {
                destination[property] = source[property];
            }
        }
    },
    
    functionTracker: {
        /// <summary>
        /// This extension makes it easy to track whether
        /// functions are called during a certain code path.
        /// </summary>

        init: function () {
            /// <summary>
            /// This function sets up the object that will store all function tracking data.
            /// </summary>

            var that = QUnit.extensions.functionTracker;

            QUnit.begin = function () {
                that.resetFunctionTracker();
            };
        },
        
        resetFunctionTracker: function () {
            /// <summary>
            /// This function resets the object that stores all function tracking data.
            /// </summary>

            var that = QUnit.extensions.functionTracker;
            that.functionTracker = {
                index: 0,
                called: [],
                functions: []
            };
        },

        trackFunction: function (context, name) {
            /// <summary>
            /// This function enables tracking for the given function.
            /// </summary>
            /// <param name="context">The scope/context from which to execute the function we're tracking</param>
            /// <param name="name">The name of the function to track</param>
            /// <param name="replace">
            /// (optional) Can be set to a callback if the wants to change the functionality of the given function.
            /// </param>
            /// <param name="isConstructor">
            /// (optional) A boolean value determining whether to treat the function we're tracking as a constructor or not.
            /// </summary>
            /// <returns>A handle (integer) to the function we're tracking</returns>

            if (!context || !context[name]) {
                return null;
            }

            var replace, isConstructor;

            // Identify by data type which optional arguments were passed in

            if (arguments.length === 3) {
                if (typeof arguments[2] === 'function') {
                    replace = arguments[2];
                } else {
                    isConstructor = arguments[2];
                }
            } else if (arguments.length === 4) {
                if (typeof arguments[2] === 'function') {
                    replace = arguments[2];
                    isConstructor = arguments[3];
                } else {
                    replace = arguments[3];
                    isConstructor = arguments[2];
                }
            }

            var that = QUnit.extensions.functionTracker,
                funct = context[name],
                index = that.functionTracker.index;
            
            // Store tracking details for the given function
            that.functionTracker.functions.push({
                context: context,
                name: name,
                funct: funct
            });

            // Add tracking code to the given function
            context[name] = function () {
                /// <summary>
                /// This function replaces the function we're tracking.  It also invokes the function we're tracking.
                /// </summary>

                // Store that this function was called
                // Note: make sure we that we always store before we call the function so that nested tracking works
                that.functionTracker.called.push(index);

                // If the user wants to replace the given functionality, let him
                if (replace) {
                    funct = replace;
                    context = null;
                }

                // Call the original function (or replacement, if applicable)
                if (isConstructor) {
                    return that._construct(funct, arguments);
                } else {
                    return funct.apply(context, arguments);
                }
            };

            // Return a unique identifier that can be used to track this function
            return that.functionTracker.index++;
        },

        untrackFunction: function (index) {
            /// <summary>
            /// This function accepts a function identifier and stops
            /// tracking that function, if applicable.
            /// </summary>
            /// <param name="index">The index of the function to stop tracking</param>

            if (index !== null) {
                var that = QUnit.extensions.functionTracker,
                    functRef = that.functionTracker.functions[index],
                    context = functRef.context,
                    name = functRef.name,
                    funct = functRef.funct;
                context[name] = funct;
            }
        },

        wereFunctionsCalled: function (functArr) {
            /// <summary>
            /// This function determines if the given function or array of functions
            /// was called in the order provided.  It returns true or false
            /// accordingly.
            /// </summary>
            /// <param name="functArr">The array of functions that we want call data from</param>
            /// <returns>Boolean indicating whether the functions in the given array were called</returns>

            // Ensure that our argument is an array
            if (functArr !== undefined && typeof (functArr) !== 'object') {
                functArr = [functArr];
            }

            var that = QUnit.extensions.functionTracker,
                current = 0,
                returnVal = false;

            // Loop through each of the called functions
            $.each(that.functionTracker.called, function () {
                // Check to see if we found a function that matches the current one we are looking for
                if (this == functArr[current]) {
                    // If it does, start looking for the next function in our argument list
                    current++;

                    // If we've found all the functions in the argument list, return true
                    if (current === functArr.length) {
                        returnVal = true;
                        return;
                    }
                }
            });

            return returnVal;
        },

        _construct: function (constructor, args) {
            /// <summary>
            /// This function constructs an object.
            /// </summary>
            /// <param name="constructor">The constructor function</param>
            /// <param name="arg">The arguments to pass to the constructor</param>
            /// <returns>An instance of the object we're constructing</returns>

            var F = function () {
                return constructor.apply(this, args);
            };
            F.prototype = constructor.prototype;
            
            return new F();
        } 
    }
};

$.each(QUnit.extensions, function () {
    /// <summary>
    /// Loads each extension in this file into QUnit.
    /// </summary>

    // Make the current extension a member of the global namespace
    if (this != 'extend') {
        QUnit.extensions.extend(window, this);
    }

    // Call the init() function of the current extension, if it exists
    if (typeof (this) === 'object' && this.init) {
        this.init.call();
    }
});