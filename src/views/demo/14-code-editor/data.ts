/*
 * @Author: ChenYu ycyplus@gmail.com
 * @Date: 2025-06-19 13:00:00
 * @LastEditors: ChenYu ycyplus@gmail.com
 * @LastEditTime: 2025-06-19 17:44:18
 * @FilePath: \Robot_Admin\src\views\demo\14-code-editor\data.ts
 * @Description: C_Code 组件演示页面数据配置
 * Copyright (c) 2025 by CHENY, All Rights Reserved 😎.
 */

export const CODE_FILES = [
  {
    language: 'javascript',
    name: 'utils.js',
    content: `// JavaScript 工具函数
class Utils {
  /**
   * * @description 格式化日期为中文格式
   * ? @param date - 日期对象
   * ! @return string 格式化后的日期字符串
   */
  static formatDate(date) {
    return new Intl.DateTimeFormat('zh-CN').format(date)
  }

  /**
   * * @description 防抖函数，延迟执行
   * ? @param func - 要防抖的函数
   * ? @param wait - 延迟时间(毫秒)
   * ! @return Function 防抖后的函数
   */
  static debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  /**
   * * @description 深度克隆对象
   * ? @param obj - 要克隆的对象
   * ! @return any 克隆后的对象
   */
  static deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj)
    if (obj instanceof Array) return obj.map(item => Utils.deepClone(item))
    
    const cloned = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = Utils.deepClone(obj[key])
      }
    }
    return cloned
  }
}

export default Utils`,
  },
  {
    language: 'typescript',
    name: 'models.ts',
    content: `// TypeScript 接口定义
export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  isActive: boolean
  createdAt: Date
}

export interface ApiResponse<T> {
  data: T
  code: number
  message: string
  timestamp: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export class UserService {
  private baseUrl = '/api/users'

  /**
   * * @description 获取用户列表
   * ! @return Promise<PaginatedResponse<User>> 分页用户数据
   */
  async getUsers(): Promise<PaginatedResponse<User>> {
    const response = await fetch(this.baseUrl)
    return response.json()
  }

  /**
   * * @description 创建新用户
   * ? @param user - 用户信息(排除id和创建时间)
   * ! @return Promise<ApiResponse<User>> 创建结果
   */
  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<ApiResponse<User>> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    return response.json()
  }
}`,
  },
  {
    language: 'json',
    name: 'config.json',
    content: `{
  "name": "robot-admin",
  "version": "1.0.0",
  "description": "Vue 3 管理后台",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build", 
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "naive-ui": "^2.38.0",
    "highlight.js": "^11.9.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vue-tsc": "^1.8.0"
  }
}`,
  },
  {
    language: 'cpp',
    name: 'main.cpp',
    content: `#include <iostream>
#include <vector>
#include <algorithm>

class NumberProcessor {
private:
    std::vector<int> numbers;
    
public:
    /**
     * * @description 添加数字到集合中
     * ? @param num - 要添加的数字
     * ! @return void
     */
    void addNumber(int num) {
        numbers.push_back(num);
    }
    
    /**
     * * @description 计算所有数字的总和
     * ! @return int 数字总和
     */
    int getSum() const {
        return std::accumulate(numbers.begin(), numbers.end(), 0);
    }
    
    /**
     * * @description 计算数字的平均值
     * ! @return double 平均值
     */
    double getAverage() const {
        return numbers.empty() ? 0 : static_cast<double>(getSum()) / numbers.size();
    }
};

int main() {
    NumberProcessor processor;
    processor.addNumber(10);
    processor.addNumber(20);
    processor.addNumber(30);
    
    std::cout << "平均值: " << processor.getAverage() << std::endl;
    return 0;
}`,
  },
  {
    language: 'rust',
    name: 'main.rs',
    content: `struct Calculator {
    value: f64,
}

impl Calculator {
    fn new() -> Self {
        Calculator { value: 0.0 }
    }
    
    /**
     * * @description 加法运算
     * ? @param num - 要相加的数字
     * ! @return &mut Self 返回自身引用以支持链式调用
     */
    fn add(&mut self, num: f64) -> &mut Self {
        self.value += num;
        self
    }
    
    /**
     * * @description 乘法运算
     * ? @param num - 要相乘的数字
     * ! @return &mut Self 返回自身引用以支持链式调用
     */
    fn multiply(&mut self, num: f64) -> &mut Self {
        self.value *= num;
        self
    }
    
    /**
     * * @description 获取计算结果
     * ! @return f64 当前计算值
     */
    fn result(&self) -> f64 {
        self.value
    }
}

fn main() {
    let mut calc = Calculator::new();
    let result = calc.add(10.0).multiply(2.0).result();
    println!("结果: {}", result);
}`,
  },
  {
    language: 'swift',
    name: 'main.swift',
    content: `import Foundation

class TaskManager {
    private var tasks: [String] = []
    
    /**
     * * @description 添加任务到列表
     * ? @param task - 任务描述
     * ! @return void
     */
    func addTask(_ task: String) {
        tasks.append(task)
        print("任务已添加: \\(task)")
    }
    
    /**
     * * @description 移除指定位置的任务
     * ? @param index - 任务索引
     * ! @return void
     */
    func removeTask(at index: Int) {
        guard index < tasks.count else { return }
        let removed = tasks.remove(at: index)
        print("任务已删除: \\(removed)")
    }
    
    /**
     * * @description 列出所有任务
     * ! @return void
     */
    func listTasks() {
        for (index, task) in tasks.enumerated() {
            print("\\(index + 1). \\(task)")
        }
    }
}

let manager = TaskManager()
manager.addTask("学习 Swift")
manager.addTask("完成项目")
manager.listTasks()`,
  },
  {
    language: 'php',
    name: 'index.php',
    content: `<?php
class UserValidator {
    /**
     * * @description 验证邮箱格式
     * ? @param $email - 邮箱地址
     * ! @return bool 是否为有效邮箱
     */
    public static function validateEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    /**
     * * @description 验证密码强度
     * ? @param $password - 密码字符串
     * ! @return bool 是否满足强度要求
     */
    public static function validatePassword($password) {
        return strlen($password) >= 8 && 
               preg_match('/[A-Z]/', $password) && 
               preg_match('/[a-z]/', $password) && 
               preg_match('/[0-9]/', $password);
    }
    
    /**
     * * @description 清理用户输入
     * ? @param $input - 用户输入
     * ! @return string 清理后的安全字符串
     */
    public static function sanitizeInput($input) {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
}

// 使用示例
$email = "user@example.com";
$password = "Password123";

if (UserValidator::validateEmail($email)) {
    echo "邮箱格式正确\\n";
}

if (UserValidator::validatePassword($password)) {
    echo "密码强度足够\\n";
}
?>`,
  },
  {
    language: 'ruby',
    name: 'library.rb',
    content: `class BookLibrary
  def initialize
    @books = []
  end
  
  # * @description 添加图书到图书馆
  # ? @param title - 图书标题
  # ? @param author - 作者
  # ? @param year - 出版年份
  # ! @return void
  def add_book(title, author, year)
    book = {
      title: title,
      author: author,
      year: year,
      id: generate_id
    }
    @books << book
    puts "图书已添加: #{title}"
  end
  
  # * @description 根据作者查找图书
  # ? @param author - 作者名称
  # ! @return Array 该作者的图书列表
  def find_books_by_author(author)
    @books.select { |book| book[:author] == author }
  end
  
  # * @description 列出所有图书
  # ! @return void
  def list_books
    @books.each do |book|
      puts "#{book[:id]}: #{book[:title]} - #{book[:author]} (#{book[:year]})"
    end
  end
  
  private
  
  def generate_id
    @books.length + 1
  end
end

library = BookLibrary.new
library.add_book("Ruby程序设计", "松本行弘", 2008)
library.add_book("Rails实践", "DHH", 2010)
library.list_books`,
  },
  {
    language: 'sql',
    name: 'schema.sql',
    content: `-- 用户管理数据库设计
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    bio TEXT,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引提升查询性能
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- 查询活跃用户及其资料
SELECT 
    u.id,
    u.username,
    u.email,
    up.first_name,
    up.last_name,
    u.created_at
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.is_active = true
ORDER BY u.created_at DESC;`,
  },
] as const
