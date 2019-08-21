import PinyinResource from './pinyin_resource';
import { PinyinFormat } from './pinyin_format';
import ChineseHelper from './chinese_helper';
import PinyinException from './pinyin_exception';

/**
 * 汉字转拼音类
 */
export default class PinyinHelper {
  static pinyinMap: Map<string, string> = PinyinResource.getPinyinResource();
  static multiPinyinMap: Map<string, string> = PinyinResource.getMultiPinyinResource();

  static pinyinSeparator = ','; // 拼音分隔符
  // 所有带声调的拼音字母
  static allMarkedVowel = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ';
  static allUnmarkedVowel = 'aeiouv';
  static minMultiLength = 2;
  static maxMultiLength = 0;

  /**
   *获取字符串首字拼音
   *@param str 需要转换的字符串
   *  @return 首字拼音 (成都 cheng)
   */
  static getFirstWordPinyin (str: string) {
    const _pinyin: string = PinyinHelper.getPinyinE(str, PinyinHelper.pinyinSeparator);
    return _pinyin.split(PinyinHelper.pinyinSeparator)[0];
  }

  /**
   * 获取字符串对应拼音的首字母
   * @param str 需要转换的字符串
   * @param defPinyin 拼音分隔符 def: '#'
   * @return 对应拼音的首字母 (成都 cd)
   */
  static getShortPinyin (str: string, defPinyin: string = '#'): string {
    let result = '';
    const pinyin = PinyinHelper.getPinyinE(str, PinyinHelper.pinyinSeparator, defPinyin);
    const list: string[] = pinyin.split(PinyinHelper.pinyinSeparator);
    list.map((value) => {
      result += value[0];
    });
    return result;
  }

  /**
   * 将字符串转换成相应格式的拼音
   * @param str 需要转换的字符串
   * @param separator 拼音分隔符 def: ' '
   * @param format 拼音格式 def: PinyinFormat.WITHOUT_TONE
   * @return 字符串的拼音(成都 cheng du)
   */
  static getPinyin (
    str: string,
    separator: string = '',
    format: PinyinFormat = PinyinFormat.WITHOUT_TONE
  ) {
    let result = '';
    str = ChineseHelper.convertToSimplifiedChinese(str);
    const strLen = str.length;
    let i = 0;
    while (i < strLen) {
      const subStr = str.substring(i);
      const node: MultiPinyin = PinyinHelper.convertToMultiPinyin(subStr, separator, format);
      if (node == null) {
        const char = str[i];
        if (ChineseHelper.isChinese(char)) {
          const pinyinArray = PinyinHelper.convertToPinyinArray(char, format);
          if (pinyinArray.length > 0) {
            result += pinyinArray[0];
          } else {
            throw new PinyinException(`Can't convert to pinyin: ${char}`);
          }
        } else {
          result += char;
        }
        if (i < strLen) {
          result += separator;
        }
        i++;
      } else {
        result += node.pinyin;
        i += node.word.length;
      }
    }
    return ((result.endsWith(separator) && separator !== '')
      ? result.substring(0, result.length - 1)
      : result);
  }

  /**
   * 将字符串转换成相应格式的拼音 (不能转换的字拼音默认用' '替代 )
   * @param str 需要转换的字符串
   * @param separator 拼音分隔符 def: ' '
   * @param defPinyin 拼音分隔符 def: ' '
   * @param format 拼音格式 def: PinyinFormat.WITHOUT_TONE
   * @return 字符串的拼音(成都 cheng du)
   */
  static getPinyinE (
    str: string,
    separator: string = ' ',
    defPinyin: string = ' ',
    format: PinyinFormat = PinyinFormat.WITHOUT_TONE
  ): string {
    let sb = '';
    str = ChineseHelper.convertToSimplifiedChinese(str);
    const strLen = str.length;
    let i = 0;
    while (i < strLen) {
      const subStr = str.substring(i);
      const node: MultiPinyin = PinyinHelper.convertToMultiPinyin(subStr, separator, format);
      if (node == null) {
        const char = str[i];
        if (ChineseHelper.isChinese(char)) {
          const pinyinArray: string[] = PinyinHelper.convertToPinyinArray(char, format);
          if (pinyinArray.length > 0) {
            sb += pinyinArray[0];
          } else {
            sb += defPinyin;
            console.error(`
            ### Can't convert to pinyin
            ${char}
            defPinyin:
            ${defPinyin}
            `);
          }
        } else {
          sb += char;
        }
        if (i < strLen) {
          sb += separator;
        }
        i++;
      } else {
        sb += node.pinyin;
        i += node.word.length;
      }
    }
    return ((sb.endsWith(separator) && separator !== '')
      ? sb.substring(0, sb.length - 1)
      : sb);
  }

  /**
   * 获取多音字拼音
   * @param str 需要转换的字符串
   * @param separator 拼音分隔符
   * @param format 拼音格式
   * @return 多音字拼音
   */
  static convertToMultiPinyin (
    str: string, separator: string, format: PinyinFormat
  ): MultiPinyin {
    if (str.length < PinyinHelper.minMultiLength) return null;
    if (PinyinHelper.maxMultiLength === 0) {
      const keys = PinyinHelper.multiPinyinMap.keys;
      for (let i = 0, length = keys.length; i < length; i++) {
        if (keys[i].length > PinyinHelper.maxMultiLength) {
          PinyinHelper.maxMultiLength = keys[i].length;
        }
      }
    }
    for (
      let end = PinyinHelper.minMultiLength, length = str.length;
      (end <= length && end <= PinyinHelper.maxMultiLength);
      end++
    ) {
      const subStr = str.substring(0, end);
      const multi = PinyinHelper.multiPinyinMap.get(subStr);
      if (multi != null && multi.length > 0) {
        const str = multi.split(PinyinHelper.pinyinSeparator);
        let result = '';
        str.forEach((value) => {
          const pinyin = PinyinHelper.formatPinyin(value, format);
          result += pinyin[0];
          result += separator;
        });
        return new MultiPinyin(subStr, result);
      }
    }
    return null;
  }

  /**
   * 将单个汉字转换为相应格式的拼音
   * @param c 需要转换成拼音的汉字
   * @param format 拼音格式
   * @return 汉字的拼音
   */
  static convertToPinyinArray (c: string, format: PinyinFormat) {
    const pinyin = PinyinHelper.pinyinMap.get(c);
    if ((pinyin != null) && (pinyin !== 'null')) {
      return PinyinHelper.formatPinyin(pinyin, format);
    }
    return [];
  }

  /**
   * 将带声调的拼音格式化为相应格式的拼音
   * @param pinyinStr 带声调格式的拼音
   * @param format 拼音格式
   * @return 格式转换后的拼音
   */
  static formatPinyin (pinyinStr: string, format: PinyinFormat) {
    if (format === PinyinFormat.WITH_TONE_MARK) {
      return pinyinStr.split(PinyinHelper.pinyinSeparator);
    } else if (format === PinyinFormat.WITH_TONE_NUMBER) {
      return PinyinHelper.convertWithToneNumber(pinyinStr);
    } else if (format === PinyinFormat.WITHOUT_TONE) {
      return PinyinHelper.convertWithoutTone(pinyinStr);
    }
    return [];
  }

  /**
   * 将带声调格式的拼音转换为不带声调格式的拼音
   * @param pinyinArrayStr 带声调格式的拼音
   * @return 不带声调的拼音
   */
  static convertWithoutTone (pinyinArrayStr: string): string[] {
    for (let i = PinyinHelper.allMarkedVowel.length - 1; i >= 0; i--) {
      const originalChar = PinyinHelper.allMarkedVowel.charCodeAt(i);
      const index = (i - i % 4) / 4;
      const replaceChar = PinyinHelper.allUnmarkedVowel.charCodeAt(~~index);
      pinyinArrayStr = pinyinArrayStr.replace(
        new RegExp(String.fromCharCode(originalChar), 'g'), String.fromCharCode(replaceChar));
    }
    // 将拼音中的ü替换为v
    const pinyinArray = pinyinArrayStr.replace(/ü/g, 'v').split(PinyinHelper.pinyinSeparator);
    // 去掉声调后的拼音可能存在重复，做去重处理
    return [...new Set(pinyinArray)];
  }

  /**
   * 将带声调格式的拼音转换为数字代表声调格式的拼音
   * @param pinyinArrayStr 带声调格式的拼音
   * @return 数字代表声调格式的拼音
   */
  static convertWithToneNumber (pinyinArrayStr: string): string[] {
    const pinyinArray = pinyinArrayStr.split(PinyinHelper.pinyinSeparator);
    for (let i = pinyinArray.length - 1; i >= 0; i--) {
      let hasMarkedChar = false;
      const originalPinyin = pinyinArray[i].replace(/ü/g, 'v'); // 将拼音中的ü替换为v
      for (let j = originalPinyin.length - 1; j >= 0; j--) {
        const originalChar = originalPinyin.charCodeAt(j);
        // 搜索带声调的拼音字母，如果存在则替换为对应不带声调的英文字母
        if (originalChar < 'a'.charCodeAt(0) || originalChar > 'z'.charCodeAt(0)) {
          const indexInAllMarked = PinyinHelper.allMarkedVowel.indexOf(String.fromCharCode(originalChar));
          const toneNumber = indexInAllMarked % 4 + 1; // 声调数
          const index = (indexInAllMarked - indexInAllMarked % 4) / 4;
          const replaceChar = PinyinHelper.allUnmarkedVowel.charCodeAt(~~index);
          pinyinArray[i] = originalPinyin.replace(
            new RegExp(String.fromCharCode(originalChar), 'g'),
            String.fromCharCode(replaceChar)) +
            toneNumber;
          hasMarkedChar = true;
          break;
        }
      }
      if (!hasMarkedChar) {
        // 找不到带声调的拼音字母说明是轻声，用数字5表示
        pinyinArray[i] = originalPinyin + '5';
      }
    }

    return pinyinArray;
  }

  /**
   * 将单个汉字转换成带声调格式的拼音
   * @param c 需要转换成拼音的汉字
   * @return 字符串的拼音
   */
  static convertCharToPinyinArray (c: string): string[] {
    return PinyinHelper.convertToPinyinArray(c, PinyinFormat.WITH_TONE_MARK);
  }

  /**
   * 判断一个汉字是否为多音字
   * @param c汉字
   * @return 判断结果，是汉字返回true，否则返回false
   */
  static hasMultiPinyin (c: string) {
    const pinyinArray: string[] = this.convertCharToPinyinArray(c);
    if (pinyinArray != null && pinyinArray.length > 1) {
      return true;
    }
    return false;
  }

  /// 添加拼音字典
  static addPinyinDict (list: string[]) {
    const newPinyinDict = PinyinResource.getResource(list);
    for (const item of newPinyinDict) {
      PinyinHelper.pinyinMap.set(item[0], item[1]);
    }
  }

  /// 添加多音字字典
  static addMultiPinyinDict (list: string[]) {
    const newMultiPinyinDict = PinyinResource.getResource(list);
    for (const item of newMultiPinyinDict) {
      PinyinHelper.multiPinyinMap.set(item[0], item[1]);
    }
  }
}

/// 多音字
class MultiPinyin {
  public word:string;
  public pinyin:string;
  constructor (word: string, pinyin: string) {
    this.word = word;
    this.pinyin = pinyin;
  }
}
