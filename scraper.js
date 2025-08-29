const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrape() {
	const url = 'https://www.nslookup.io/domains/bpb.yousef.isegaro.com/dns-records/';
	const browser = await puppeteer.launch({
		headless: true,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-blink-features=AutomationControlled'
		]
	});
	const page = await browser.newPage();

	// 设置常见浏览器 UA
	await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

	// 设置浏览器属性
	await page.setViewport({ width: 1280, height: 800 });
	await page.setExtraHTTPHeaders({
		'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
	});

	// 注入反自动化脚本
	await page.evaluateOnNewDocument(() => {
		Object.defineProperty(navigator, 'webdriver', { get: () => false });
	});

	await page.goto(url, { waitUntil: 'networkidle2' });

	// 等待 DNS 记录表格渲染（A记录表格标题）
	await page.waitForSelector('h2.font-semibold', { timeout: 15000 });
	// 再等待表格内容出现
	await page.waitForSelector('table', { timeout: 15000 });

	// 模拟滚动和随机等待
	await page.evaluate(() => { window.scrollBy(0, 400); });
	await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));

	await page.screenshot({ path: 'debug.png' });
	// 保存渲染后的 HTML
	const html = await page.content();
	fs.writeFileSync('output.html', html, 'utf-8');

	// 提取所有A记录（IPv4）
	const data = await page.evaluate(() => {
		const result = [];
		// 找到所有A记录表格
		const h2s = Array.from(document.querySelectorAll('h2.font-semibold'));
		let aTable = null;
		for (const h2 of h2s) {
			if (h2.textContent.includes('A records')) {
				// A记录表格紧跟在h2后
				let next = h2.nextElementSibling;
				while (next && next.tagName !== 'DIV') next = next.nextElementSibling;
				if (next) {
					aTable = next.querySelector('table');
					break;
				}
			}
		}
		if (!aTable) return result;
		const rows = aTable.querySelectorAll('tbody tr');
		rows.forEach(row => {
			const cells = row.querySelectorAll('td');
			if (cells.length >= 2) {
				// IPv4地址
				const ip = cells[1].querySelector('span')?.textContent.trim() || cells[1].textContent.trim();
				result.push({ ip });
			}
		});
		return result;
	});

	await browser.close();

	fs.writeFileSync('output.json', JSON.stringify(data, null, 2), 'utf-8');
	console.log('已保存到 output.json');
}

scrape();