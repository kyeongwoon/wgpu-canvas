'use strict';

const forEach = Array.prototype.forEach;

// use for ClassList
class DOMTokenList {
  constructor() {
    this.tokens = {};
  }

  add(param = '') {
    const { tokens } = this;
    if (param === '') return this;

    let args = param.split(' ');
    forEach.call(args, token => {
      tokens[token] = true;
    });
    return this;
  }

  remove() {
    const { tokens } = this;
    forEach.call(arguments, token => {
      delete tokens[token];
    });

    return this;
  }

  contains(token) {
    return Boolean(this.tokens[token]);
  }

  toggle(token, force) {
    if (typeof force !== `undefined`) {
      if (force) {
        this.add(token);
        return true;
      } else {
        this.remove(token);
        return false;
      }
    }

    if (this.contains(token)) {
      this.remove(token);
      return false;
    }

    this.add(token);
    return true;
  }

  get value() {
    return Object.keys(this.tokens).join(` `);
  }

  replace(oldToken, newToken) {
    this.remove(oldToken);
    this.add(newToken);

    return this;
  }

  item(index) {
    return Object.keys(this.tokens)[index];
  }
};

export default DOMTokenList