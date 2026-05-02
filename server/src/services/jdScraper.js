const axios = require('axios');
const cheerio = require('cheerio');

exports.scrapeJD = async (url) => {
  const { data } = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    timeout: 10000,
  });
  const $ = cheerio.load(data);
  // Remove nav, footer, scripts, styles
  $('nav, footer, script, style, header, aside').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  return text.slice(0, 6000); // cap to avoid token overflow
};
