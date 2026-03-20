#!/bin/bash

# 配置自定义 Git 合并驱动
# 用于智能合并 lang/index.json 文件

echo "🔧 配置 Git 自定义合并驱动..."

# 配置 i18n-json 合并驱动
git config --local merge.i18n-json.name "国际化翻译 JSON 智能合并"
git config --local merge.i18n-json.driver "node scripts/merge-i18n-json.js %O %A %B && cp %A %P"

# 配置 ours 合并驱动（保留当前分支）
git config --local merge.ours.name "保留当前分支版本"
git config --local merge.ours.driver "true"

echo "✅ Git 合并驱动配置完成！"
echo ""
echo "📋 已配置的合并策略："
echo "  • lang/index.json     - 智能合并 JSON（保留所有翻译，冲突时优先使用当前分支）"
echo "  • src/types/*.d.ts    - 保留当前分支版本（这些文件会自动重新生成）"
echo ""
echo "💡 说明："
echo "  合并时不会重新生成翻译，不会浪费 API 配额"
echo "  冲突的翻译 key 会优先使用当前分支的版本"
