export function mapContainsValue<K, V> (map: Map<K, V>, value: V) {
  for (const item of map) {
    if (item[1] === value) {
      return true;
    }
  }
  return false;
}

export function mapValue2key<K, V> (map: Map<K, V>, value: V): K {
  for (const item of map) {
    if (item[1] === value) {
      return item[0];
    }
  }
  return null;
}

export function mapAddAll () {

}
