import '@babel/polyfill';
import Util from './util';
import Client from './client';

(function () {
  const API_URI = 'localhost:3000';
  const API_ID = `http://${API_URI}/domain`;
  const API_WS = `ws://${API_URI}/ws`;
  const ID_RESULTS_DIV = 'results';
  const ID_SEARCH_INPUT = 'search-input';

  const searchInput = document.getElementById(ID_SEARCH_INPUT);
  const resultsDiv = document.getElementById(ID_RESULTS_DIV);

  const client = new Client(API_ID, API_WS);

  searchInput.addEventListener('input', Util.debounce(() => {
    const value = searchInput.value;

    client.getDomainInfo(value, (err, freeTLD) => {
      let child = document.createElement('div');

      child.innerHTML = `${value}.${freeTLD}`;

      resultsDiv.appendChild(child);
    }).then().catch();
  }, 1000));
})();
