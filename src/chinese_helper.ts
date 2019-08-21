import PinyinResource from './pinyin_resource';
import { mapContainsValue, mapValue2key } from './utils';

/// Chinese Helper.
export default class ChineseHelper {
  static chineseRegexp: RegExp = /[\u4e00-\u9fa5]/;
  static chineseMap = PinyinResource.getChineseResource();

  /**
   *判断某个字符是否为汉字
   * @return 是汉字返回true，否则返回false
   */
  static isChinese (c: string) {
    return c === '〇' || ChineseHelper.chineseRegexp.test(c);
  }

  /**
   * 判断某个字符是否为繁体字
   *
   * @param c 需要判断的字符
   *
   * @return 是繁体字返回true，否则返回false
   */
  static isTraditionalChinese (c: string): boolean {
    return ChineseHelper.chineseMap.has(c);
  }

  /**
   * 判断字符串中是否包含中文
   *
   * @param str 字符串
   *
   * @return 包含汉字返回true，否则返回false
   */
  static containsChinese (str: string) {
    for (let i = 0, len = str.length; i < len; i++) {
      if (ChineseHelper.isChinese(str[i])) {
        return true;
      }
    }
    return false;
  }

  /**
   * 将单个繁体字转换为简体字
   *
   * @param c 需要转换的繁体字
   *
   * @return 转换后的简体字
   */
  static convertCharToSimplifiedChinese (c: string) {
    const simplifiedChinese = ChineseHelper.chineseMap.get(c);
    if (simplifiedChinese != null) {
      return simplifiedChinese;
    }
    return c;
  }

  /**
   * 将单个简体字转换为繁体字
   *
   * @param c 需要转换的简体字
   *
   * @return 转换后的繁字体
   */
  static convertCharToTraditionalChinese (c: string): string {
    if (mapContainsValue(ChineseHelper.chineseMap, c)) { // map中有该简体字对应的繁体字 {繁体字: 简体字,繁体字1: 简体字1}
      // 实现一个 根据value 获取key的函数
      return mapValue2key(ChineseHelper.chineseMap, c);
    }
    return c;
  }

  /**
   * 将繁体字转换为简体字
   *
   * @param str 需要转换的繁体字
   *
   * @return 转换后的简体字
   */
  static convertToSimplifiedChinese (str: string) {
    let result = '';
    for (let i = 0, len = str.length; i < len; i++) {
      result += ChineseHelper.convertCharToSimplifiedChinese(str[i]);
    }
    return result;
  }

  /**
   * 将简体字转换为繁体字
   *
   * @param str
   *            需要转换的简体字
   * @return 转换后的繁字体
   */
  static convertToTraditionalChinese (str: string) {
    let result = '';
    for (let i = 0, len = str.length; i < len; i++) {
      result += ChineseHelper.convertCharToTraditionalChinese(str[i]);
    }
    return result;
  }

  /// 添加繁体字字典
  static addChineseDict (list: string[]): void {
    const newDict = PinyinResource.getResource(list);
    for (const item of newDict) {
      ChineseHelper.chineseMap.set(item[0], item[1]);
    }
  }
}
