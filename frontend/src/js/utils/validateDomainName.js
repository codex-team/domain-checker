/**
 * Checks the domain name for correctness
 * @param {string} domainName - domain name for validation
 * @returns {boolean|string} - true if domain name is valid, string that contains error if any
 */
export default function validateDomainName(domainName) {
  /**
   * @const {object} - settings for domain name validation
   * @property {number} minSymbols - minimal count of symbols, that domain name must have
   * @property {number} maxSymbols - maximal count of symbols, that domain name must have
   * @property {RegExp} domainNameRegExp - regular expression for validation domain name
   */
  const validateSetting = {
    minSymbols: 2,
    maxSymbols: 30,
    domainNameRegExp: /^[a-z0-9]*$/i
  };

  /**
   * @const {object} - errors, that function can return
   */
  const errors = {
    tooShort: 'Domain name is too short',
    tooLong: 'Domain name is too long',
    invalidCharacters: 'String contains invalid characters'
  };

  if (domainName.length < validateSetting.minSymbols) {
    return errors.tooShort;
  }

  if (domainName.length > validateSetting.maxSymbols) {
    return errors.tooLong;
  }

  if (!validateSetting.domainNameRegExp.test(domainName)) {
    return errors.invalidCharacters;
  }

  return true;
}
