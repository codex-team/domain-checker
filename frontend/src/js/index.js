(function () {
    const API_URI = 'http://localhost:3000';
    const DOMAIN_ENDPOINT = API_URI + '/domain/';
    const ID_RESULTS_DIV = 'results';
    const ID_SEARCH_INPUT = 'search-input';

    let shouldSearch = false;

    const searchDomain = async (domain) => {
        const response = await fetch(DOMAIN_ENDPOINT + domain);

        return response.json();
    };

    const processQuery = async (domain) => {
        const resp = await searchDomain(domain);

        const resultElement = document.getElementById(ID_RESULTS_DIV);
        const searchElement = document.getElementById(ID_SEARCH_INPUT);

        for (let [tld, data] of Object.entries(resp)) {
            if (data.available === true) {
                let child = document.createElement('div');

                child.innerHTML = `${searchElement.value}.${tld}`;

                resultElement.appendChild(child);
            }
        }
        return true;
    };

    const debounce = (func, delay) => {
        let inDebounce;

        return function () {
            const context = this;
            const args = arguments;

            clearTimeout(inDebounce);
            inDebounce = setTimeout(() => func.apply(context, args), delay);
        };
    };

    const handler = async () => {
        const searchBarElement = document.getElementById(ID_SEARCH_INPUT);

        if (shouldSearch && searchBarElement.value !== '') {
            shouldSearch = false;
            try {
                await processQuery(searchBarElement.value);
            } catch (e) {
                console.error(`Failed to get data\n${e}`);
            }
        }
    };

    document.getElementById(ID_SEARCH_INPUT).oninput = () => {
        shouldSearch = true;
        debounce(handler, 1000)();
    };
})();
