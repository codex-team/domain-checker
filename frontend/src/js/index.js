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
   * @type {string} contains the domain name currently being searched
   */
  let currentSearchingDomain = '';

  /**
   * Client for domain-checker API. Required for getting available zones
   * @type {DomainCheckerClient}
   */
  const client = new DomainCheckerClient({
    onSearchStart() {
      searchBoxField.classList.add(CSS.searchBoxFieldLoading);
    },
    onSearchMessage(tld) {
      const child = document.createElement('div');

      child.classList.add(CSS.searchBoxResultsItem);
      child.innerHTML = `<span class="${CSS.searchBoxResultsDomainName}">${currentSearchingDomain}</span>.${tld}`;

      searchBoxResults.appendChild(child);
    },
    onSearchEnd() {
      searchBoxField.classList.remove(CSS.searchBoxFieldLoading);
    },
    onSearchError(error) {
      console.log(error);
      searchBoxField.classList.remove(CSS.searchBoxFieldLoading);
    }
  });

  /**
   * Called when the user enters something in input field
   */
  function inputHandler() {
    searchBoxResults.innerHTML = '';
    currentSearchingDomain = searchBoxInput.value;
    client.checkDomain(searchBoxInput.value);
  }

  searchBoxInput.addEventListener('input', debounce(inputHandler, 200));
})();
