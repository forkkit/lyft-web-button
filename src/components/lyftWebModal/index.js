// dependencies
var api = require('../../services/api.js');
var selector = require('../../services/selector.js');

// styles
require('./index.css');

/**
 * lyftWebModal
 */
var lyftWebModal = (function(api, selector) {

  /* ========== */
  /* Properties */
  /* ========== */

  var closeElement;
  var mapElement;
  var mapLabelDescriptionElement;
  var mapLabelNameElement;
  var messageFormElement;
  var messageFormInputElement;
  var openAppCtaElement;
  var rootElement;

  /* ======================== */
  /* DOM Manipulation Methods */
  /* ======================== */

  function createElements() {
    // create tree from template
    var template = document.createElement('div');
    template.innerHTML = require('html!./index.html');
    // store references to important elements
    rootElement                = template.childNodes[0];
    closeElement               = selector.selectChildElement(rootElement, ['.footer', '.close']);
    mapElement                 = selector.selectChildElement(rootElement, ['.content', '.map-container']);
    mapLabelNameElement        = selector.selectChildElement(mapElement, ['.map-label', '.map-label-name']);
    mapLabelDescriptionElement = selector.selectChildElement(mapElement, ['.map-label', '.map-label-description']);
    messageFormElement         = selector.selectChildElement(rootElement, ['.content', '.frame-container', '.frame-1 on', '.message-form-container', '.message-form']);
    messageFormInputElement    = selector.selectChildElement(messageFormElement, ['.message-form-input']);
    openAppCtaElement          = selector.selectChildElement(rootElement, ['.content', '.frame-container', '.frame-1 on', '.open-app-container', '.open-app-cta']);
    // return reference to root element
    return rootElement;
  }

  function bindEvents(location) {
    location = location || {};
    // root element: close modal window on click
    if (rootElement) {
      rootElement.onclick = function (event) {
        if (event && event.target === rootElement) {
          selector.removeClass(rootElement, 'on');
          return false;
        }
        return true;
      };
    }
    // close element: close modal window on click
    if (closeElement) {
      closeElement.onclick = function (event) {
        if (event && event.target === closeElement) {
          selector.removeClass(rootElement, 'on');
          return false;
        }
        return true;
      };
    }
    // message form element: request JSONP on submit
    if (messageFormElement && messageFormInputElement) {
      messageFormElement.onsubmit = function (event) {
        api.postMessages({
          phone_number: messageFormInputElement.value,
          // client_id: 'TODO',
          end_lat: location.latitude,
          end_lng: location.longitude
        }, 'lyftWebModal.onPostMessagesSuccess');
        return false;
      };
    }
    return rootElement;
  }

  function updateContents(location) {
    location = location || {};
    // map-container: set background-image
    if (mapElement) {
      var mapSrc = 'https://maps.googleapis.com/maps/api/staticmap' +
        '?center=' + location.latitude + ',' + location.longitude +
        '&maptype=roadmap&size=640x300&zoom=15';
      mapElement.style = 'background-image:url(\''+mapSrc+'\');';
    }
    // map-label-name: set text
    if (mapLabelNameElement) {
      mapLabelNameElement.textContent = location.name;
    }
    // map-label-description: set text
    if (mapLabelDescriptionElement) {
      mapLabelDescriptionElement.textContent = location.address;
    }
    // open-app-cta: set href
    if (openAppCtaElement) {
      openAppCtaElement.href = 'lyft://ridetype?id=lyft' +
        '&destination%5Blatitude%5D=' + location.latitude +
        '&destination%5Blongitude%5D=' + location.longitude;
    }
  }

  /* ================ */
  /* Workflow Methods */
  /* ================ */

  function onPostMessagesSuccess(data) {
    if (data.messages) {
      var frame1 = selector.selectChildElement(rootElement, ['.content', '.frame-container', '.frame-1 on']);
      var frame2 = selector.selectChildElement(rootElement, ['.content', '.frame-container', '.frame-2']);
      selector.removeClass(frame1, 'on');
      selector.addClass(frame2, 'on');
    }
  }

  function show() {
    document.body.insertBefore(rootElement, document.body.childNodes[0]);
    selector.addClass(rootElement, 'on');
  }

  function hide() {
    document.body.removeChild(rootElement);
  }

  /**
   * Initialize.
   * @param {Object} options
   * @param {string} options.clientToken
   * @param {Object} options.location
   * @param {string} options.location.address
   * @param {string} options.location.latitude
   * @param {string} options.location.longitude
   * @param {string} options.location.name
   */
  function initialize(options) {
    // parse arguments
    api.setClientToken(options.clientToken);
    // create element tree
    createElements();
    bindEvents(options.location);
    updateContents(options.location);
  }

  /* ===================================== */
  /* Publicly-Exposed Properties & Methods */
  /* ===================================== */

  return {
    hide: hide,
    initialize: initialize,
    onPostMessagesSuccess: onPostMessagesSuccess,
    show: show
  };

})(api, selector);

module.exports = window.lyftWebModal = lyftWebModal;