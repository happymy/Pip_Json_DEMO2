# Pip_Json_DEMO2

一个使用 Puppeteer 自动化抓取 DNS 记录信息的项目。

## 项目介绍

本项目通过自动化浏览器访问 [nslookup.io](https://www.nslookup.io/) 网站，抓取指定域名的 DNS A 记录（IPv4 地址）及其地理位置信息，并将结果保存为 JSON 格式文件。

项目会抓取域名 `bpb.yousef.isegaro.com` 的所有 IPv4 地址及对应的位置信息。

## 技术栈

- [Node.js](https://nodejs.org/)
- [Puppeteer](https://pptr.dev/) - 用于控制无头浏览器
- [GitHub Actions](https://github.com/features/actions) - 自动化执行

## 文件说明

- [scraper.js](scraper.js) - 主要的抓取脚本
- [output.json](output.json) - 抓取结果（JSON 格式）
- [output.html](output.html) - 页面渲染后的 HTML 内容
- [debug.png](debug.png) - 抓取时的页面截图
- [.github/workflows/scrape.yml](.github/workflows/scrape.yml) - GitHub Actions 自动化配置

## 工作流程

scraper.js 脚本执行以下操作：

1. 启动无头浏览器并访问目标网址
2. 使用反反爬虫技术（设置真实浏览器 UA、禁用 webdriver 标志等）
3. 等待页面内容加载完成
4. 从页面表格中提取所有 IPv4 地址和位置信息
5. 将结果保存到 [output.json](output.json) 文件中

## 自动化设置

项目使用 GitHub Actions 每2小时自动运行一次抓取任务。配置文件位于 [.github/workflows/scrape.yml](.github/workflows/scrape.yml)。

支持的手动触发方式：
- 在 GitHub 仓库页面点击 "Actions" 标签
- 选择 "Scrape and Commit" 工作流
- 点击 "Run workflow" 按钮

## 本地运行

1. 克隆项目到本地：
   ```bash
   git clone <repository-url>
   ```

2. 安装依赖：
   ```bash
   npm install puppeteer
   ```

3. 运行脚本：
   ```bash
   node scraper.js
   ```

运行完成后，将在项目目录中生成 [output.json](output.json) 和 [output.html](output.html) 文件。

## 输出格式

输出的 JSON 文件包含一个对象数组，每个对象具有以下结构：

```json
{
  "ip": "79.137.194.243",
  "location": "Frankfurt am Main, Hesse, Germany"
}
```

## 许可证

本项目采用 MIT 许可证，详情请见 [LICENSE](LICENSE) 文件。