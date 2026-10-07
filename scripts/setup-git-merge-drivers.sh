#!/bin/bash

# 配置自定义 Git 合并驱动
# 用于三方合并 lang/*.json 文件

echo "🔧 配置 Git 自定义合并驱动..."

# 配置 i18n-json 合并驱动
git config --local merge.i18n-json.name "国际化翻译 JSON 智能合并"
git config --local merge.i18n-json.driver 'bun scripts/merge-i18n-json.cjs "%A" "%B" "%A" "%O"'

# 配置 ours 合并驱动（保留当前分支）
git config --local merge.ours.name "保留当前分支版本"
git config --local merge.ours.driver "true"

echo "✅ Git 合并驱动配置完成！"
echo ""
echo "📋 已配置的合并策略："
echo "  • lang/*.json         - 三方合并 JSON（单方新增、修改、删除正常合入）"
echo "  • src/types/*.d.ts    - 保留当前分支版本（这些文件会自动重新生成）"
echo ""
echo "💡 说明："
echo "  合并时不会重新生成翻译，不会浪费 API 配额"
echo "  同一词条的真实冲突会停止合并，等待人工处理，不静默丢弃改动"
