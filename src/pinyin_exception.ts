export default class PinyinException implements Error {
  public name = 'PinyinException';
  public message: string;

  constructor (message: string) {
    this.message = message;
  }

  toString (): string {
    if (this.message == null) return 'PinyinException';
    return `Exception: ${this.message}`;
  }
}
