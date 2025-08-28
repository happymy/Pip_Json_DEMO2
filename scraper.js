const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrape() {
	const url = 'https://www.nslookup.io/domains/bpb.yousef.isegaro.com/dns-records/';
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto(url, { waitUntil: 'networkidle2' });

	// 提取 IP 和位置信息
	const data = await page.evaluate(() => {
		const result = [];
		// 找到 DNS 记录表格
		const rows = document.querySelectorAll('table tbody tr');
		rows.forEach(row => {
			const cells = row.querySelectorAll('td');
			if (cells.length >= 4) {
				const type = cells[0].innerText.trim();
				if (type === 'A') {
					const ip = cells[1].innerText.trim();
					const location = cells[3].innerText.trim();
					// location 可能是 "国家, 城市" 格式
					let country = location.split(',')[0].trim();
					result.push({ ip, country, location });
				}
			}
		});
		return result;
	});

	await browser.close();

	// 输出为 JSON 文件
	fs.writeFileSync('output.json', JSON.stringify(data, null, 2), 'utf-8');
	console.log('已保存到 output.json');
}

scrape();
