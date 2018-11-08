/**
 * Class with helper functions
 */
class Util {
    /**
     * Debounce the supplied function
     * @param {Function} func - the function to debounce
     * @param {number} delay - the number of milliseconds to delay
     * @returns {Function} - a function, that, as long as it continues to be invoked, will not be triggered.
     * The function will be called after it stops being called for N milliseconds.
     */
    debounce(func, delay) {
        let inDebounce;

        return function () {
            const context = this;
            const args = arguments;

            clearTimeout(inDebounce);
            inDebounce = setTimeout(() => func.apply(context, args), delay);
        };
    };
}

export default new Util;