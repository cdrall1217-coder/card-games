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
  var playerScoresEl;
  var newGameBtn;
  var setupEl;
  var sentenceGrid;
  var wordGrid;
  var turnLabelEl;
  var placeholderEl;
  var sentenceBoxEl;
  var beforeEl;
  var blankEl;
  var afterEl;
  var choiceButtons;
  var feedbackEl;
  var feedbackTextEl;
  var verdictEl;
  var verdictAEl;
  var verdictBEl;
  var completeEl;
  var completeKickerEl;
  var completeTitleEl;
  var completeRanksEl;
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

  function createPlayers(count) {
    var players = [];
    var i;
    for (i = 0; i < count; i += 1) {
      players.push({ name: (i + 1) + "번 학생", score: 0 });
    }
    return players;
  }

  function emptyMatch() {
    return {
      phase: "setup",
      sentences: [],
      words: [],
      sentenceIndex: null,
      wordIndex: null,
      answer: null,
      attempts: 0,
      result: null,
      hint: "",
      playerCount: 0,
      currentPlayerIndex: 0,
      players: [],
      selectedAnswerCorrect: null,
      flippedWordCorrect: null
    };
  }

  function createState(count) {
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
      attempts: 0,
      result: null,
      hint: "",
      playerCount: count,
      currentPlayerIndex: 0,
      players: createPlayers(count),
      selectedAnswerCorrect: null,
      flippedWordCorrect: null
    };
  }

  function totalScore() {
    var sum = 0;
    state.players.forEach(function (player) {
      sum += player.score;
    });
    return sum;
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

    var mark = null;
    if (wordFace) {
      mark = document.createElement("span");
      mark.className = "card-mark";
      mark.setAttribute("aria-hidden", "true");
      up.appendChild(mark);
    }

    inner.appendChild(down);
    inner.appendChild(up);
    return { inner: inner, label: label, mark: mark };
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
      slot.mark = parts.mark;
    });
  }

  function statusMessage() {
    if (state.hint) return { type: "hint", text: state.hint };
    if (state.phase === "sentenceOpen") return { type: "guide", text: "그리고, 그래서, 그러나 중에서 골라요." };
    if (state.phase === "answerSelected") return { type: "guide", text: "오른쪽에서 이어 주는 말 카드를 뒤집어요." };
    return { type: "guide", text: "왼쪽에서 문장 카드 한 장을 뒤집어요." };
  }

  function markSymbol(correct) {
    return correct ? "○" : "×";
  }

  function applyMark(el, correct) {
    el.textContent = markSymbol(correct);
    el.className = "mark " + (correct ? "is-correct" : "is-wrong");
  }

  function playing() {
    return state.phase !== "setup" && state.phase !== "completed";
  }

  function renderCard(slot, open, side) {
    var gone = slot.removed;
    var gradedWord = side === "word" && open && !gone && state.phase === "judging" && state.flippedWordCorrect !== null;
    slot.cell.classList.toggle("is-gone", gone);
    slot.cell.classList.toggle("is-open", open && !gone);
    slot.cell.classList.toggle("is-correct", gradedWord && state.flippedWordCorrect === true);
    slot.cell.classList.toggle("is-wrong", gradedWord && state.flippedWordCorrect === false);
    slot.button.classList.toggle("is-open", open && !gone);
    slot.button.disabled = gone || state.phase === "judging" || state.phase === "completed" || state.phase === "setup";
    slot.button.tabIndex = gone ? -1 : 0;
    slot.cell.setAttribute("aria-hidden", gone ? "true" : "false");

    if (side === "word") {
      slot.label.textContent = open && !gone ? slot.word : "";
      if (slot.mark) {
        if (gradedWord) {
          slot.mark.textContent = markSymbol(state.flippedWordCorrect);
          slot.mark.className = "card-mark " + (state.flippedWordCorrect ? "is-correct" : "is-wrong");
        } else {
          slot.mark.textContent = "";
          slot.mark.className = "card-mark";
        }
      }
      var wordLabel = open && !gone ? slot.word + " 카드 " + slot.number : "이어 주는 말 카드 " + slot.number;
      if (gradedWord) wordLabel += state.flippedWordCorrect ? ", 정답" : ", 오답";
      slot.button.setAttribute("aria-label", wordLabel);
    } else {
      slot.button.setAttribute("aria-label", "문장 카드 " + slot.number);
    }
    slot.button.setAttribute("aria-pressed", open && !gone ? "true" : "false");
  }

  function renderPlayers() {
    playerScoresEl.replaceChildren();
    if (!state.players.length || state.phase === "setup") {
      playerScoresEl.hidden = true;
      return;
    }
    playerScoresEl.hidden = false;
    state.players.forEach(function (player, index) {
      var chip = document.createElement("p");
      var current = index === state.currentPlayerIndex && state.phase !== "completed";
      chip.className = "player-chip" + (current ? " is-current" : "");
      chip.textContent = player.name + " " + player.score + "점";
      if (current) chip.setAttribute("aria-current", "true");
      playerScoresEl.appendChild(chip);
    });
  }

  function renderVerdict() {
    var judging = state.phase === "judging" && state.selectedAnswerCorrect !== null && state.flippedWordCorrect !== null;
    if (!judging) {
      verdictEl.hidden = true;
      feedbackTextEl.hidden = false;
      return;
    }
    feedbackTextEl.hidden = true;
    verdictEl.hidden = false;
    applyMark(verdictAEl, state.selectedAnswerCorrect);
    applyMark(verdictBEl, state.flippedWordCorrect);
    verdictEl.setAttribute(
      "aria-label",
      "고른 말 " + (state.selectedAnswerCorrect ? "정답" : "오답") + ", 뒤집은 카드 " + (state.flippedWordCorrect ? "정답" : "오답")
    );
  }

  function renderComplete() {
    var solo = state.playerCount <= 1;
    var maxScore = 0;
    var winnerCount = 0;
    completeEl.hidden = state.phase !== "completed";
    if (state.phase !== "completed") return;

    state.players.forEach(function (player) {
      if (player.score > maxScore) maxScore = player.score;
    });
    state.players.forEach(function (player) {
      if (player.score === maxScore) winnerCount += 1;
    });

    if (solo) {
      completeKickerEl.hidden = false;
      completeKickerEl.textContent = "참 잘했어요!";
      completeTitleEl.textContent = "모든 문장을 맞혔어요";
      completeRanksEl.hidden = true;
      completeRanksEl.replaceChildren();
      completeScoreEl.textContent = totalScore() + "/21개 성공";
    } else {
      completeKickerEl.hidden = true;
      completeTitleEl.textContent = "게임 종료!";
      completeRanksEl.hidden = false;
      completeRanksEl.replaceChildren();
      state.players.forEach(function (player) {
        var row = document.createElement("p");
        row.className = "rank-row";
        var name = document.createElement("span");
        name.textContent = player.name + ": " + player.score + "점";
        row.appendChild(name);
        if (player.score === maxScore) {
          var badge = document.createElement("span");
          badge.className = "rank-badge";
          badge.textContent = winnerCount > 1 ? "공동 1등" : "1등";
          row.appendChild(badge);
        }
        completeRanksEl.appendChild(row);
      });
      completeScoreEl.textContent = "총 21개 성공";
    }
    completeAttemptsEl.textContent = String(state.attempts);
    replayBtn.focus();
  }

  function render() {
    var sentence = state.sentenceIndex === null ? null : state.sentences[state.sentenceIndex];
    var status = statusMessage();
    var canAnswer = state.phase === "sentenceOpen" || state.phase === "answerSelected";
    var current = state.players[state.currentPlayerIndex];

    appEl.dataset.phase = state.phase;
    setupEl.hidden = state.phase !== "setup";
    scoreEl.textContent = totalScore() + "/21";
    attemptEl.textContent = String(state.attempts);
    newGameBtn.disabled = state.phase === "judging";
    renderPlayers();

    if (playing() && current) {
      turnLabelEl.hidden = false;
      turnLabelEl.textContent = current.name + " 차례";
    } else {
      turnLabelEl.hidden = true;
      turnLabelEl.textContent = "";
    }

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
      blankEl.textContent = "";
      blankEl.classList.remove("is-picked");
      blankEl.setAttribute("aria-label", "빈칸");
    } else {
      placeholderEl.hidden = true;
      sentenceBoxEl.hidden = false;
      beforeEl.textContent = sentence.card.before;
      afterEl.textContent = sentence.card.after;
      if (state.answer) {
        blankEl.textContent = state.answer;
        blankEl.classList.add("is-picked");
        blankEl.setAttribute("aria-label", state.answer);
      } else {
        blankEl.textContent = "";
        blankEl.classList.remove("is-picked");
        blankEl.setAttribute("aria-label", "빈칸");
      }
    }

    choiceButtons.forEach(function (button) {
      var selected = button.dataset.answer === state.answer;
      var mark = button.querySelector(".choice-mark");
      var graded = selected && state.phase === "judging" && state.selectedAnswerCorrect !== null;
      button.classList.toggle("is-selected", selected);
      button.classList.toggle("is-correct", graded && state.selectedAnswerCorrect === true);
      button.classList.toggle("is-wrong", graded && state.selectedAnswerCorrect === false);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      button.disabled = !canAnswer;
      if (graded) {
        mark.textContent = markSymbol(state.selectedAnswerCorrect);
        mark.className = "choice-mark " + (state.selectedAnswerCorrect ? "is-correct" : "is-wrong");
        button.setAttribute(
          "aria-label",
          button.dataset.answer + (state.selectedAnswerCorrect ? " 정답" : " 오답")
        );
      } else {
        mark.textContent = "";
        mark.className = "choice-mark";
        button.setAttribute("aria-label", button.dataset.answer);
      }
    });

    feedbackEl.className = "feedback is-" + (state.phase === "judging" ? "verdict" : status.type);
    feedbackTextEl.textContent = state.phase === "judging" ? "" : status.text;
    renderVerdict();
    renderComplete();
  }

  function openSentence(index) {
    if (state.phase === "judging" || state.phase === "completed" || state.phase === "setup") return;
    var slot = state.sentences[index];
    if (!slot || slot.removed) return;
    if (state.sentenceIndex === index) return;

    state.sentenceIndex = index;
    state.answer = null;
    state.wordIndex = null;
    state.result = null;
    state.hint = "";
    state.selectedAnswerCorrect = null;
    state.flippedWordCorrect = null;
    state.phase = "sentenceOpen";
    render();
  }

  function pickAnswer(answer) {
    if (state.phase !== "sentenceOpen" && state.phase !== "answerSelected") return;
    if (WORDS.indexOf(answer) === -1) return;

    state.answer = answer;
    state.hint = "";
    state.result = null;
    state.selectedAnswerCorrect = null;
    state.flippedWordCorrect = null;
    state.phase = "answerSelected";
    render();
  }

  function finishJudgement(token, sentenceIndex, wordIndex, both) {
    if (token !== judgeToken) return;
    judgeToken += 1;
    judgeTimer = 0;

    if (both) {
      state.sentences[sentenceIndex].removed = true;
      state.words[wordIndex].removed = true;
    }
    state.sentenceIndex = null;
    state.wordIndex = null;
    state.answer = null;
    state.result = null;
    state.hint = "";
    state.selectedAnswerCorrect = null;
    state.flippedWordCorrect = null;

    if (totalScore() >= TOTAL) {
      state.phase = "completed";
    } else {
      if (state.playerCount > 1) {
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.playerCount;
      }
      state.phase = "ready";
    }
    render();
  }

  function pickWord(index) {
    if (state.phase === "judging" || state.phase === "completed" || state.phase === "setup") return;
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
    var answerCorrect = state.answer === sentence.answer;
    var wordCorrect = slot.word === sentence.answer;
    var both = answerCorrect && wordCorrect;
    var token = ++judgeToken;

    state.phase = "judging";
    state.wordIndex = index;
    state.attempts += 1;
    state.hint = "";
    state.selectedAnswerCorrect = answerCorrect;
    state.flippedWordCorrect = wordCorrect;
    state.result = both ? "success" : "fail";
    if (both) state.players[state.currentPlayerIndex].score += 1;
    render();

    judgeTimer = window.setTimeout(function () {
      finishJudgement(token, sentenceIndex, index, both);
    }, both ? SUCCESS_HOLD_MS : FAIL_HOLD_MS);
  }

  function onGridClick(event, handler) {
    var button = event.target.closest(".flip-card");
    if (!button || button.disabled) return;
    handler(Number(button.dataset.index));
  }

  function showSetup() {
    if (state && state.phase === "judging") return;
    clearJudgeTimer();
    state = emptyMatch();
    sentenceGrid.replaceChildren();
    wordGrid.replaceChildren();
    render();
  }

  function startGame(count) {
    if (!state || state.phase !== "setup") return;
    if (count < 1 || count > 4) return;
    clearJudgeTimer();
    state = createState(count);
    buildGrid(sentenceGrid, state.sentences, "sentence");
    buildGrid(wordGrid, state.words, "word");
    render();
  }

  function boot() {
    appEl = document.getElementById("app");
    scoreEl = document.getElementById("score-label");
    attemptEl = document.getElementById("attempt-label");
    playerScoresEl = document.getElementById("player-scores");
    newGameBtn = document.getElementById("new-game");
    setupEl = document.getElementById("setup");
    sentenceGrid = document.getElementById("sentence-grid");
    wordGrid = document.getElementById("word-grid");
    turnLabelEl = document.getElementById("turn-label");
    placeholderEl = document.getElementById("placeholder");
    sentenceBoxEl = document.getElementById("sentence-box");
    beforeEl = document.getElementById("line-before");
    blankEl = document.getElementById("blank");
    afterEl = document.getElementById("line-after");
    choiceButtons = Array.prototype.slice.call(document.querySelectorAll(".choice"));
    feedbackEl = document.getElementById("feedback");
    feedbackTextEl = document.getElementById("feedback-text");
    verdictEl = document.getElementById("verdict");
    verdictAEl = document.getElementById("verdict-a");
    verdictBEl = document.getElementById("verdict-b");
    completeEl = document.getElementById("complete");
    completeKickerEl = document.getElementById("complete-kicker");
    completeTitleEl = document.getElementById("complete-title");
    completeRanksEl = document.getElementById("complete-ranks");
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
    Array.prototype.forEach.call(document.querySelectorAll(".setup-choice"), function (button) {
      button.addEventListener("click", function () {
        startGame(Number(button.dataset.count));
      });
    });
    newGameBtn.addEventListener("click", showSetup);
    replayBtn.addEventListener("click", showSetup);
    window.addEventListener("pagehide", clearJudgeTimer);

    showSetup();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
