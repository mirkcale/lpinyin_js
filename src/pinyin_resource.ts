import { PINYIN_DICT, CHINESE_DICT, MULTI_PINYIN_DICT } from './dict_data';

/// Pinyin Resource.
export default class PinyinResource {
  static getPinyinResource () {
    return PinyinResource.getResource(PINYIN_DICT);
  }

  static getChineseResource () {
    return PinyinResource.getResource(CHINESE_DICT);
  }

  static getMultiPinyinResource () {
    return PinyinResource.getResource(MULTI_PINYIN_DICT);
  }

  static getResource (list: string[]) {
    const map = new Map<string, string>();
    for (let i = 0, length = list.length; i < length; i++) {
      const tokens = list[i].trim().split('=');
      map.set(tokens[0], tokens[1]);
    }
    return map;
  }
}
