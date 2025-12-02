#!/bin/bash

# merge-and-deploy.sh - 功能分支发布自动化脚本
# 使用方法: ./merge-and-deploy.sh [可选:分支名]
# 流程: 当前feature分支 -> dev分支 -> main分支 -> 推送到所有远程仓库

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_step() {
    echo -e "${BLUE}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_highlight() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

# 检查是否在git仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "当前目录不是Git仓库！"
    exit 1
fi

# 检查分支是否存在
check_branch_exists() {
    local branch_name=$1
    if git show-ref --verify --quiet refs/heads/$branch_name; then
        return 0
    else
        return 1
    fi
}

# 检查远程仓库配置
check_remote() {
    local remote_name=$1
    if git remote get-url $remote_name > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# 检查远程仓库连接
check_remote_connection() {
    local remote_name=$1
    if git ls-remote --exit-code $remote_name > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# 安全推送函数
safe_push() {
    local remote_name=$1
    local branch_name=$2
    local remote_display_name=${3:-$remote_name}
    
    print_step "推送 $branch_name 分支到 $remote_display_name..."
    if git push $remote_name $branch_name; then
        print_success "已推送 $branch_name 分支到 $remote_display_name"
        return 0
    else
        print_error "推送 $branch_name 分支到 $remote_display_name 失败"
        print_warning "可能的原因："
        echo "  - 网络连接问题"
        echo "  - 权限不足"
        echo "  - 远程仓库不存在或无写入权限"
        echo "  - 分支被保护"
        return 1
    fi
}

# 自动提交自动生成文件
auto_commit_generated_files() {
    local branch_name=$1
    
    # 定义自动生成的文件列表（只处理这些文件，不影响其他文件）
    local generated_files=(
        "lang/index.json"                # 国际化翻译文件（由 vite-auto-i18n-plugin 自动生成）
        "src/types/components.d.ts"      # 组件类型声明（由 unplugin-vue-components 自动生成）
        "src/types/auto-imports.d.ts"    # 自动导入类型声明（由 unplugin-auto-import 自动生成）
    )
    
    # 检查是否有这些文件需要提交
    local has_changes=false
    for file in "${generated_files[@]}"; do
        if [ -f "$file" ] && git diff --quiet "$file" 2>/dev/null; then
            continue
        elif [ -f "$file" ]; then
            has_changes=true
            break
        fi
    done
    
    # 如果有未提交的自动生成文件，自动提交
    if [ "$has_changes" = true ]; then
        print_step "检测到自动生成文件有更新，自动提交到 $branch_name 分支..."
        
        # 添加存在的自动生成文件
        for file in "${generated_files[@]}"; do
            if [ -f "$file" ]; then
                git add "$file" 2>/dev/null || true
            fi
        done
        
        # 提交
        if git diff --cached --quiet; then
            print_info "自动生成文件无需提交"
        else
            git commit -m "chore: 更新自动生成文件（国际化翻译和类型声明）" --no-verify
            print_success "自动生成文件已提交到 $branch_name 分支"
        fi
    fi
}

# 重新生成类型声明文件（不重新生成翻译文件，避免浪费API配额）
regenerate_type_files() {
    local branch_name=$1
    
    print_step "检查类型声明文件..."
    
    # 只检查类型声明文件，不处理 lang/index.json（翻译文件已通过union策略合并）
    local type_files=(
        "src/types/components.d.ts"
        "src/types/auto-imports.d.ts"
    )
    
    local has_changes=false
    for file in "${type_files[@]}"; do
        if [ -f "$file" ] && ! git diff --quiet "$file" 2>/dev/null; then
            has_changes=true
            break
        fi
    done
    
    # 如果有变更，提交类型声明文件
    # 注意：这些文件会在下次 npm run dev 时自动重新生成，所以这里只是提交当前版本
    if [ "$has_changes" = true ]; then
        print_info "提交合并后的类型声明文件..."
        git add src/types/components.d.ts src/types/auto-imports.d.ts 2>/dev/null || true
        
        if ! git diff --cached --quiet; then
            git commit -m "chore(merge): 更新类型声明文件 - $branch_name" --no-verify
            print_success "类型声明文件已提交"
        fi
    else
        print_info "类型声明文件无需更新"
    fi
    
    # 检查翻译文件是否被正确合并
    if [ -f "lang/index.json" ]; then
        if ! git diff --quiet lang/index.json 2>/dev/null; then
            print_step "提交合并后的翻译文件..."
            git add lang/index.json
            
            if ! git diff --cached --quiet lang/index.json; then
                git commit -m "chore(merge): 合并国际化翻译文件 - $branch_name" --no-verify
                print_success "翻译文件已合并并提交（保留了所有已翻译内容，未重新生成）"
            fi
        else
            print_info "翻译文件无冲突，无需处理"
        fi
    fi
}

# 安全合并函数
safe_merge() {
    local source_branch=$1
    local target_branch=$2
    
    print_step "合并 $source_branch 到 $target_branch..."
    if git merge $source_branch --no-edit; then
        print_success "合并 $source_branch 到 $target_branch 成功"
        return 0
    else
        print_error "合并 $source_branch 到 $target_branch 失败，存在冲突"
        print_warning "请按以下步骤解决："
        echo "  1. 使用 'git status' 查看冲突文件"
        echo "  2. 手动编辑冲突文件"
        echo "  3. 使用 'git add <文件>' 标记已解决"
        echo "  4. 使用 'git commit' 完成合并"
        echo "  5. 重新运行此脚本"
        return 1
    fi
}

# 推送到所有远程仓库
push_to_all_remotes() {
    local branch_name=$1
    local success_count=0
    local total_count=0
    
    # 推送到GitHub (origin)
    if check_remote "origin"; then
        total_count=$((total_count + 1))
        if check_remote_connection "origin"; then
            if safe_push "origin" "$branch_name" "GitHub"; then
                success_count=$((success_count + 1))
            fi
        else
            print_warning "无法连接到GitHub，跳过推送"
        fi
    else
        print_warning "未找到origin远程仓库配置"
    fi
    
    # 推送到Gitee
    local gitee_remote=""
    for remote in "gitee" "gitee-origin" "gitee-upstream"; do
        if check_remote $remote; then
            gitee_remote=$remote
            break
        fi
    done
    
    if [ -n "$gitee_remote" ]; then
        total_count=$((total_count + 1))
        if check_remote_connection $gitee_remote; then
            if safe_push $gitee_remote "$branch_name" "Gitee ($gitee_remote)"; then
                success_count=$((success_count + 1))
            fi
        else
            print_warning "无法连接到Gitee，跳过推送"
        fi
    else
        print_warning "未找到Gitee远程仓库配置"
    fi
    
    # 返回推送结果
    if [ $success_count -eq $total_count ] && [ $total_count -gt 0 ]; then
        return 0  # 全部成功
    elif [ $success_count -gt 0 ]; then
        return 1  # 部分成功
    else
        return 2  # 全部失败
    fi
}

# 获取版本信息
get_version() {
    if [ -f "package.json" ]; then
        grep '"version"' package.json | head -1 | cut -d'"' -f4
    else
        echo "未知"
    fi
}

echo -e "${PURPLE}🚀 功能分支发布自动化脚本启动...${NC}"
echo "================================================"

# 1. 获取当前分支和参数
FEATURE_BRANCH=""
if [ $# -eq 1 ]; then
    FEATURE_BRANCH=$1
    print_info "使用指定的功能分支: $FEATURE_BRANCH"
else
    FEATURE_BRANCH=$(git branch --show-current)
    print_info "使用当前分支: $FEATURE_BRANCH"
fi

# 2. 验证功能分支不是dev或main
if [ "$FEATURE_BRANCH" = "dev" ] || [ "$FEATURE_BRANCH" = "main" ]; then
    print_error "不能在 dev 或 main 分支上运行此脚本！"
    print_info "请切换到功能分支后重新运行"
    exit 1
fi

print_highlight "发布流程: $FEATURE_BRANCH → dev → main → 远程仓库"

# 3. 检查必要分支是否存在
print_step "检查分支存在性..."
for branch in "dev" "main"; do
    if ! check_branch_exists "$branch"; then
        print_error "$branch 分支不存在！请先创建 $branch 分支"
        exit 1
    fi
done

if ! check_branch_exists "$FEATURE_BRANCH"; then
    print_error "功能分支 $FEATURE_BRANCH 不存在！"
    exit 1
fi

print_success "所有必要分支都存在"

# 4. 检查工作区是否干净
print_step "检查工作区状态..."
if ! git diff-index --quiet HEAD --; then
    print_warning "工作区有未提交的更改，请先提交或暂存！"
    echo "使用 'git status' 查看详情："
    git status --short
    exit 1
fi

print_success "工作区状态干净"

# 5. 获取功能分支版本信息
FEATURE_VERSION=$(get_version)
print_info "功能分支版本: $FEATURE_VERSION"

# 6. 阶段一：切换到dev分支并合并功能分支
echo ""
echo "================================================"
print_highlight "阶段一：合并功能分支到dev分支"
echo "================================================"

print_step "切换到dev分支..."
git checkout dev

# 自动提交dev分支上的自动生成文件
auto_commit_generated_files "dev"

# 拉取最新的dev分支
if check_remote "origin" && check_remote_connection "origin"; then
    print_step "拉取最新的dev分支..."
    git pull origin dev
    print_success "dev分支已更新"
fi

# 合并功能分支到dev
if ! safe_merge "$FEATURE_BRANCH" "dev"; then
    print_error "合并失败，请手动解决冲突后重新运行"
    exit 1
fi

# 合并后处理类型声明文件（翻译文件已通过union策略自动合并）
regenerate_type_files "dev"

DEV_VERSION=$(get_version)
print_success "Dev分支合并完成，版本: $DEV_VERSION"

# 推送dev分支到所有远程仓库
print_step "推送dev分支到远程仓库..."
push_to_all_remotes "dev"
DEV_PUSH_RESULT=$?

# 7. 阶段二：切换到main分支并合并dev分支
echo ""
echo "================================================"
print_highlight "阶段二：合并dev分支到main分支"
echo "================================================"

print_step "切换到main分支..."
git checkout main

# 自动提交main分支上的自动生成文件
auto_commit_generated_files "main"

# 拉取最新的main分支
if check_remote "origin" && check_remote_connection "origin"; then
    print_step "拉取最新的main分支..."
    git pull origin main
    print_success "main分支已更新"
fi

# 合并dev到main
if ! safe_merge "dev" "main"; then
    print_error "合并失败，请手动解决冲突后重新运行"
    exit 1
fi

# 合并后处理类型声明文件（翻译文件已通过union策略自动合并）
regenerate_type_files "main"

MAIN_VERSION=$(get_version)
print_success "Main分支合并完成，版本: $MAIN_VERSION"

# 推送main分支到所有远程仓库
print_step "推送main分支到远程仓库..."
push_to_all_remotes "main"
MAIN_PUSH_RESULT=$?

# 8. 显示发布结果总结
echo ""
echo "================================================"
print_highlight "🎉 发布流程完成！"
echo "================================================"

echo "📊 发布总结:"
echo "  - 功能分支: $FEATURE_BRANCH (版本: $FEATURE_VERSION)"
echo "  - Dev分支:  已合并 (版本: $DEV_VERSION)"
echo "  - Main分支: 已合并 (版本: $MAIN_VERSION)"

echo ""
echo "📍 远程仓库配置:"
git remote -v | grep -E "(origin|gitee)" | sort

echo ""
echo "🚀 推送结果:"
case $DEV_PUSH_RESULT in
    0) echo -e "  ${GREEN}✅ Dev分支: 推送成功${NC}" ;;
    1) echo -e "  ${YELLOW}⚠️  Dev分支: 部分推送成功${NC}" ;;
    2) echo -e "  ${RED}❌ Dev分支: 推送失败${NC}" ;;
esac

case $MAIN_PUSH_RESULT in
    0) echo -e "  ${GREEN}✅ Main分支: 推送成功${NC}" ;;
    1) echo -e "  ${YELLOW}⚠️  Main分支: 部分推送成功${NC}" ;;
    2) echo -e "  ${RED}❌ Main分支: 推送失败${NC}" ;;
esac

echo ""
echo "🌿 当前状态:"
echo "  - 当前分支: $(git branch --show-current)"
echo "  - 最新提交: $(git log --oneline -1)"

# 9. 询问是否删除功能分支
echo ""
BRANCH_DELETED=false
if [ -t 0 ] && [ -t 1 ]; then  # 检查是否在交互式终端中
    read -p "是否删除本地功能分支 $FEATURE_BRANCH？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "删除本地功能分支 $FEATURE_BRANCH..."
        git branch -d $FEATURE_BRANCH
        print_success "本地功能分支 $FEATURE_BRANCH 已删除"
        BRANCH_DELETED=true
        
        # 检查是否存在远程分支
        if check_remote "origin"; then
            if git ls-remote --exit-code --heads origin $FEATURE_BRANCH > /dev/null 2>&1; then
                read -p "是否同时删除远程功能分支 origin/$FEATURE_BRANCH？(y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    print_step "删除远程功能分支 origin/$FEATURE_BRANCH..."
                    if git push origin --delete $FEATURE_BRANCH; then
                        print_success "远程功能分支 origin/$FEATURE_BRANCH 已删除"
                    else
                        print_warning "删除远程分支失败，可能权限不足或分支被保护"
                    fi
                else
                    print_info "保留远程功能分支 origin/$FEATURE_BRANCH"
                fi
            else
                print_info "远程分支 origin/$FEATURE_BRANCH 不存在或已删除"
            fi
        fi
    else
        print_info "保留功能分支 $FEATURE_BRANCH"
    fi
else
    print_info "非交互模式，保留功能分支 $FEATURE_BRANCH"
fi

# 10. 智能分支切换策略
echo ""
if [ "$BRANCH_DELETED" = true ]; then
    # 如果删除了功能分支，说明功能已完结，切换到dev开始新开发
    print_step "功能分支已删除，切换到dev分支准备下次开发..."
    git checkout dev
    print_success "已切换到dev分支，可以开始新功能开发"
    
    echo ""
    echo -e "${GREEN}🌟 开始新功能开发:${NC}"
    echo "  - 当前在dev分支，基于最新代码开发"
    echo -e "  - 创建功能分支: ${BLUE}git checkout -b feat_0129${NC} ${CYAN}# 功能+日期${NC}"
    echo -e "  - 创建模块分支: ${BLUE}git checkout -b feat_userLogin${NC} ${CYAN}# 功能+模块名${NC}"
    echo -e "  - 创建修复分支: ${BLUE}git checkout -b fix_loginBug${NC} ${CYAN}# 修复+问题${NC}"
    echo -e "  - 创建热修分支: ${BLUE}git checkout -b hotfix_critical${NC} ${CYAN}# 紧急修复${NC}"
else
    # 如果保留了功能分支，可能还需要继续在该分支上工作，切换回功能分支
    print_step "功能分支已保留，切换回功能分支继续开发..."
    git checkout "$FEATURE_BRANCH"
    print_success "已切换回功能分支 $FEATURE_BRANCH"
    
    echo ""
    echo -e "${YELLOW}🔧 继续功能开发:${NC}"
    echo "  - 当前在功能分支 $FEATURE_BRANCH，可继续完善功能"
    echo -e "  - 提交更改: ${BLUE}git add . && git cz || [commit] -m \"补充功能\"${NC}"
    echo -e "  - 推送更新: ${BLUE}git push origin $FEATURE_BRANCH${NC}"
    echo -e "  - 完成后再次发布: ${BLUE}bun run deploy${NC}"
    echo ""
    echo -e "  - 或开始新功能: ${BLUE}git checkout dev && git checkout -b feat_newFeature${NC}"
fi

# 11. 后续操作建议
echo ""
echo -e "${YELLOW}💡 后续操作建议:${NC}"
echo "  1. 通知团队成员拉取最新的dev和main分支"
echo "  2. 检查GitHub和Gitee的分支状态"  
echo "  3. 验证部署和功能是否正常"

if [ "$BRANCH_DELETED" = true ]; then
    echo ""
    echo -e "${CYAN}📋 分支清理完成:${NC}"
    echo "  - ✅ 功能分支 $FEATURE_BRANCH 已合并并删除"
    echo "  - ✅ 代码已同步到dev和main分支"
    echo "  - ✅ 远程仓库已更新"
    echo "  - ✅ 已切换到dev分支，可开始新功能开发"
else
    echo ""
    echo -e "${CYAN}📋 功能分支保留:${NC}"
    echo "  - ✅ 功能分支 $FEATURE_BRANCH 已合并到dev和main"
    echo "  - ✅ 代码已同步到远程仓库"
    echo "  - ✅ 已切换回功能分支，可继续完善功能"
fi

# 检查整体结果
CURRENT_BRANCH=$(git branch --show-current)
if [ $DEV_PUSH_RESULT -eq 0 ] && [ $MAIN_PUSH_RESULT -eq 0 ]; then
    if [ "$BRANCH_DELETED" = true ]; then
        print_success "🎉 发布完成并已清理！准备开始新功能开发 (当前在$CURRENT_BRANCH分支)"
    else
        print_success "🎉 发布完成！可继续完善当前功能 (当前在$CURRENT_BRANCH分支)"
    fi
    exit 0
elif [ $DEV_PUSH_RESULT -lt 2 ] && [ $MAIN_PUSH_RESULT -lt 2 ]; then
    print_warning "部分推送失败，但核心流程完成 (当前在$CURRENT_BRANCH分支)"
    exit 0
else
    print_error "存在推送失败，请检查网络连接和权限 (当前在$CURRENT_BRANCH分支)"
    exit 1
fi