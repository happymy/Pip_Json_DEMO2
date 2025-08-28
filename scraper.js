const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrape() {
	const url = 'https://www.nslookup.io/domains/bpb.yousef.isegaro.com/dns-records/';
	const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: 'networkidle2' });

	// 调试：截图页面
	await page.screenshot({ path: 'debug.png' });

	// 提取 IP 和位置信息
	const data = await page.evaluate(() => {
		const result = [];
		const table = document.querySelector('table');
		if (!table) {
			console.log('未找到表格');
			return result;
		}
		const rows = table.querySelectorAll('tbody tr');
		console.log('表格行数:', rows.length);
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