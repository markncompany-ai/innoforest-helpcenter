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
sync.cmd                    공개 사이트 반영 (토큰 없이 쓰는 대안 경로)
config.json                 저장소 정보 — 관리자 화면이 어디에 저장할지
.github/workflows/          data.json 이 바뀌면 공개 페이지를 자동 재생성
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
공개 주소: **https://sssyyy-hash.github.io/innoforest-faq/**

공개 사이트에서도 관리자 모드로 편집·저장이 가능하다. 저장은 GitHub 저장소에 직접 기록하는 방식이며,
운영자 본인의 GitHub 토큰이 있어야 한다. 토큰이 없는 방문자는 저장이 거부되므로 읽기만 가능하다.

## 콘텐츠 수정 방법

**원본은 항상 `data.json`** 이다. 아티팩트(편집용)와 공개 사이트(열람용)는 별개의 사본이므로, 고친 내용을 공개 사이트에 옮기는 단계가 필요하다.

**1. 운영자 — 브라우저에서 직접 (아티팩트)**

첫 화면의 `💡 자주 물어보는 질문 BEST` 글자를 **1.2초 안에 7번 클릭**하면 관리자 화면이 열린다.
수정 후 `저장하고 발행`을 누르면 아티팩트가 새 버전이 되고, 열려 있는 모든 화면이 자동으로 갱신된다.
편집 권한이 없는 계정은 저장 단계에서 거부된다.

**이 단계까지는 공개 사이트에 반영되지 않는다.** 아티팩트와 공개 사이트는 별개의 사본이다.

**2. 운영자 — 공개 사이트에서 직접 (GitHub Pages)**

공개 주소에서도 같은 방법(`💡 자주 물어보는 질문 BEST` 7번 클릭)으로 관리자 화면에 들어간다.
처음 한 번만 **GitHub 토큰을 연결**하면, 그 뒤로는 수정하고 `저장하고 공개 사이트에 반영` 을 누르면 끝이다.

토큰 발급: [Fine-grained token](https://github.com/settings/personal-access-tokens/new) 에서
Repository access 를 이 저장소 하나만 선택하고, Permissions 의 **Contents 를 Read and write** 로 켠 뒤 만료일을 정한다.
토큰은 그 브라우저에만 저장되며 페이지 소스나 저장소에는 들어가지 않는다.

저장하면 `data.json` 이 커밋되고, GitHub Actions 가 `docs/index.html` 을 다시 만들어 1~2분 뒤 반영된다.

**3. 토큰 없이 반영하기 (대안)**

1. 관리자 화면에서 `⬇ 내용 내려받기` 를 누른다 → `data.json` 이 다운로드 폴더에 받아진다
2. `sync.cmd` 를 더블클릭한다

`sync.cmd` 가 다운로드 폴더에서 방금 받은 파일을 자동으로 찾아 가져온 뒤,
빌드 → 기록 → 업로드까지 한 번에 처리한다. 파일을 직접 옮길 필요는 없다.

1~2분 뒤 공개 주소에 반영된다. 터미널을 쓴다면 `sync.cmd` 대신 아래와 같다.

```bash
node build.js && git add -A && git commit -m "FAQ 내용 갱신" && git push
```

**4. 개발자 — 화면 자체를 고칠 때**

`src/` 를 수정한 뒤 `node build.js` 로 다시 빌드한다.
화면 코드를 고쳤다면 아티팩트에도 같은 내용을 다시 발행해야 두 사본이 어긋나지 않는다.

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
