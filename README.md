# lpinyin (汉字转拼音typescript版)

lpinyin typescript 翻译dart lpinyin实现
>>

    lpinyin是一个汉字转拼音的Dart package. 主要参考Java开源类库[jpinyin](https://github.com/SilenceDut/jpinyin).  
    ①准确、完善的字库  
    ②拼音转换速度快  
    ③支持多种拼音输出格式：带音标、不带音标、数字表示音标以及拼音首字母输出格式  
    ④支持常见多音字的识别，其中包括词组、成语、地名等  
    ⑤简繁体中文转换  
    ⑥支持添加用户自定义字典
>>
### Add dependency

``` cli
  npm i Ipinyin_js
```

### Example

``` js

// Import package
import 'lpinyin/lpinyin';

String text = "天府广场";

//字符串拼音首字符
PinyinHelper.getShortPinyin(str); // tfgc

//字符串首字拼音
PinyinHelper.getFirstWordPinyin(str); // tian

//无法转换拼音会 throw PinyinException
PinyinHelper.getPinyin(text);
PinyinHelper.getPinyin(text, separator: " ", format: PinyinFormat.WITHOUT_TONE);//tian fu guang chang

//无法转换拼音 默认用' '替代
PinyinHelper.getPinyinE(text);
PinyinHelper.getPinyinE(text, separator: " ", defPinyin: '#', format: PinyinFormat.WITHOUT_TONE);//tian fu guang chang

//添加用户自定义字典
List<String> dict1 = ['耀=yào','老=lǎo'];
PinyinHelper.addPinyinDict(dict1);//拼音字典
List<String> dict2 = ['奇偶=jī,ǒu','成都=chéng,dū'];
PinyinHelper.addMultiPinyinDict(dict2);//多音字词组字典
List<String> dict3 = ['倆=俩','們=们'];
ChineseHelper.addChineseDict(dict3);//繁体字字典

```
