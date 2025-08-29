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

	// 模拟滚动
	await page.evaluate(() => {
		window.scrollBy(0, 200);
	});

	// 随机等待
	await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));

	await page.screenshot({ path: 'debug.png' });

	// 提取 IP 和位置信息
	const data = await page.evaluate(() => {
		const result = [];
		const table = document.querySelector('table');
		if (!table) {
			return result;
		}
		const rows = table.querySelectorAll('tbody tr');
		rows.forEach(row => {
			const cells = row.querySelectorAll('td');
			if (cells.length >= 4) {
				const type = cells[0].innerText.trim();
				if (type === 'A') {
					const ip = cells[1].innerText.trim();
					const location = cells[3].innerText.trim();
					let country = location.split(',')[0].trim();
					result.push({ ip, country, location });
				}
			}
		});
		return result;
	});

	await browser.close();

	fs.writeFileSync('output.json', JSON.stringify(data, null, 2), 'utf-8');
	console.log('已保存到 output.json');
}

scrape();