// ==UserScript==
// @name SoundCloud Stream Cleaner
// @namespace https://github.com/iammordaty
// @include https://soundcloud.com/*
// @version 0.0.1
// @grant GM_addStyle
// @grant GM_deleteValue
// @grant GM_getValue
// @grant GM_setValue
// ==/UserScript==

/**
 * @type {Object}
 */
var Utils = {

    /**
     * @param {String} event
     * @param {Function} handler
     * @returns {undefined}
     */
    on: function on(event, handler) {
        if (this.handlers === undefined) {
            this.handlers = {};
        }

        if (this.handlers[event] === undefined) {
            this.handlers[event] = [];
        }

        this.handlers[event].push(handler);
    },


    /**
     * @param {String} event
     * @returns {undefined}
     */
    trigger: function trigger(event) {
        if (this.handlers === undefined || (this.handlers[event] || []).length === 0) {
            return;
        }

        var args = [].slice.call(arguments, 1);

        this.handlers[event].forEach(function (handler) {
            handler.apply(null, args);
        });
    },


    /**
     * @param {Function} fn
     * @param {Integer} delay
     * @returns {Function}
     */
    throttle: function throttle(fn, delay) {
        var _this = this;

        var wait = false;

        return function () {
            for (var _len = arguments.length, argsArr = Array(_len), _key = 0; _key < _len; _key++) {
                argsArr[_key] = arguments[_key];
            }

            if (!wait) {
                fn.apply(_this, argsArr);
                wait = true;

                setTimeout(function () {
                    wait = false;
                }, delay);
            }
        };
    },


    /**
     * @param {String} url
     * @returns {undefined}
     */
    parseUrl: function parseUrl(url) {
        var parser = document.createElement('a');

        return function () {
            parser.href = url;

            return {
                url: parser.href,
                hostname: parser.hostname,
                pathname: parser.pathname,
                search: parser.search
            };
        }();
    }
};

/**
 * Represents track and the playlist
 *
 * @type {Object}
 */
var Resource = {

    /**
     * @param {HTMLElement} element
     * @returns {Object}
     */
    init: function init(element) {
        this.element = element;

        if (!element) {
            console.warn('no element!');

            return;
        }

        console.info('[resource.init]', {
            type: this.type,
            subtype: this.subtype,
            url: this.url,
            deleted: this.deleted,
            element: this.element
        });

        this.prepareUi();
        this.updateUi();
    },


    /**
     * @param {HTMLElement} element
     * @returns {Object}
     */
    create: function create(element) {
        var resource = Object.create(Resource);

        resource.init(element);

        return resource;
    },


    /**
     * @type {String}
     */
    get type() {
        var type = this.element.querySelector('.trackList, .compactTrackList') ? 'playlist' : 'track';

        Object.defineProperty(this, 'type', { value: type, writable: false, enumerable: true });

        return type;
    },

    /**
     * @type {String}
     */
    get subtype() {
        var subtype = void 0;

        if (this.element.classList.contains('playbackSoundBadge')) {
            subtype = 'player';
        } else if (this.element.classList.contains('trackList__item')) {
            subtype = 'playlist';
        } else if (this.element.classList.contains('soundList__item')) {
            subtype = 'stream';
        } else if (this.element.querySelector('.fullListenHero') !== null) {
            subtype = 'hero';
        }

        Object.defineProperty(this, 'subtype', { value: subtype, writable: false, enumerable: true });

        return subtype;
    },

    /**
     * @type {String|undefined}
     */
    get url() {
        var url = void 0;

        switch (this.subtype) {
            case 'hero':
                url = window.location.href;
                break;

            case 'player':
                url = this.element.querySelector('.playbackSoundBadge__titleLink').getAttribute('href');
                break;

            case 'playlist':
                url = this.element.querySelector('.trackItem__trackTitle').getAttribute('href');
                break;

            case 'stream':
                url = this.element.querySelector('.soundContext__targetLink').getAttribute('href');
                break;
        }

        if (url !== undefined) {
            url = this.parseUrl(url).pathname || url;
        }

        Object.defineProperty(this, 'url', { value: url, writable: false, enumerable: true });

        return url;
    },

    /**
     * @type {Boolean}
     */
    get deleted() {
        return Storage.DeletedResources.has(this);
    },

    set deleted(value) {
        if (Boolean(value) === true) {
            Storage.DeletedResources.set(this);
        } else {
            Storage.DeletedResources.remove(this);
        }

        this.updateUi();
    },

    /**
     * @returns {undefined}
     */
    prepareUi: function prepareUi() {
        this.ui = Object.assign({}, Resource.Ui);
    },


    /**
     * @returns {undefined}
     */
    updateUi: function updateUi() {
        var _this2 = this;

        if (this.deleted === true && this.subtype === 'stream') {
            this.ui.delete(this);
        } else {
            this.ui.undelete(this);
        }

        if (this.subtype === 'player') {
            return;
        }

        var button = this.deleted === true ? this.ui.createUndeleteButton(this) : this.ui.createDeleteButton(this);

        button.addEventListener('click', function () {
            _this2.deleted = !_this2.deleted;
        }, false);

        this.ui.appendButton(button, this);
    }
};

Object.assign(Resource, Utils);

/**
 * Resource UI layer
 *
 * @type {Object}
 */
Resource.Ui = {

    /**
     * @param {Object} resource
     * @returns {undefined}
     */
    delete: function _delete(resource) {
        if (this.deleted(resource) === true) {
            return;
        }

        if (Storage.Settings.get('delete_mode') === 'hide') {
            resource.element.classList.add('ssc-deleted', 'ssc-hide');

            return;
        }

        var target = resource.element.querySelector('.soundContext__targetLink');
        var username = resource.element.querySelector('.soundTitle__username');
        var title = resource.element.querySelector('.soundTitle__title');
        var dash = document.createElement('span');

        dash.innerHTML = '&mdash;';

        target.parentNode.insertBefore(username, target);
        target.parentNode.insertBefore(dash, target);
        target.parentNode.insertBefore(title, target);

        resource.element.classList.add('ssc-deleted', 'ssc-compact');
    },


    /**
     * @param {Object} resource
     * @returns {undefined}
     */
    undelete: function undelete(resource) {
        if (this.deleted(resource) === false) {
            return;
        }

        resource.element.classList.remove('ssc-deleted', 'ssc-compact', 'ssc-hide');
    },


    /**
     * @param {Object} resource
     * @returns {Boolean}
     */
    deleted: function deleted(resource) {
        return resource.element.classList.contains('ssc-deleted');
    },


    /**
     * @param {Object} resource
     * @returns {HTMLElement}
     */
    createDeleteButton: function createDeleteButton(resource) {
        var button = this.createButton(resource);

        button.innerHTML = 'Delete';
        button.setAttribute('title', 'Delete this ' + resource.type + ' from stream');

        return button;
    },


    /**
     * @param {Object} resource
     * @returns {HTMLElement}
     */
    createUndeleteButton: function createUndeleteButton(resource) {
        var button = this.createButton(resource);

        button.innerHTML = 'Undelete';
        button.setAttribute('title', 'Undelete this ' + resource.type + ' from stream');

        return button;
    },


    /**
     * @param {HTMLElement} button
     * @param {Object} resource
     * @returns {undefined}
     */
    appendButton: function appendButton(button, resource) {
        var previousButton = resource.element.querySelector('.ssc-button');

        if (previousButton !== null) {
            previousButton.parentNode.removeChild(previousButton);
        }

        var refNode = resource.element.querySelector('.sc-button-share');

        refNode.parentNode.insertBefore(button, refNode);
    },


    /**
     * @param {Object} resource
     * @returns {HTMLElement}
     */
    createButton: function createButton(resource) {
        var button = document.createElement('button');
        var classList = this.getButtonClassList(resource);

        button.classList.add.apply(button.classList, classList);
        button.setAttribute('role', 'button');

        return button;
    },


    /**
     * @param {Object} resource
     * @returns {Array}
     */
    getButtonClassList: function getButtonClassList(resource) {
        var classList = ['ssc-button', 'sc-button-delete', 'sc-button', 'sc-button-responsive'];

        if (resource.subtype === 'hero') {
            classList.push('sc-button-medium');
        } else if (resource.subtype === 'stream') {
            classList.push('sc-button-small');
        } else if (resource.subtype === 'playlist') {
            classList.push('sc-button-icon', 'sc-button-small');
        }

        return classList;
    }
};

/**
 * @type {Object}
 */
var Storage = {

    /**
     * @param {String} key
     * @param {*} value
     * @returns {undefined}
     */
    set: function set(key, value) {
        GM_setValue(key, JSON.stringify(value));
    },


    /**
     * @param {String} key
     * @returns {*}
     */
    get: function get(key) {
        var value = GM_getValue(key) || null;

        if (value === null) {
            return null;
        }

        return JSON.parse(value);
    },


    /**
     * @param {String} key
     * @returns {undefined}
     */
    remove: function remove(key) {
        GM_deleteValue(key);
    }
};

/**
 * @type {Object}
 */
Storage.DeletedResources = {

    /**
     * @type {String}
     */
    get storageKey() {
        return 'deleted_resources`';
    },

    /**
     * @param {Object} resource
     * @returns {undefined}
     */
    set: function set(resource) {
        if (this.has(resource) === true) {
            return;
        }

        this.deletedResources.push(resource.url);

        Storage.set(this.storageKey, this.deletedResources);
    },


    /**
     * @param {Object} resource
     * @returns {Boolean}
     */
    has: function has(resource) {
        if (this.deletedResources === undefined) {
            this.deletedResources = Storage.get(this.storageKey) || [];
        }

        return this.deletedResources.indexOf(resource.url) !== -1;
    },


    /**
     * @param {Object} resource
     * @returns {undefined}
     */
    remove: function remove(resource) {
        if (this.has(resource) === false) {
            return;
        }

        this.deletedResources.splice(this.deletedResources.indexOf(resource.url), 1);

        Storage.set(this.storageKey, this.deletedResources);
    }
};

/**
 * @type {Object}
 */
Storage.Settings = {

    /**
     * @type {String}
     */
    get storageKey() {
        return 'settings';
    },

    /**
     * @type {String}
     */
    get defaultSettings() {
        return {
            delete_mode: 'hide' };
    },

    /**
     * @param {String} key
     * @param {*} value
     * @returns {undefined}
     */
    set: function set(key, value) {
        if (this.settings === undefined) {
            this.settings = Storage.get(this.storageKey) || this.defaultSettings;
        }

        this.settings[key] = value;

        Storage.set(this.storageKey, this.settings);
    },


    /**
     * @param {String} key
     * @returns {*}
     */
    get: function get(key) {
        this.settings = Storage.get(this.storageKey) || this.defaultSettings;

        return this.settings[key];
    },


    /**
     * @param {Object} key
     * @returns {Boolean}
     */
    has: function has(key) {
        this.settings = Storage.get(this.storageKey) || this.defaultSettings;

        return Object.keys(this.settings).indexOf(key) !== -1;
    }
};

/**
 * Represents resource page
 *
 * @type {Object}
 */
var Hero = {

    /**
     * @param {HTMLElement} app
     * @returns {undefined}
     */
    init: function init(app) {
        this.app = app;

        this.observe();
    },


    /**
     * @private
     * @returns {undefined}
     */
    observe: function observe() {
        var _this3 = this;

        var observers = {};

        var lastResourceUrl = void 0;

        observers.app = new MutationObserver(this.throttle(function () {
            var currentResourceUrl = window.location.href;

            if (lastResourceUrl === currentResourceUrl) {
                return;
            }

            lastResourceUrl = currentResourceUrl;

            var hero = _this3.app.querySelector('.fullListenHero');

            if (observers.playlist !== undefined || hero === null) {
                if (observers.playlist !== undefined && hero === null) {
                    observers.playlist.disconnect();

                    delete observers.playlist;
                }

                lastResourceUrl = null;

                return;
            }

            var element = _this3.app.querySelector('#content > div');
            var playlist = element.querySelector('.trackList ul');

            _this3.trigger('changed', Resource.create(element));

            if (playlist === null) {
                return;
            }

            playlist.querySelectorAll('.trackList__item').forEach(function (resourceElement) {
                _this3.waitForResourceElementLoad(resourceElement).then(function () {
                    _this3.trigger('changed', Resource.create(resourceElement));
                });
            });

            observers.playlist = new MutationObserver(function (mutations) {
                var additional = void 0;

                for (var i = 0; i < mutations.length; i++) {
                    mutations[i].addedNodes.forEach(function (element) {
                        if (element.nodeType === Node.ELEMENT_NODE && element.classList.contains('trackItem__additional')) {
                            additional = element;
                        }
                    });
                }

                if (additional !== undefined) {
                    var resourceElement = additional.parentNode.parentNode;

                    _this3.waitForResourceElementLoad(resourceElement).then(function () {
                        _this3.trigger('changed', Resource.create(resourceElement));
                    });
                }
            });

            observers.playlist.observe(playlist, {
                childList: true,
                subtree: true
            });
        }), 500);

        observers.app.observe(this.app, {
            childList: true,
            subtree: true
        });
    },


    /**
     * @private
     * @param {HTMLElement} element
     * @returns {Promise}
     */
    waitForResourceElementLoad: function waitForResourceElementLoad(element) {
        var _this4 = this;

        return new Promise(function (resolve) {
            var observer = new MutationObserver(function () {
                var share = element.querySelector('.sc-button-share');

                if (share !== null) {
                    resolve();
                }
            });

            observer.observe(_this4.app, {
                childList: true,
                subtree: true
            });
        });
    }
};

Object.assign(Hero, Utils);

/**
 * Represents the stream
 *
 * @type {Object}
 */
var Stream = {

    /**
     * @param {HTMLElement} app
     * @returns {undefined}
     */
    init: function init(app) {
        this.app = app;

        this.observe();
    },


    /**
     * @private
     * @returns {undefined}
     */
    observe: function observe() {
        var _this5 = this;

        var observers = {};

        observers.app = new MutationObserver(this.throttle(function () {
            var stream = _this5.app.querySelector('#content div.stream ul');

            if (observers.stream !== undefined || stream === null) {
                if (observers.stream !== undefined && stream === null) {
                    observers.stream.disconnect();

                    delete observers.stream;
                }

                return;
            }

            stream.querySelectorAll('.soundList__item').forEach(function (element) {
                _this5.trigger('changed', Resource.create(element));
            });

            observers.stream = new MutationObserver(function (mutations) {
                for (var i = 0; i < mutations.length; i++) {
                    mutations[i].addedNodes.forEach(function (element) {
                        _this5.trigger('changed', Resource.create(element));
                    });
                }
            });

            observers.stream.observe(stream, {
                childList: true
            });
        }), 500);

        observers.app.observe(this.app, {
            childList: true,
            subtree: true
        });
    }
};

Object.assign(Stream, Utils);

/**
 * Represents the track player
 *
 * @type {Object}
 */
var Player = {

    /**
     * @param {HTMLElement} app
     * @returns {undefined}
     */
    init: function init(app) {
        var _this6 = this;

        this.app = app;

        this.controls = {};
        this.direction = 'forward';

        this.getElement().then(function (element) {
            _this6.element = element;
            _this6.resourceElement = element.querySelector('.playbackSoundBadge');

            _this6.controls = {
                prev: _this6.element.querySelector('.playControls__control.playControls__prev'),
                play: _this6.element.querySelector('.playControls__control.playControls__play'),
                next: _this6.element.querySelector('.playControls__control.playControls__next')
            };

            _this6.observe();
        });
    },


    /**
     * @returns {undefined}
     */
    prev: function prev() {
        if (this.element === undefined) {
            return;
        }

        this.controls.prev.dispatchEvent(new Event('click'));
    },


    /**
     * @returns {undefined}
     */
    next: function next() {
        if (this.element === undefined) {
            return;
        }

        this.controls.next.dispatchEvent(new Event('click'));
    },


    /**
     * @returns {undefined}
     */
    skip: function skip() {
        if (this.direction === 'forward') {
            this.next();
        } else if (this.direction === 'backward') {
            this.prev();
        }
    },


    /**
     * @returns {Object|null}
     */
    getResource: function getResource() {
        return this.resourceElement !== undefined ? Resource.create(this.resourceElement) : null;
    },


    /**
     * @returns {String|undefined}
     */
    get state() {
        if (this.controls.play === undefined) {
            return undefined;
        }

        return this.controls.play.classList.contains('playing') ? 'playing' : 'paused';
    },

    /**
     * @returns {String|undefined}
     */
    get playbackDirection() {
        return this.direction;
    },

    /**
     * @private
     * @returns {undefined}
     */
    observe: function observe() {
        var _this7 = this;

        var observers = {};

        var lastState = void 0;

        observers.state = new MutationObserver(function () {
            var state = _this7.state;

            if (state !== lastState) {
                _this7.trigger('statechanged', _this7.state);

                lastState = state;
            }
        });

        observers.state.observe(this.controls.play, {
            attributes: true,
            attributeFilter: ['class']
        });

        observers.resource = new MutationObserver(function () {
            _this7.trigger('resourcechanged', Resource.create(_this7.resourceElement));
        });

        observers.resource.observe(this.resourceElement, {
            childList: true
        });

        this.app.addEventListener('keydown', function (event) {
            if (event.repeat === true || event.shiftKey === false) {
                return;
            }

            if (event.keyCode === 37) {
                _this7.direction = 'backward';
            } else if (event.keyCode === 39) {
                _this7.direction = 'forward';
            }
        }, true);

        this.controls.prev.addEventListener('click', function () {
            _this7.direction = 'backward';
        }, true);

        this.controls.next.addEventListener('click', function () {
            _this7.direction = 'forward';
        }, true);
    },


    /**
     * @private
     * @returns {Promise}
     */
    getElement: function getElement() {
        var _this8 = this;

        return new Promise(function (resolve) {
            var observer = new MutationObserver(_this8.throttle(function () {
                var element = _this8.app.querySelector('.playControls');

                if (element !== null) {
                    observer.disconnect();

                    resolve(element);
                }
            }), 500);

            observer.observe(_this8.app, {
                childList: true,
                subtree: true
            });
        });
    }
};

Object.assign(Player, Utils);

/**
 * @type {Object}
 */
var StreamCleaner = {

    /**
     * @returns {undefined}
     */
    init: function init() {
        this.app = document.querySelector('#app');

        this.createHero();
        this.createPlayer();
        this.createStream();

        this.setStyles();
    },


    /**
     * @private
     * @returns {undefined}
     */
    createHero: function createHero() {
        this.hero = Object.create(Hero);
        this.hero.init(this.app);
    },


    /**
     * @private
     * @returns {undefined}
     */
    createPlayer: function createPlayer() {
        var _this9 = this;

        this.player = Object.create(Player);
        this.player.init(this.app);

        this.player.on('resourcechanged', function (resource) {
            if (resource.deleted === true) {
                _this9.player.skip();
            }
        });
    },


    /**
     * @private
     * @returns {undefined}
     */
    createStream: function createStream() {
        this.stream = Object.create(Stream);
        this.stream.init(this.app);
    },


    /**
     * @private
     * @returns {undefined}
     */
    setStyles: function setStyles() {
        GM_addStyle(['.ssc-deleted.ssc-compact { margin-bottom: 0 }', '.ssc-deleted.ssc-compact .soundContext__targetLink, .ssc-deleted.ssc-compact .sound__body, .ssc-deleted.ssc-hide { visibility: hidden; height: 0px; margin-bottom: 0  }', '.ssc-deleted .coverArt__infoItem { display: none }', '.ssc-deleted .g-all-transitions-300 { transition: none }'].join(' '));
    }
};

(function () {
    var cleaner = Object.create(StreamCleaner);

    cleaner.init();
})();