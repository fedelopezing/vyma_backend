const https = require('https');

https
  .get(
    'https://www.cambioschaco.com.py/api/branch_office/1/exchange',
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    },
    (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const targets = ['USD', 'CHF', 'EUR', 'BRL', 'ARS'];
          const filtered = parsed.items.filter((item) =>
            targets.includes(item.isoCode),
          );
          console.log('Filtered items:', JSON.stringify(filtered, null, 2));
        } catch (e) {
          console.log('Failed to parse JSON:', e.message);
        }
      });
    },
  )
  .on('error', (err) => {
    console.error('Error:', err.message);
  });
