import '../styles/main.pcss';
import '@babel/polyfill';
import debounce from './utils/debounce';
import DomainCheckerClient from './domainCheckerClient';

(function () {
  /**
   * @const {object} CSS classes for necessary elements and their states
   */
  const CSS = {
    searchBox: 'search-box',
    searchBoxField: 'search-box__field',
    searchBoxInput: 'search-box__input',
    searchBoxFieldLoading: 'search-box__field--loading',
    searchBoxResults: 'search-box__results',
    searchBoxResultsItem: 'search-box__result-item',
    searchBoxResultsDomainName: 'search-box__results-domain-name'
  };

  /**
   * @const {HTMLElement} div, that contains input and loader indicator
   */
  const searchBoxField = document.querySelector(`.${CSS.searchBoxField}`);

  /**
   * @const {HTMLElement} text input for domain name
   */
  const searchBoxInput = document.querySelector(`.${CSS.searchBoxInput}`);

  /**
   * @const {HTMLElement} div, where results of search will show
   */
  const searchBoxResults = document.querySelector(`.${CSS.searchBoxResults}`);

  /**
   * Client for domain-checker API. Required for getting available zones
   * @type {DomainCheckerClient}
   */
  const client = new DomainCheckerClient();

  /**
   * Used for handling new available TLD from client
   * @param {NewAvailableTldEvent} event - new available TLD from client
   */
  const newAvailableDomainHandler = (event) => {
    const child = document.createElement('div');

    child.classList.add(CSS.searchBoxResultsItem);
    child.innerHTML = `<span class="${CSS.searchBoxResultsDomainName}">${event.detail.domainName}</span>.${event.detail.tld}`;

    searchBoxResults.appendChild(child);
  };

  client.addEventListener('message', newAvailableDomainHandler);

  client.addEventListener('startSearch', () => {
    searchBoxField.classList.add(CSS.searchBoxFieldLoading);
  });

  client.addEventListener('endSearch', () => {
    searchBoxField.classList.remove(CSS.searchBoxFieldLoading);
  });

  client.addEventListener('breakSearch', () => {
    searchBoxField.classList.remove(CSS.searchBoxFieldLoading);
  });

  client.addEventListener('error', () => {
    searchBoxField.classList.remove(CSS.searchBoxFieldLoading);
  });

  /**
   * Called when the user enters something in input field
   * @const {function}
   */
  const inputHandler = () => {
    searchBoxResults.innerHTML = '';
    client.checkDomain(searchBoxInput.value);
  };

  searchBoxInput.addEventListener('input', debounce(inputHandler, 200));
})();
