import '@babel/polyfill';
import debounce from './utils/debounce';
import DomainCheckerClient from './domainCheckerClient';

(function () {
  /**
   * @const {HTMLElement} text input for domain name
   */
  const searchInput = document.getElementById('search-input');

  /**
   * @const {HTMLElement} div, where results of search will show
   */
  const resultsDiv = document.getElementById('results');

  /**
   * @const {HTMLElement} div, that indicate current state of search
   */
  const statusDiv = document.getElementById('status');

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
    statusDiv.innerText = 'Searching...';
    const value = searchInput.value;

    /**
     * Used for handling new available TLD from client
     * @param availableTLD - new available TLD from client
     */
    const newAvailableDomainHandler = (availableTLD) => {
      let child = document.createElement('div');

      child.innerHTML = `<span class="results-domain-name">${value}</span>.${availableTLD}`;

      resultsDiv.appendChild(child);
    };

    client.checkDomain(value, newAvailableDomainHandler).then(() => {
      statusDiv.innerText = '';
    }).catch(() => {
      statusDiv.innerText = 'Error!';
    });
  };

  searchInput.addEventListener('input', debounce(inputHandler, 1000));
})();
