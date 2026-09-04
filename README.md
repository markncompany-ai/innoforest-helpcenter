# 혁신의숲 FAQ

채널톡 도움말센터(`docs.channel.io/innoforest/ko`)의 문의 25개를 옮겨 담은 단일 HTML FAQ 페이지.
운영자가 브라우저에서 직접 내용을 고칠 수 있고, 저장하면 페이지가 스스로 새 버전으로 발행된다.

## 특징

- **파일 하나로 완결** — 이미지와 폰트(Pretendard)를 전부 파일 안에 담아서, 외부 서버 없이 HTML 하나만 열면 동작한다.
- **문의 1건 = 1페이지** — 첫 화면은 카테고리별 목록, 클릭하면 해당 문의만 보인다. 주소(`#a5`)로 개별 공유 가능.
- **관리자 모드** — 문의 추가·수정·삭제, 카테고리 내 순서 변경, BEST 3 지정.
- **편집기** — 제목/소제목/본문, 굵게, 목록, 링크, 구분선, 글자 색·배경색·크기, 이미지 붙여넣기(Ctrl+V).
- **밝은 화면 / 어두운 화면** 모두 대응.

## 구조

```
build.js                    빌드 스크립트
data.json                   문의 내용 원본 (이미지 포함) — 실질적인 콘텐츠 DB
src/
  shell.html                페이지 뼈대
  style.css                 스타일 (테마 토큰, 편집기 포함)
  app.js                    화면 렌더링 · 검색 · 라우팅 · 관리자 모드
vendor/
  PretendardVariable.woff2  Pretendard 가변 폰트 (SIL OFL 1.1)
  PRETENDARD-LICENSE.txt
docs/
  index.html                빌드 결과물 — GitHub Pages 가 이 폴더를 그대로 서비스한다
```

## 빌드

```bash
node build.js
```

`docs/index.html` 이 만들어진다. 별도 의존성 없이 Node.js 만 있으면 된다.

## 배포 (GitHub Pages)

`docs/` 폴더를 그대로 서비스하면 된다. 저장소 **Settings → Pages** 에서
Source 를 `Deploy from a branch`, 브랜치를 `main`, 폴더를 `/docs` 로 지정하면
`https://<계정>.github.io/innoforest-faq/` 로 공개된다. 빌드 과정이나 서버는 필요 없다.

> **Pages 로 띄운 페이지는 읽기 전용이다.** 관리자 모드는 Claude 아티팩트 환경에서만 켜지므로,
> 외부 방문자에게는 편집 진입로가 아예 나타나지 않는다. 검색·목록·문의 페이지·테마 전환은 그대로 동작한다.

## 콘텐츠 수정 방법

두 가지 경로가 있고, **원본은 항상 `data.json`** 이다.

**1. 운영자 — 브라우저에서 직접**

배포된 페이지에서 첫 화면의 `💡 자주 물어보는 질문 BEST` 글자를 **1.2초 안에 7번 클릭**하면 관리자 화면으로 들어간다.
수정 후 `저장하고 발행`을 누르면 페이지가 새 버전으로 발행되고, 열려 있는 모든 화면이 자동으로 갱신된다.
편집 권한이 없는 계정은 저장 단계에서 거부된다.

이 경로로 고친 내용은 저장소의 `data.json` 에는 반영되지 않는다.
저장소를 최신 상태로 맞추려면 배포된 페이지의 `<script id="faq-data">` 안의 JSON 을 꺼내
`data.json` 에 덮어쓰고 커밋한다.

**2. 개발자 — 저장소에서**

`data.json` 을 직접 고치거나 `src/` 를 수정한 뒤 `node build.js` 로 다시 빌드한다.

> 두 경로를 동시에 쓰면 한쪽이 덮인다. 운영자가 편집 중일 때는 저장소 쪽 배포를 미루는 편이 안전하다.

## data.json 형식

```jsonc
{
  "cats": ["회원가입 문의", "..."],        // 카테고리 (표시 순서)
  "best": ["a5", "a1", "a10"],            // 첫 화면 BEST 카드 (최대 3개)
  "articles": [
    {
      "id": "a1",                          // 고유 id, 주소의 #a1 로 쓰인다
      "cat": "회원가입 문의",
      "emoji": "👥",
      "title": "회사 이메일이 없는데 가입하고 싶어요.",
      "summary": "목록에 보이는 한 줄 요약",
      "html": "<p>본문 HTML …</p>"         // 이미지는 data URI 로 포함
    }
  ]
}
```

`articles` 배열의 순서가 곧 화면 표시 순서다. 카테고리별로 묶여 있어야 한다.

## 참고

- 이미지는 `data.json` 안에 data URI 로 들어가므로 콘텐츠를 고칠 때마다 파일 전체가 바뀐다.
  변경 이력이 빠르게 쌓이니, 문의를 하나 고칠 때마다 커밋하기보다 적당한 시점에 묶어서 커밋하는 편이 좋다.
- 완성된 HTML 은 16MB 를 넘지 않아야 한다. 관리자 화면 상단에 현재 문서 크기가 표시된다.
- 이미지는 넣을 때 가로 1400px 로 자동 축소되고 PNG/JPEG 중 작은 쪽으로 저장된다.

## 라이선스

FAQ 본문은 마크앤컴퍼니가 운영하는 혁신의숲 서비스의 공개 도움말 내용이다.
`vendor/PretendardVariable.woff2` 는 [Pretendard](https://github.com/orioncactus/pretendard) (SIL Open Font License 1.1) 이며 라이선스 전문은 `vendor/PRETENDARD-LICENSE.txt` 에 있다.
