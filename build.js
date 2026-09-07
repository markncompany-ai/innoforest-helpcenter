/**
 * 혁신의숲 FAQ — 단일 HTML 파일 빌드
 *
 *   node build.js   ->   docs/index.html  (GitHub Pages 가 그대로 서비스하는 경로)
 *
 * data.json(문의 내용) + src/(화면 코드) + vendor/(폰트)를 하나의 HTML로 합친다.
 * 이미지와 폰트는 외부 주소를 쓰지 않고 파일 안에 직접 담기므로,
 * 만들어진 HTML 한 개만 있으면 어디서든 그대로 열린다.
 */
const fs = require('fs');
const path = require('path');

const read = p => fs.readFileSync(path.join(__dirname, p), 'utf8');

const font = fs.readFileSync(path.join(__dirname, 'vendor/PretendardVariable.woff2')).toString('base64');
const css = read('src/style.css');
const app = read('src/app.js');
const shell = read('src/shell.html').trim();
const data = JSON.parse(read('data.json'));

// '<' 를 이스케이프해야 본문 안의 태그가 script 블록을 깨지 않는다
const json = JSON.stringify(data).replace(/</g, '\\u003c');
const CLOSE = '<' + '/script>';

const fontFace = `@font-face{
 font-family:"Pretendard Variable";
 src:url(data:font/woff2;base64,${font}) format("woff2-variations");
 font-weight:45 920; font-style:normal; font-display:swap;
}
`;

const cfg = read('config.json').trim();

const html = `<title>혁신의숲 FAQ 아카이브</title>
<style id="app-style">${fontFace}${css}</style>
${shell}
<script id="app-shell" type="text/plain">${shell}${CLOSE}
<script id="app-config" type="application/json">${cfg}${CLOSE}
<script id="faq-data" type="application/json">${json}${CLOSE}
<script id="app-js">${app}${CLOSE}
`;

fs.mkdirSync(path.join(__dirname, 'docs'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'docs/.nojekyll'), '');
const out = path.join(__dirname, 'docs/index.html');
fs.writeFileSync(out, html);

const imgs = (html.match(/data:image\//g) || []).length;
console.log('빌드 완료:', out);
console.log(`  ${(fs.statSync(out).size / 1048576).toFixed(2)}MB · 문의 ${data.articles.length}개 · 카테고리 ${data.cats.length}개 · 이미지 ${imgs}장`);
if (html.length > 16 * 1024 * 1024) {
  console.warn('  경고: 아티팩트 상한 16MB를 넘었습니다. 이미지를 줄이세요.');
}
