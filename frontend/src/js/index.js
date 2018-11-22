import '../styles/main.pcss';
import '@babel/polyfill';
import debounce from './utils/debounce';
import validateDomainName from './utils/validateDomainName';
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
    searchBoxResultsError: 'search-box__result-error',
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
   * Called when the user enters something in input field
   * @type {function}
   */
  const inputHandler = () => {
    searchBoxResults.innerHTML = '';
    const value = searchBoxInput.value;

    const validationResult = validateDomainName(value);

    if (validationResult !== true) {
      searchBoxResults.innerHTML = `<div class="${CSS.searchBoxResultsError}">${validationResult}</div>`;
      searchBoxField.classList.remove(CSS.searchBoxFieldLoading);
      return;
    }
    searchBoxField.classList.add(CSS.searchBoxFieldLoading);

    /**
     * Used for handling new available TLD from client
     * @param availableTLD - new available TLD from client
     */
    const newAvailableDomainHandler = (availableTLD) => {
      const child = document.createElement('div');

      child.classList.add(CSS.searchBoxResultsItem);
      child.innerHTML = `<span class="${CSS.searchBoxResultsDomainName}">${value}</span>.${availableTLD}`;

      searchBoxResults.appendChild(child);
    };

    client.checkDomain(value, newAvailableDomainHandler).then(() => {
      searchBoxField.classList.remove(CSS.searchBoxFieldLoading);
    }).catch((e) => {
      searchBoxField.classList.remove(CSS.searchBoxFieldLoading);
      console.log(e);
    });
  };

  searchBoxInput.addEventListener('input', debounce(inputHandler, 200));
})();
