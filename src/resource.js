/*exported Resource*/
/*global Storage, Utils*/

/**
 * Represents track and the playlist
 *
 * @type {Object}
 */
const Resource = {

    /**
     * @param {HTMLElement} element
     * @returns {Object}
     */
    init (element) {
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
    },

    /**
     * @param {HTMLElement} element
     * @returns {Object}
     */
    create (element) {
        const resource = Object.create(Resource);

        resource.init(element);

        return resource;
    },

    /**
     * @type {String}
     */
    get type () {
        let type = this.element.querySelector('.trackList, .compactTrackList') ? 'playlist' : 'track';

        Object.defineProperty(this, 'type', { value: type, writable: false, enumerable: true });

        return type;
    },

    /**
     * @type {String}
     */
    get subtype () {
        let subtype;

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
    get url () {
        let url;

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
    get deleted () {
        return Storage.DeletedResources.has(this);
    },

    set deleted (value) {
        if (Boolean(value) === true) {
            Storage.DeletedResources.set(this);
        } else {
            Storage.DeletedResources.remove(this);
        }
    },
};

Object.assign(Resource, Utils);
