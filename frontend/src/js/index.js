import '@babel/polyfill';
import Util from './util';
import Client from './client';

(function () {
  const API_ENDPOINT = 'localhost:3000';
  const API_GET_WS_ID = `http://${API_ENDPOINT}/domain`;
  const API_WS_ENDPOINT = `ws://${API_ENDPOINT}/ws`;

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

  const client = new Client(API_GET_WS_ID, API_WS_ENDPOINT);

  /**
   * called when the user enters something in input field
   */
  const inputHandler = () => {
    resultsDiv.innerHTML = '';
    statusDiv.innerText = 'Поиск...';
    const value = searchInput.value;

    client.getDomainInfo(value, (freeTLD) => {
      let child = document.createElement('div');

      child.innerHTML = `${value}.${freeTLD}`;

      resultsDiv.appendChild(child);
    }).then(() => {
      statusDiv.innerText = 'Готово!';
    }).catch(() => {
      statusDiv.innerText = 'Ошибка!';
    });
  };

  searchInput.addEventListener('input', Util.debounce(inputHandler, 1000));
})();
