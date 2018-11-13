import '@babel/polyfill';
import Util from './util';
import Client from './client';

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

  const client = new Client();

  /**
   * called when the user enters something in input field
   */
  const inputHandler = () => {
    resultsDiv.innerHTML = '';
    statusDiv.innerText = 'Поиск...';
    const value = searchInput.value;

    client.checkDomain(value, (freeTLD) => {
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
