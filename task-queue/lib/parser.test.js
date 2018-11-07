const {
  JsonParser,
  ParserError
} = require('./parser');

describe('JsonParser', () => {
  const obj = {
    type: 'test',
    args: [ 'test' ],
    flag: true,
    num: 32197361
  };
  const corruptStr = '{"type": "test" ,}';
  let parser = JsonParser;

  it('should stringify an object', () => {
    expect(parser.prepare(obj)).toBe(JSON.stringify(obj));
  });

  it('should parse an object', () => {
    expect(parser.parse(JSON.stringify(obj))).toEqual(obj);
  });

  it('should throw ParserError on corrupt string', () => {
    expect(() => parser.parse(corruptStr)).toThrowError(ParserError);
  });
});