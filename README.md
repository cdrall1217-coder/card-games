# 수업 카드 게임

교실 TV, 빔프로젝터, 태블릿에서 바로 여는 카드 게임 모음입니다.
빌드 없이 HTML, CSS, JavaScript만 사용하며 GitHub Pages에서 동작합니다.

## 사용 방법

1. 아래 배포 주소로 접속합니다.
2. 메인 메뉴에서 게임을 검색하거나 과목으로 거릅니다.
3. 게임 카드를 누르면 게임이 열립니다.
4. 게임 화면 왼쪽 위의 **← 메뉴로** 를 누르면 목록으로 돌아옵니다.

브라우저에서 `index.html`을 파일로 직접 열면 `games.json`을 읽지 못할 수 있습니다. 로컬에서 볼 때는 저장소 루트에서 정적 서버를 실행합니다.

```powershell
python -m http.server 8080
```

브라우저에서 `http://localhost:8080` 을 엽니다. Python이 없으면 같은 역할을 하는 정적 서버로 루트 폴더를 열면 됩니다.

## 배포

GitHub Pages로 `main` 브랜치의 루트(`/`)를 게시합니다.

- 저장소: 푸시 후 주소가 정해집니다.
- 사이트: Pages를 켠 뒤 이 문단에 주소를 적습니다.

## 게임 목록

| 게임 | 과목 | 인원 | 경로 |
| --- | --- | --- | --- |
| 이어 주는 말 카드 뒤집기 | 국어 | 1~2명 | `games/connector-cards/index.html` |

## 새 게임 추가

1. `games/<영문-소문자-id>/` 폴더를 만듭니다.
2. 그 안에 `index.html`, `game.js`, `style.css`를 작성합니다.
3. `index.html`에서 `../../common/style.css`와 `../../common/common.js`를 불러옵니다.
4. 화면 왼쪽 위에는 `CardGames.mountMenuButton()`으로 **← 메뉴로** 버튼을 둡니다.
5. `style.css`의 선택자는 `.game-<id>` 아래로만 작성합니다.
6. 다른 게임 폴더의 파일은 참조하지 않습니다. 공유 코드는 `common/`만 사용합니다.
7. `games.json` 배열 맨 끝에 항목을 추가합니다. 기존 항목은 수정하거나 삭제하지 않습니다.
8. 이 README의 게임 목록 표를 갱신합니다.
9. 커밋 메시지는 `feat(game): <게임 제목> 추가` 형식으로 작성합니다.

`games.json` 예시:

```json
{
  "id": "game-id",
  "title": "게임 제목",
  "description": "게임 설명",
  "path": "games/game-id/index.html",
  "subject": "과목",
  "players": "1~4명",
  "addedAt": "YYYY-MM-DD"
}
```

메인 메뉴는 `games.json`만 읽어서 카드를 만듭니다. 목록에 항목을 추가하면 메뉴에 자동으로 나타납니다. 썸네일 이미지는 쓰지 않고, 제목 첫 글자로 색상 블록을 만듭니다.

## 공통 도구

`common/common.js`의 `CardGames`:

- `shuffle(array)` — 배열을 복사한 뒤 섞어서 반환
- `createTimer(element)` — `시작`, `정지`, `초기화`가 있는 경과 시간
- `createScoreboard(element, players)` — 점수판. `players`는 인원 수 또는 이름 배열
- `mountMenuButton(target)` — **← 메뉴로** 버튼

## 기술 제한

- npm, 번들러, 프레임워크, 외부 라이브러리를 사용하지 않습니다.
- 순수 HTML, CSS, JavaScript만 사용합니다.
