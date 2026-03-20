#!/bin/bash

# sync-dev.sh - 发布后同步dev分支到GitHub和Gitee
# 使用方法: ./sync-dev.sh 或 npm run sync-dev-branch

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    print_step "检查 $remote_name 远程仓库连接..."
    if git ls-remote --exit-code $remote_name > /dev/null 2>&1; then
        print_success "$remote_name 连接正常"
        return 0
    else
        print_warning "$remote_name 连接失败，可能是网络问题或权限不足"
        return 1
    fi
}

# 安全推送函数
safe_push() {
    local remote_name=$1
    local branch_name=$2
    local remote_display_name=${3:-$remote_name}
    
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

# 检查是否在交互式终端中
is_interactive() {
    [ -t 0 ] && [ -t 1 ]
}

echo -e "${BLUE}🚀 开始同步dev分支到多个远程仓库...${NC}"
echo "================================================"

# 1. 保存当前分支
CURRENT_BRANCH=$(git branch --show-current)
print_step "当前分支: $CURRENT_BRANCH"

# 2. 检查必要分支是否存在
print_step "检查分支存在性..."
if ! check_branch_exists "main"; then
    print_error "main分支不存在！请先创建main分支"
    exit 1
fi

if ! check_branch_exists "dev"; then
    print_error "dev分支不存在！请先创建dev分支"
    exit 1
fi

# 3. 检查工作区是否干净
print_step "检查工作区状态..."
if ! git diff-index --quiet HEAD --; then
    print_warning "工作区有未提交的更改，请先提交或暂存！"
    echo "使用 'git status' 查看详情"
    git status --short
    exit 1
fi

print_success "工作区状态干净"

# 4. 更新main分支
print_step "更新main分支..."
git checkout main

# 检查origin连接
if check_remote "origin"; then
    if check_remote_connection "origin"; then
        git pull origin main
        print_success "main分支已更新"
    else
        print_warning "无法连接到origin，跳过拉取"
    fi
else
    print_warning "未找到origin远程仓库，跳过拉取"
fi

# 获取main分支版本号
MAIN_VERSION=""
if [ -f "package.json" ]; then
    MAIN_VERSION=$(grep '"version"' package.json | head -1 | cut -d'"' -f4)
    print_success "Main分支版本: $MAIN_VERSION"
else
    print_warning "未找到package.json文件"
fi

# 5. 切换到dev分支并合并main
print_step "同步dev分支..."
git checkout dev

# 拉取最新的dev分支（避免冲突）
if check_remote "origin" && check_remote_connection "origin"; then
    print_step "拉取最新的dev分支..."
    git pull origin dev
    print_success "dev分支已更新"
fi

# 合并main到dev
print_step "合并main分支到dev..."
if git merge main --no-edit; then
    print_success "合并成功"
else
    print_error "合并失败，存在冲突需要手动解决"
    print_warning "请按以下步骤解决："
    echo "  1. 使用 'git status' 查看冲突文件"
    echo "  2. 手动编辑冲突文件"
    echo "  3. 使用 'git add <文件>' 标记已解决"
    echo "  4. 使用 'git commit' 完成合并"
    echo "  5. 重新运行此脚本"
    exit 1
fi

# 获取dev分支版本号
DEV_VERSION=""
if [ -f "package.json" ]; then
    DEV_VERSION=$(grep '"version"' package.json | head -1 | cut -d'"' -f4)
    print_success "Dev分支版本: $DEV_VERSION"
fi

# 6. 推送到GitHub (origin)
print_step "推送dev分支到GitHub (origin)..."
GITHUB_SUCCESS=false
if check_remote "origin"; then
    if check_remote_connection "origin"; then
        if safe_push "origin" "dev" "GitHub"; then
            GITHUB_SUCCESS=true
        fi
    fi
else
    print_error "未找到origin远程仓库配置"
fi

# 7. 推送到Gitee
print_step "推送dev分支到Gitee..."
GITEE_SUCCESS=false
GITEE_REMOTE=""

# 检查常见的Gitee远程仓库名称
for remote in "gitee" "gitee-origin" "gitee-upstream"; do
    if check_remote $remote; then
        GITEE_REMOTE=$remote
        break
    fi
done

if [ -n "$GITEE_REMOTE" ]; then
    print_step "使用Gitee远程仓库: $GITEE_REMOTE"
    if check_remote_connection $GITEE_REMOTE; then
        if safe_push $GITEE_REMOTE "dev" "Gitee ($GITEE_REMOTE)"; then
            GITEE_SUCCESS=true
        fi
    fi
else
    print_warning "未找到Gitee远程仓库配置"
    echo "请添加Gitee远程仓库，例如："
    echo "git remote add gitee https://gitee.com/your-username/your-repo.git"
fi

# 8. 推送main分支到所有远程仓库（可选）
PUSH_MAIN=false
if is_interactive; then
    read -p "是否同时推送main分支到所有远程仓库？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PUSH_MAIN=true
    fi
else
    # 非交互模式，使用默认值
    print_warning "非交互模式，跳过main分支推送"
fi

if [ "$PUSH_MAIN" = true ]; then
    print_step "推送main分支..."
    git checkout main
    
    if check_remote "origin" && check_remote_connection "origin"; then
        safe_push "origin" "main" "GitHub"
    fi
    
    if [ -n "$GITEE_REMOTE" ] && check_remote_connection $GITEE_REMOTE; then
        safe_push $GITEE_REMOTE "main" "Gitee ($GITEE_REMOTE)"
    fi
    
    git checkout dev
fi

# 9. 显示推送状态
echo "================================================"
print_step "推送状态总结:"

echo "📍 远程仓库配置:"
git remote -v | grep -E "(origin|gitee)" | sort

echo ""
echo "📊 推送结果:"
if [ "$GITHUB_SUCCESS" = true ]; then
    echo -e "  ${GREEN}✅ GitHub (origin): 成功${NC}"
else
    echo -e "  ${RED}❌ GitHub (origin): 失败${NC}"
fi

if [ -n "$GITEE_REMOTE" ]; then
    if [ "$GITEE_SUCCESS" = true ]; then
        echo -e "  ${GREEN}✅ Gitee ($GITEE_REMOTE): 成功${NC}"
    else
        echo -e "  ${RED}❌ Gitee ($GITEE_REMOTE): 失败${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠️  Gitee: 未配置${NC}"
fi

echo ""
echo "📊 版本信息:"
if [ -n "$MAIN_VERSION" ]; then
    echo "  - Main版本: $MAIN_VERSION"
    echo "  - Dev版本:  $DEV_VERSION"
else
    echo "  - 未检测到版本信息"
fi

echo ""
echo "🌿 分支状态:"
echo "  - 当前分支: $(git branch --show-current)"
echo "  - 最新提交: $(git log --oneline -1)"

# 10. 返回原分支
if [ "$CURRENT_BRANCH" != "dev" ]; then
    print_step "返回原分支: $CURRENT_BRANCH"
    git checkout $CURRENT_BRANCH
fi

# 11. 检查整体结果
echo "================================================"
if [ "$GITHUB_SUCCESS" = true ] || [ "$GITEE_SUCCESS" = true ]; then
    print_success "🎉 同步完成！至少一个远程仓库已更新"
else
    print_error "同步失败！所有远程仓库推送都失败了"
    exit 1
fi

# 12. 显示后续操作建议
echo ""
echo -e "${YELLOW}💡 后续操作建议:${NC}"
echo "  1. 通知团队成员拉取最新的dev分支"
echo "  2. 检查GitHub和Gitee的分支状态"
echo "  3. 继续在feature分支上开发新功能"

if [ "$GITHUB_SUCCESS" = false ] && check_remote "origin"; then
    echo "  4. 检查GitHub推送失败的原因并重试"
fi

if [ "$GITEE_SUCCESS" = false ] && [ -n "$GITEE_REMOTE" ]; then
    echo "  5. 检查Gitee推送失败的原因并重试"
fi

echo ""