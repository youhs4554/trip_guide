# Taipei Trip Guide Webbook

한국어 전용 타이베이 3박 4일 커플 여행 가이드북입니다. 정적 HTML/CSS/JS로 구성되어 GitHub Pages에 바로 배포할 수 있습니다.

## 포함 내용

- 날짜별 멀티페이지 일정
- 숙소 기준 동선과 Google Maps 링크
- 저강도 이동 기준의 명소·식당 추천
- 당 조절, 공황, 무릎, 위장 부담을 고려한 운영 메모
- 병원, 분실, 공항 변수 대응 매뉴얼

## 로컬 실행

정적 파일이므로 간단한 서버만 띄우면 됩니다.

```bash
python3 -m http.server 4173
```

브라우저에서 [http://localhost:4173](http://localhost:4173) 접속

## 파일 구조

```text
.
├── index.html
├── day1.html
├── day2.html
├── day3.html
├── day4.html
├── safety.html
├── assets
│   ├── css/styles.css
│   ├── js/app.js
│   ├── data/trip-data.json
│   └── images/
└── .github/workflows/pages.yml
```

## GitHub Pages 배포

1. GitHub에 새 저장소를 만들고 이 저장소를 push
2. GitHub 저장소의 `Settings > Pages`에서 소스를 `GitHub Actions`로 선택
3. `master` 또는 `main` 브랜치에 push 하면 `.github/workflows/pages.yml`이 자동 배포

기본 공개 주소:

```text
https://<github-username>.github.io/<repo>/
```

## 운영 메모

- 모든 자산 경로는 상대 경로 기준이라 GitHub Pages 하위 경로에서도 동작합니다.
- 이미지가 로드되지 않으면 공통 fallback SVG로 대체됩니다.
- 외부 링크는 새 탭에서 열리도록 구성했습니다.
