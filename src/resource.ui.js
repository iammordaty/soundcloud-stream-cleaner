/*global Resource, Storage*/

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
    delete (resource) {
        if (this.deleted(resource) === true) {
            return;
        }

        if (Storage.Settings.get('delete_mode') === 'hide') {
            resource.element.classList.add('ssc-deleted', 'ssc-hide');

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

        resource.element.classList.add('ssc-deleted', 'ssc-compact');
    },

    /**
     * @param {Object} resource
     * @returns {undefined}
     */
    undelete (resource) {
        if (this.deleted(resource) === false) {
            return;
        }

        resource.element.classList.remove('ssc-deleted', 'ssc-compact', 'ssc-hide');
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

        button.innerHTML = 'Undelete';
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
};
