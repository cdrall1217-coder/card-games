(function () {
  "use strict";

  var TOTAL = 21;
  var FAIL_HOLD_MS = 2000;
  var SUCCESS_HOLD_MS = 1000;
  var WORDS = ["그리고", "그래서", "그러나"];
  var SENTENCES = [
    { id: 1, before: "윤석이는 어머니를 도와드리려고 설거지를 했다.", after: "방 청소도 했다.", answer: "그리고" },
    { id: 2, before: "수아는 도서관에서 동화책을 빌렸다.", after: "과학책도 한 권 빌렸다.", answer: "그리고" },
    { id: 3, before: "할머니는 텃밭에 상추를 심으셨다.", after: "토마토도 심으셨다.", answer: "그리고" },
    { id: 4, before: "우리는 운동장에서 달리기를 했다.", after: "줄넘기도 했다.", answer: "그리고" },
    { id: 5, before: "지호는 생일 카드를 만들었다.", after: "선물도 예쁘게 포장했다.", answer: "그리고" },
    { id: 6, before: "민지는 색종이로 종이학을 접었다.", after: "종이배도 접었다.", answer: "그리고" },
    { id: 7, before: "아빠는 식탁에 밥을 놓으셨다.", after: "반찬도 꺼내 놓으셨다.", answer: "그리고" },
    { id: 8, before: "나는 오늘 아침에 늦잠을 잤다.", after: "나는 지각했다.", answer: "그래서" },
    { id: 9, before: "가을이 되어서 날씨가 쌀쌀해졌다.", after: "지윤이는 두꺼운 외투를 입었다.", answer: "그래서" },
    { id: 10, before: "오늘은 할아버지 생신이다.", after: "우리 가족은 생신 축하 떡을 나누어 먹었다.", answer: "그래서" },
    { id: 11, before: "밤새 눈이 많이 내렸다.", after: "운동장이 하얗게 덮였다.", answer: "그래서" },
    { id: 12, before: "나는 준비물을 집에 두고 왔다.", after: "친구에게 빌려서 사용했다.", answer: "그래서" },
    { id: 13, before: "지우는 매일 줄넘기를 연습했다.", after: "이제 백 번도 넘을 수 있다.", answer: "그래서" },
    { id: 14, before: "바람이 아주 세게 불었다.", after: "내 모자가 멀리 날아갔다.", answer: "그래서" },
    { id: 15, before: "친구들은 모두 우산을 쓰고 있었다.", after: "형선이는 우산이 없었다.", answer: "그러나" },
    { id: 16, before: "준영이는 공원에서 잃어버린 모자를 쉽게 찾을 수 있다고 생각했다.", after: "아무리 찾아도 모자는 보이지 않았다.", answer: "그러나" },
    { id: 17, before: "창밖에는 따뜻한 햇살이 비쳤다.", after: "바람은 무척 차가웠다.", answer: "그러나" },
    { id: 18, before: "연우는 문을 힘껏 밀었다.", after: "문은 열리지 않았다.", answer: "그러나" },
    { id: 19, before: "문제가 쉬워 보였다.", after: "막상 풀어 보니 어려웠다.", answer: "그러나" },
    { id: 20, before: "나는 수박을 좋아한다.", after: "동생은 수박을 싫어한다.", answer: "그러나" },
    { id: 21, before: "어제 일기 예보에서는 오늘 날씨가 맑겠다고 했다.", after: "오늘은 갑자기 비가 쏟아졌다.", answer: "그러나" }
  ];

  var appEl;
  var scoreEl;
  var attemptEl;
  var sentenceGrid;
  var wordGrid;
  var placeholderEl;
  var sentenceBoxEl;
  var beforeEl;
  var blankEl;
  var afterEl;
  var choiceButtons;
  var feedbackEl;
  var completeEl;
  var completeScoreEl;
  var completeAttemptsEl;
  var replayBtn;

  var state;
  var judgeToken = 0;
  var judgeTimer = 0;

  function wordPool() {
    var pool = [];
    var w;
    var n;
    for (w = 0; w < WORDS.length; w += 1) {
      for (n = 0; n < 7; n += 1) pool.push(WORDS[w]);
    }
    return pool;
  }

  function createState() {
    var sentences = CardGames.shuffle(SENTENCES).map(function (card, index) {
      return {
        key: "sentence-" + (index + 1),
        number: index + 1,
        card: card,
        removed: false
      };
    });
    var words = CardGames.shuffle(wordPool()).map(function (word, index) {
      return {
        key: "word-" + (index + 1),
        number: index + 1,
        word: word,
        removed: false
      };
    });

    return {
      phase: "ready",
      sentences: sentences,
      words: words,
      sentenceIndex: null,
      wordIndex: null,
      answer: null,
      score: 0,
      attempts: 0,
      result: null,
      hint: ""
    };
  }

  function clearJudgeTimer() {
    judgeToken += 1;
    if (judgeTimer) {
      window.clearTimeout(judgeTimer);
      judgeTimer = 0;
    }
  }

  function face(labelText, numberText, wordFace) {
    var inner = document.createElement("span");
    inner.className = "flip-inner";

    var down = document.createElement("span");
    down.className = "face face-down";
    var num = document.createElement("span");
    num.className = "num";
    num.textContent = numberText;
    down.appendChild(num);

    var up = document.createElement("span");
    up.className = "face face-up";
    var label = document.createElement("span");
    label.className = wordFace ? "up-word" : "up-kicker";
    label.textContent = wordFace ? "" : labelText;
    up.appendChild(label);

    inner.appendChild(down);
    inner.appendChild(up);
    return { inner: inner, label: label };
  }

  function buildGrid(container, slots, side) {
    container.replaceChildren();
    slots.forEach(function (slot, index) {
      var cell = document.createElement("div");
      cell.className = "slot";
      cell.dataset.key = slot.key;

      var button = document.createElement("button");
      button.type = "button";
      button.className = "flip-card";
      button.dataset.index = String(index);

      var parts = face(side === "sentence" ? "열림" : "", String(slot.number), side === "word");
      button.appendChild(parts.inner);
      cell.appendChild(button);
      container.appendChild(cell);
      slot.button = button;
      slot.cell = cell;
      slot.label = parts.label;
    });
  }

  function statusMessage() {
    if (state.hint) return { type: "hint", text: state.hint };
    if (state.result === "success") return { type: "success", text: "맞았어요!" };
    if (state.result === "fail") return { type: "fail", text: "다시 생각해 봐요!" };
    if (state.phase === "sentenceOpen") return { type: "guide", text: "그리고, 그래서, 그러나 중에서 골라요." };
    if (state.phase === "answerSelected") return { type: "guide", text: "오른쪽에서 이어 주는 말 카드를 뒤집어요." };
    if (state.phase === "completed") return { type: "success", text: "모든 문장을 맞혔어요!" };
    return { type: "guide", text: "왼쪽에서 문장 카드 한 장을 뒤집어요." };
  }

  function renderCard(slot, open, side) {
    var gone = slot.removed;
    slot.cell.classList.toggle("is-gone", gone);
    slot.cell.classList.toggle("is-open", open && !gone);
    slot.cell.classList.toggle("is-success", open && state.result === "success");
    slot.cell.classList.toggle("is-fail", open && state.result === "fail");
    slot.button.classList.toggle("is-open", open && !gone);
    slot.button.disabled = gone || state.phase === "judging" || state.phase === "completed";
    slot.button.tabIndex = gone ? -1 : 0;
    slot.cell.setAttribute("aria-hidden", gone ? "true" : "false");

    if (side === "word") {
      slot.label.textContent = open && !gone ? slot.word : "";
      slot.button.setAttribute(
        "aria-label",
        open && !gone ? slot.word + " 카드 " + slot.number : "이어 주는 말 카드 " + slot.number
      );
    } else {
      slot.button.setAttribute("aria-label", "문장 카드 " + slot.number);
    }
    slot.button.setAttribute("aria-pressed", open && !gone ? "true" : "false");
  }

  function render() {
    var sentence = state.sentenceIndex === null ? null : state.sentences[state.sentenceIndex];
    var status = statusMessage();
    var canAnswer = state.phase === "sentenceOpen" || state.phase === "answerSelected";

    appEl.dataset.phase = state.phase;
    scoreEl.textContent = state.score + "/21";
    attemptEl.textContent = String(state.attempts);

    state.sentences.forEach(function (slot, index) {
      renderCard(slot, state.sentenceIndex === index, "sentence");
    });
    state.words.forEach(function (slot, index) {
      renderCard(slot, state.wordIndex === index, "word");
    });

    if (!sentence || sentence.removed) {
      placeholderEl.hidden = false;
      sentenceBoxEl.hidden = true;
      beforeEl.textContent = "";
      afterEl.textContent = "";
      blankEl.textContent = "(       )";
      blankEl.classList.remove("is-picked");
    } else {
      placeholderEl.hidden = true;
      sentenceBoxEl.hidden = false;
      beforeEl.textContent = sentence.card.before;
      afterEl.textContent = sentence.card.after;
      if (state.answer) {
        blankEl.textContent = "( " + state.answer + " )";
        blankEl.classList.add("is-picked");
      } else {
        blankEl.textContent = "(       )";
        blankEl.classList.remove("is-picked");
      }
    }

    choiceButtons.forEach(function (button) {
      var selected = button.dataset.answer === state.answer;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      button.disabled = !canAnswer;
    });

    feedbackEl.className = "feedback is-" + status.type;
    feedbackEl.textContent = status.text;

    completeScoreEl.textContent = state.score + "/21개 성공";
    completeAttemptsEl.textContent = String(state.attempts);
    completeEl.hidden = state.phase !== "completed";
    if (state.phase === "completed") replayBtn.focus();
  }

  function openSentence(index) {
    if (state.phase === "judging" || state.phase === "completed") return;
    var slot = state.sentences[index];
    if (!slot || slot.removed) return;
    if (state.sentenceIndex === index) return;

    state.sentenceIndex = index;
    state.answer = null;
    state.wordIndex = null;
    state.result = null;
    state.hint = "";
    state.phase = "sentenceOpen";
    render();
  }

  function pickAnswer(answer) {
    if (state.phase !== "sentenceOpen" && state.phase !== "answerSelected") return;
    if (WORDS.indexOf(answer) === -1) return;

    state.answer = answer;
    state.hint = "";
    state.result = null;
    state.phase = "answerSelected";
    render();
  }

  function pickWord(index) {
    if (state.phase === "judging" || state.phase === "completed") return;
    var slot = state.words[index];
    if (!slot || slot.removed) return;

    if (state.phase === "ready") {
      state.hint = "왼쪽 문장 카드를 먼저 뒤집어요.";
      render();
      return;
    }
    if (state.phase !== "answerSelected") {
      state.hint = "이어 주는 말을 먼저 골라 주세요.";
      render();
      return;
    }
    if (judgeTimer) return;

    var sentenceIndex = state.sentenceIndex;
    var sentence = state.sentences[sentenceIndex].card;
    var pickedWord = slot.word;
    var success = state.answer === sentence.answer && pickedWord === sentence.answer;
    var token;

    state.phase = "judging";
    state.wordIndex = index;
    state.attempts += 1;
    state.hint = "";
    state.result = success ? "success" : "fail";
    if (success) state.score += 1;
    token = ++judgeToken;
    render();

    judgeTimer = window.setTimeout(function () {
      if (token !== judgeToken) return;
      judgeTimer = 0;
      if (success) {
        state.sentences[sentenceIndex].removed = true;
        state.words[index].removed = true;
        state.sentenceIndex = null;
        state.wordIndex = null;
        state.answer = null;
        state.result = null;
        state.phase = state.score >= TOTAL ? "completed" : "ready";
      } else {
        state.sentenceIndex = null;
        state.wordIndex = null;
        state.answer = null;
        state.result = null;
        state.phase = "ready";
      }
      render();
    }, success ? SUCCESS_HOLD_MS : FAIL_HOLD_MS);
  }

  function onGridClick(event, handler) {
    var button = event.target.closest(".flip-card");
    if (!button) return;
    handler(Number(button.dataset.index));
  }

  function newGame() {
    clearJudgeTimer();
    state = createState();
    buildGrid(sentenceGrid, state.sentences, "sentence");
    buildGrid(wordGrid, state.words, "word");
    render();
  }

  function boot() {
    appEl = document.getElementById("app");
    scoreEl = document.getElementById("score-label");
    attemptEl = document.getElementById("attempt-label");
    sentenceGrid = document.getElementById("sentence-grid");
    wordGrid = document.getElementById("word-grid");
    placeholderEl = document.getElementById("placeholder");
    sentenceBoxEl = document.getElementById("sentence-box");
    beforeEl = document.getElementById("line-before");
    blankEl = document.getElementById("blank");
    afterEl = document.getElementById("line-after");
    choiceButtons = Array.prototype.slice.call(document.querySelectorAll(".choice"));
    feedbackEl = document.getElementById("feedback");
    completeEl = document.getElementById("complete");
    completeScoreEl = document.getElementById("complete-score");
    completeAttemptsEl = document.getElementById("complete-attempts");
    replayBtn = document.getElementById("replay");

    CardGames.mountMenuButton();

    sentenceGrid.addEventListener("click", function (event) {
      onGridClick(event, openSentence);
    });
    wordGrid.addEventListener("click", function (event) {
      onGridClick(event, pickWord);
    });
    choiceButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        pickAnswer(button.dataset.answer);
      });
    });
    document.getElementById("new-game").addEventListener("click", newGame);
    replayBtn.addEventListener("click", newGame);
    window.addEventListener("pagehide", clearJudgeTimer);

    newGame();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
