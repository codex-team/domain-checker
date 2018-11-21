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
    searchInput: 'search-box__input',
    searchBoxLoading: 'search-box--loading',
    resultsWrapper: 'results',
    result: 'results__result',
    resultsDomainName: 'results__domain-name'
  };

  /**
   * @const {HTMLElement} text input for domain name
   */
  const searchInput = document.querySelector(`.${CSS.searchInput}`);

  /**
   * @const {HTMLElement} div, where results of search will show
   */
  const resultsDiv = document.querySelector(`.${CSS.resultsWrapper}`);

  /**
   * @const {HTMLElement} div, that contains search-input and have loader indicator
   */
  const searchBox = document.querySelector(`.${CSS.searchBox}`);

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
    resultsDiv.innerHTML = '';
    searchBox.classList.add(CSS.searchBoxLoading);
    const value = searchInput.value;

    /**
     * Used for handling new available TLD from client
     * @param availableTLD - new available TLD from client
     */
    const newAvailableDomainHandler = (availableTLD) => {
      const child = document.createElement('div');

      child.classList.add(CSS.result);
      child.innerHTML = `<span class="${CSS.resultsDomainName}">${value}</span>.${availableTLD}`;

      resultsDiv.appendChild(child);
    };

    client.checkDomain(value, newAvailableDomainHandler).then(() => {
      searchBox.classList.remove(CSS.searchBoxLoading);
    }).catch((e) => {
      searchBox.classList.remove(CSS.searchBoxLoading);
      console.log(e);
    });
  };

  searchInput.addEventListener('input', debounce(inputHandler, 200));
})();
