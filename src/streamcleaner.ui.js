/*global StreamCleaner*/

/**
 * UI layer
 *
 * @type {Object}
 */
StreamCleaner.Ui = {

    /**
     * @returns {undefined}
     */
    init () {
        this.addStyles();
    },

    /**
     * @param {Object} resource
     * @returns {undefined}
     */
    delete (resource) {
        if (this.deleted(resource) === true) {
            return;
        }

        resource.element.classList.add('ssc-deleted');

        if (resource.subtype !== 'stream') {
            return;
        }

        if (Storage.Settings.get('delete_mode') === 'hide') {
            resource.element.classList.add('ssc-hide');

            return;
        }

        const target = resource.element.querySelector('.soundContext__targetLink');
        const username = resource.element.querySelector('.soundTitle__username');
        const title = resource.element.querySelector('.soundTitle__title');
        const dash = document.createElement('span');

        dash.innerHTML = '&mdash;';

        target.parentNode.insertBefore(username, target);
        target.parentNode.insertBefore(dash, target);
        target.parentNode.insertBefore(title, target);

        resource.element.classList.add('ssc-compact');
    },

    /**
     * @param {Object} resource
     * @returns {undefined}
     */
    undelete (resource) {
        if (this.deleted(resource) === true) {
            resource.element.classList.remove('ssc-deleted', 'ssc-compact', 'ssc-hide');
        }
    },

    /**
     * @param {Object} resource
     * @returns {Boolean}
     */
    deleted (resource) {
        return resource.element.classList.contains('ssc-deleted');
    },

    /**
     * @param {Object} resource
     * @returns {HTMLElement}
     */
    createDeleteButton (resource) {
        const button = this.createButton(resource);

        button.innerHTML = 'Delete';
        button.setAttribute('title', 'Delete this ' + resource.type + ' from stream');

        return button;
    },

    /**
     * @param {Object} resource
     * @returns {HTMLElement}
     */
    createUndeleteButton (resource) {
        const button = this.createButton(resource);

        button.innerHTML = 'Deleted';
        button.classList.add('sc-button-selected');
        button.setAttribute('title', 'Undelete this ' + resource.type + ' from stream');

        return button;
    },

    /**
     * @param {HTMLElement} button
     * @param {Object} resource
     * @returns {undefined}
     */
    appendButton (button, resource) {
        const previousButton = resource.element.querySelector('.ssc-button');

        if (previousButton !== null) {
            previousButton.parentNode.removeChild(previousButton);
        }

        const refNode = resource.element.querySelector('.sc-button-share');

        refNode.parentNode.insertBefore(button, refNode);
    },

    /**
     * @private
     * @param {Object} resource
     * @returns {HTMLElement}
     */
    createButton (resource) {
        const button = document.createElement('button');
        const classList = this.getButtonClassList(resource);

        button.classList.add.apply(button.classList, classList);
        button.setAttribute('role', 'button');

        return button;
    },

    /**
     * @private
     * @param {Object} resource
     * @returns {Array}
     */
    getButtonClassList (resource) {
        let classList = [ 'ssc-button', 'sc-button-delete', 'sc-button', 'sc-button-responsive' ];

        if (resource.subtype === 'hero') {
            classList.push('sc-button-medium');
        } else if (resource.subtype === 'stream') {
            classList.push('sc-button-small');
        } else if (resource.subtype === 'playlist') {
            classList.push('sc-button-icon', 'sc-button-small');
        }

        return classList;
    },

    /**
     * @private
     * @returns {undefined}
     */
    addStyles () {
        GM_addStyle([
            '.ssc-deleted.ssc-compact { margin-bottom: 0 }',
            '.ssc-deleted.ssc-compact .sound__body, .ssc-deleted.ssc-hide { visibility: hidden; height: 0px; margin-bottom: 0  }',
            '.ssc-deleted.ssc-hide .coverArt__infoItem, .ssc-deleted.ssc-hide .addToNextUp { display: none }',
            '.ssc-deleted.ssc-hide .g-all-transitions-300 { transition: none }',
            '.ssc-deleted .ssc-button.sc-button-delete.sc-button-icon.sc-button-selected:before { background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+IDx0aXRsZT5JbXBvcnRlZCBMYXllcnM8L3RpdGxlPiA8Zz4gIDx0aXRsZT5iYWNrZ3JvdW5kPC90aXRsZT4gIDxyZWN0IGZpbGw9Im5vbmUiIGlkPSJjYW52YXNfYmFja2dyb3VuZCIgaGVpZ2h0PSIxOCIgd2lkdGg9IjE4IiB5PSItMSIgeD0iLTEiLz4gPC9nPiA8Zz4gIDx0aXRsZT5MYXllciAxPC90aXRsZT4gIDxwYXRoIGlkPSJzdmdfMSIgZmlsbC1ydWxlPSJldmVub2RkIiBmaWxsPSIjZjUwIiBkPSJtOS45NjgsM2wxLjAxNCwwYzIuMDE4LDAgMi4wMTgsMiAyLjAxOCwybC0xMCwwczAuMDksLTIgMi4wODgsLTJsMC45NDMsMGMwLjUyLC0wLjYxNSAxLjMyNCwtMS4wMDEgMS45NjksLTEuMDAxYzAuNjQzLDAgMS40NDcsMC4zODYgMS45NjgsMS4wMDF6bS01Ljk2OCwzbDAsNi4wMDJjMCwxLjEwMyAwLjg4NywxLjk5OCAxLjk5OCwxLjk5OGw0LjAwNCwwYTEuOTkzLDEuOTkzIDAgMCAwIDEuOTk4LC0xLjk5OGwwLC02LjAwMmwtOCwweiIvPiA8L2c+PC9zdmc+);}'
        ].join(' '));
    },
};
