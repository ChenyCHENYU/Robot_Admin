
    // 导入国际化JSON文件
    import langJSON from './index.json'
    (function () {
    // 定义翻译函数
    let $t = function (key, val, nameSpace) {
      // 获取指定命名空间下的语言包
      const langPackage = $t[nameSpace];
      // 返回翻译结果，如果不存在则返回默认值
      return (langPackage || {})[key] || val;
    };
    // 定义简单翻译函数，直接返回传入的值
    let $$t = function (val) {
      return val;
    };
    globalThis.$deepScan = function (val) {
      return val;
    };
    globalThis.$iS = function (val, args) {
        // 如果参数不是字符串或数组，直接返回原值
        if (typeof val !== 'string' || !Array.isArray(args)) {
            return val;
        }
        try {
            // 使用更安全的正则表达式替换方式
            return val.replace(/\$(?:\{|\｛)(\d+)(?:\}|\｝)/g, (match, index) => {
                // 将index转换为数字
                const position = parseInt(index, 10);
                // 如果args[position]存在则替换，否则保留原占位符
                return args[position] !== undefined ? String(args[position]) : match;
            });
        } catch (error) {
            console.warn('字符串替换过程出现异常:', error);
            return val;
        }
    }
    // 定义设置语言包的方法
    $t.locale = function (locale, nameSpace) {
      // 将指定命名空间下的语言包设置为传入的locale
      $t[nameSpace] = locale || {};
    };
    // 将翻译函数挂载到globalThis对象上，如果已经存在则使用已有的
    globalThis.$t = globalThis.$t || $t;
    // 将简单翻译函数挂载到globalThis对象上
    globalThis.$$t = $$t;
    // 定义从JSON文件中获取指定键的语言对象的方法
    globalThis._getJSONKey = function (key, insertJSONObj = undefined) {
        // 获取JSON对象
        const JSONObj = insertJSONObj;
        // 初始化语言对象
        const langObj = {};
        // 遍历JSON对象的所有键
        Object.keys(JSONObj).forEach((value) => {
            // 将每个语言的对应键值添加到语言对象中
            langObj[value] = JSONObj[value][key];
        });
        // 返回语言对象
        return langObj;
    };
    })();
    // 定义语言映射对象
    const langMap = {
        'en': (globalThis && globalThis.robot_admin && globalThis.robot_admin.en) ? globalThis.robot_admin.en : globalThis._getJSONKey('en', langJSON),
'ja': (globalThis && globalThis.robot_admin && globalThis.robot_admin.ja) ? globalThis.robot_admin.ja : globalThis._getJSONKey('ja', langJSON),
'ko': (globalThis && globalThis.robot_admin && globalThis.robot_admin.ko) ? globalThis.robot_admin.ko : globalThis._getJSONKey('ko', langJSON),
'zhcn': (globalThis && globalThis.robot_admin && globalThis.robot_admin.zhcn) ? globalThis.robot_admin.zhcn : globalThis._getJSONKey('zh-cn', langJSON)
    };
    globalThis.langMap = langMap;
    // 存储语言是否存在
    // 判断 globalThis.localStorage.getItem 是否为函数
    const isFunction = (fn) => {
        return typeof fn === 'function';
    };
    
    const withStorageLang = isFunction && globalThis && globalThis.localStorage && 
    isFunction(globalThis.localStorage.getItem) && globalThis.localStorage.getItem('robot_admin');
    const withStorageCommonLang = isFunction && globalThis && globalThis.localStorage && 
    isFunction(globalThis.localStorage.getItem) && globalThis.localStorage.getItem('');
    // 从本地存储中获取通用语言，如果不存在则使用空字符串
    const commonLang = withStorageCommonLang ? globalThis.localStorage.getItem('') : '';
    // 从本地存储中获取当前语言，如果不存在则使用源语言
    const baseLang = withStorageLang ? globalThis.localStorage.getItem('robot_admin') : 'zhcn';
    const lang = commonLang ? commonLang : baseLang;
    // 根据当前语言设置翻译函数的语言包
    globalThis.$t.locale(globalThis.langMap[lang], 'robot_admin');
    globalThis.$changeLang = (lang) => {
        globalThis.$t.locale(globalThis.langMap[lang], 'robot_admin');
    };
  