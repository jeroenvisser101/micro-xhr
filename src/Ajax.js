(function (window, encodeURIComponent) {
    'use strict';

    /**
     * Creates a new AJAX request.
     *
     * @param {object|string} url Either the options object or a url
     * @param {object} [options] The options object
     *
     * @constructor
     */
    var Ajax = function (url, options) {
        this.request(url, options);

        return this;
    };

    /**
     * Normalizes the parameters.
     *
     * @param {object|string} url Either the options object or a url
     * @param {object} [options] The options object
     *
     * @returns {object} options
     */
    Ajax.normalize = function (url, options) {
        if (typeof url === 'object' && url !== null) {
            options = url;
        } else if (typeof url === 'string') {
            options = options || {};
            options.url = url;
        } else {
            throw 'Ajax.request\'s parameters where not set correctly. ' +
                'Please refer to the manual for more information.';
        }

        options.method = options.method || 'GET';

        return options;
    };

    /**
     * An array containing data transformers.
     *
     * @type {object}
     */
    Ajax.dataTransformers = {
        'json': function (data) {
            // We append an empty string so that `null` will not break the thing
            return JSON.parse(data + "");
        }
    };

    /**
     * Transforms the data based on it's type.
     *
     * @param {string} data The data string
     * @param {string} type The datatype of the data given
     *
     * @return {*}
     */
    Ajax.transformData = function (data, type) {
        // If type is not defined, we just return the data
        if (!type) return data;

        // Loop through all transformers
        for (var transformerType in this.dataTransformers) {
            var transformer = this.dataTransformers[transformerType];

            // See if the transformer matches the datatype
            if (type == type) {
                // Let the transformer parse the data
                return transformer(data);
            }
        }
    };

    /**
     * Gets the post data as a serialized string.
     *
     * @param {object} options
     * @returns {null|string}
     */
    Ajax.getPostData = function (options) {
        var method = options.method;

        // If it's a valid method and there is data
        if ((method === 'POST' || method === 'DELETE' || method === 'PUT') && options.data) {
            return this.serialize(options.data);
        }

        return null;
    };

    /**
     * Serializes data to a query string.
     *
     * @param object The object to be queried to
     * @param [parent] The parent of the object (will be prepended to the key)
     *
     * @returns {string}
     */
    Ajax.serialize = function (object, parent) {
        var key, string = '';
        for (key in object) {
            if (!object.hasOwnProperty(key)) {
                continue;
            }

            // Prepend an ampersand when it's not the first item
            if (string != '') {
                string += '&';
            }

            // If the current item is an object, iterate through that object
            // and tell the function that it's all from the parent
            if (typeof object[key] === 'object') {
                string += Ajax.serialize(object[key], key);
                continue;
            }

            // If the parent is set, we d the data as child of the parent
            if (parent) {
                string += parent + '[' + encodeURIComponent(key) + ']';
            } else {
                string += encodeURIComponent(key)
            }

            // Append the value
            string += '=' + encodeURIComponent(object[key]);
        }

        return string;
    };

    /**
     * Creates a AJAX request.
     *
     * @param {object|string} url Either the options object or a url
     * @param {object} [options] The options object
     */
    Ajax.prototype.request = function (url, options) {
        // Normalize parameters
        options = Ajax.normalize(url, options);

        // If there are no options, it failed
        if (!options || options.length == 0) {
            throw 'Ajax.request expects an url or an options object, none given.';
        }

        // Create the XHR request itself
        this.xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

        // Variables that we'll use
        this.callbacks = [];

        // Aliasing this to _this for use in child functions
        var _this = this;

        /**
         * Easy to use shorthand for adding callbacks.
         *
         * @param {string} type The fn type
         * @param {function} fn The callback function itself
         * @param {string} [dataType]
         */
        this.callbacks.d = function (type, fn, dataType) {
            this.push({type: type, fn: fn, dataType: dataType});
        };

        /**
         * Callback for when the XHR request was successful.
         *
         * @param {function} callback
         * @param [dataType]
         */
        this.done = function (callback, dataType) {
            this.callbacks.d('done', callback, dataType);

            // Make sure the callbacks can be chained
            return this;
        };

        /**
         * Callback for when the XHR request was unsuccessful.
         *
         * @param {function} callback
         */
        this.fail = function (callback) {
            this.callbacks.d('fail', callback);

            // Make sure the callbacks can be chained
            return this;
        };

        /**
         * Callback that will always be called.
         *
         * @param {function} callback
         */
        this.always = function (callback) {
            this.callbacks.d('always', callback);

            // Make sure the callbacks can be chained
            return this;
        };

        /**
         * Calls the callbacks.
         *
         * @param type The callback type to be called
         * @param xhr
         */
        this.callCallbacks = function (type, xhr) {
            // Send the data through the data transformer first
            var data = xhr.response;

            // Loop trough all callbacks
            for (var callback in _this.callbacks) {
                if (!_this.callbacks.hasOwnProperty(callback)) continue;

                callback = _this.callbacks[callback];
                // Check if the callback is equal to the type that
                // has to be called this time
                if (callback.type === type) {
                    // Check what type it is
                    if (type === 'done') {
                        // Fpr callbacks that have the 'done' type
                        callback.fn.call(xhr, Ajax.transformData(data, callback.dataType), xhr.status, xhr);
                    } else if (type === 'fail') {
                        // For callbacks that have the 'fail' type
                        callback.fn.call(xhr, xhr, xhr.status, xhr.error);
                    } else {
                        // For callbacks that have the 'always' type and other
                        callback.fn.call(xhr, xhr, xhr.status);
                    }
                }
            }
        };

        // Add the XHR eventlistener
        this.xhr.onreadystatechange = function () {
            if (this.readyState === 4 && (this.status >= 200 && this.status < 400)) {
                // Callbacks for successful requests
                _this.callCallbacks('done', this);
            } else if (this.readyState === 4) {
                // Callbacks for failed requests
                _this.callCallbacks('fail', this);
            }

            // Call the always callbacks
            if (this.readyState === 4) {
                _this.callCallbacks('always', this);
            }
        };

        // Add the error eventhandler for XHR
        this.xhr.onerror = function () {
            _this.callCallbacks('fail', this);
        };

        // Send the request
        this.xhr.open(options.method, options.url, true);
        this.xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
        this.xhr.send(Ajax.getPostData(options));

        return this;
    };

    // Add it to window for global use
    window.Ajax = Ajax;
})(window, encodeURIComponent);
