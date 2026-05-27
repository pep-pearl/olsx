<!--
@ai-purpose OLSX 설치 방법, peer dependency, 로컬 개발 명령을 설명한다.
@ai-doc-kind getting-started
@ai-keywords installation, install, npm install, peer dependency, local development, build, lint, test
@ai-related docs/getting-started/quick-start.md, README.md
-->

# 설치

## 패키지 설치

> **참고:** 이 패키지는 아직 private 상태이며 npm에 배포되지 않았습니다.

```sh
npm install olsx ol react react-dom
```

## 피어 의존성

| 패키지 | 버전 |
|---|---|
| `react` | ^18 \|\| ^19 |
| `react-dom` | ^18 \|\| ^19 |
| `ol` | ^10 |

OLSX는 OpenLayers(`ol`)와 React를 peer dependency로 요구합니다. 프로젝트에 이미 설치되어 있다면 추가 설치는 필요 없습니다.

## 로컬 개발 환경

```sh
git clone <repository-url>
cd olsx
npm install
npm run dev
```

`npm run dev`는 Vite 기반 playground를 실행합니다. `playground/App.tsx`에서 컴포넌트를 직접 사용해 볼 수 있습니다.

## 빌드 & 검증

```sh
npm run lint       # ESLint
npm test           # TypeScript 컴파일 + Node test runner
npm run build      # tsc + Vite 라이브러리 빌드
```

## 관련 문서

- [빠른 시작](quick-start.md)
