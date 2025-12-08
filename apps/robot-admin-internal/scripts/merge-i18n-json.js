#!/usr/bin/env node

/**
 * 智能合并国际化翻译 JSON 文件
 * 用于解决 git merge 时 lang/index.json 的冲突
 * 
 * 策略：
 * 1. 保留两边所有的翻译键（不会丢失任何翻译）
 * 2. 如果同一个 key 在两边都存在，优先使用当前分支的版本（ours）
 * 3. 自动按 key 排序，保持文件整洁
 * 4. 不会重新生成翻译，节省 API 配额
 */

const fs = require('fs');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 智能合并两个翻译 JSON 对象
 * @param {Object} ours - 当前分支的翻译
 * @param {Object} theirs - 被合并分支的翻译
 * @returns {Object} 合并后的翻译对象
 */
function mergeTranslations(ours, theirs) {
  const merged = { ...theirs }; // 先放入对方的所有键

  let oursCount = 0;
  let theirsCount = 0;
  let conflictCount = 0;

  // 遍历当前分支的键
  for (const [key, value] of Object.entries(ours)) {
    if (merged[key]) {
      // 如果键冲突，优先使用当前分支的版本
      conflictCount++;
      merged[key] = value;
    } else {
      // 新增的键
      oursCount++;
      merged[key] = value;
    }
  }

  theirsCount = Object.keys(theirs).length - conflictCount;

  log('blue', `\n📊 合并统计：`);
  log('green', `  ✅ 当前分支新增: ${oursCount} 条翻译`);
  log('green', `  ✅ 对方分支新增: ${theirsCount} 条翻译`);
  if (conflictCount > 0) {
    log('yellow', `  ⚠️  冲突键（已保留当前分支版本）: ${conflictCount} 条`);
  }
  log('blue', `  📝 合并后总计: ${Object.keys(merged).length} 条翻译\n`);

  // 按 key 排序
  const sortedKeys = Object.keys(merged).sort();
  const sorted = {};
  for (const key of sortedKeys) {
    sorted[key] = merged[key];
  }

  return sorted;
}

/**
 * 读取 JSON 文件
 */
function readJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    log('red', `❌ 读取文件失败: ${filePath}`);
    log('red', `   ${error.message}`);
    return null;
  }
}

/**
 * 写入 JSON 文件
 */
function writeJSON(filePath, data) {
  try {
    const content = JSON.stringify(data, null, '\t'); // 使用 tab 缩进，与原文件保持一致
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    log('red', `❌ 写入文件失败: ${filePath}`);
    log('red', `   ${error.message}`);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  // 参数：当前分支文件路径、对方分支文件路径、输出文件路径
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    log('yellow', '用法: node merge-i18n-json.js <ours> <theirs> <output>');
    log('yellow', '示例: node merge-i18n-json.js lang/index.json.ours lang/index.json.theirs lang/index.json');
    process.exit(1);
  }

  const [oursPath, theirsPath, outputPath] = args;

  log('blue', '\n🚀 开始智能合并国际化翻译文件...');
  log('blue', `   当前分支: ${oursPath}`);
  log('blue', `   对方分支: ${theirsPath}`);
  log('blue', `   输出文件: ${outputPath}`);

  // 读取两边的文件
  const ours = readJSON(oursPath);
  const theirs = readJSON(theirsPath);

  if (!ours || !theirs) {
    log('red', '❌ 读取文件失败，终止合并');
    process.exit(1);
  }

  // 合并
  const merged = mergeTranslations(ours, theirs);

  // 写入输出文件
  if (writeJSON(outputPath, merged)) {
    log('green', `✅ 合并成功！文件已保存: ${outputPath}`);
    log('green', `✅ 没有重复翻译，没有浪费 API 配额！`);
    process.exit(0);
  } else {
    log('red', '❌ 合并失败！');
    process.exit(1);
  }
}

main();
