class CountryCache {
  constructor(maxSize = 500) {
    this._maxSize = maxSize;
    this._map = new Map();
  }

  get(username) {
    return this._map.get(username);
  }

  set(username, country) {
    if (this._map.size >= this._maxSize && !this._map.has(username)) {
      const oldest = this._map.keys().next().value;
      this._map.delete(oldest);
    }
    this._map.set(username, country);
  }

  has(username) {
    return this._map.has(username);
  }

  size() {
    return this._map.size;
  }

  clear() {
    this._map.clear();
  }
}

module.exports = { CountryCache };
