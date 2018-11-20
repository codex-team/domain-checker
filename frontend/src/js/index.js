import '../css/main.pcss';
import '@babel/polyfill';
import debounce from './utils/debounce';
import DomainCheckerClient from './domainCheckerClient';

(function () {
  /**
   * @const {HTMLElement} text input for domain name
   */
  const searchInput = document.getElementsByClassName('search-box__input')[0];

  /**
   * @const {HTMLElement} div, where results of search will show
   */
  const resultsDiv = document.getElementsByClassName('results')[0];

  /**
   * @const {HTMLElement} div, that contains search-input and have loader indicator
   */
  const searchBox = document.getElementsByClassName('search-box')[0];

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
    searchBox.classList.add('search-box--loading');
    const value = searchInput.value;

    /**
     * Used for handling new available TLD from client
     * @param availableTLD - new available TLD from client
     */
    const newAvailableDomainHandler = (availableTLD) => {
      const child = document.createElement('div');

      child.classList.add('results__result');
      child.innerHTML = `<span class="results__domain-name">${value}</span>.${availableTLD}`;

      resultsDiv.appendChild(child);
    };

    client.checkDomain(value, newAvailableDomainHandler).then(() => {
      // searchBox.classList.remove('search-box--loading');
    }).catch((e) => {
      // searchBox.classList.remove('search-box--loading');
      console.log(e);
    });
  };

  searchInput.addEventListener('input', debounce(inputHandler, 1000));
})();
