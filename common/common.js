(function (global) {
  "use strict";

  function shuffle(list) {
    var arr = list.slice();
    for (var i = arr.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function formatTime(ms) {
    var total = Math.floor(ms / 1000);
    var minutes = String(Math.floor(total / 60)).padStart(2, "0");
    var seconds = String(total % 60).padStart(2, "0");
    return minutes + ":" + seconds;
  }

  function createTimer(element) {
    var startedAt = 0;
    var elapsed = 0;
    var timerId = 0;
    var running = false;

    function render() {
      if (!element) return;
      var ms = running ? Date.now() - startedAt : elapsed;
      element.textContent = formatTime(ms);
    }

    return {
      start: function () {
        if (running) return;
        running = true;
        startedAt = Date.now() - elapsed;
        render();
        timerId = global.setInterval(render, 250);
      },
      stop: function () {
        if (!running) return;
        elapsed = Date.now() - startedAt;
        running = false;
        global.clearInterval(timerId);
        render();
      },
      reset: function () {
        running = false;
        global.clearInterval(timerId);
        elapsed = 0;
        startedAt = 0;
        render();
      },
      getElapsed: function () {
        return running ? Date.now() - startedAt : elapsed;
      }
    };
  }

  function namesFrom(players) {
    if (typeof players === "number") {
      var count = players < 1 ? 1 : Math.floor(players);
      var generated = [];
      for (var i = 0; i < count; i += 1) generated.push((i + 1) + "번");
      return generated;
    }
    return players.slice();
  }

  function createScoreboard(element, players) {
    var names = namesFrom(players);
    var scores = {};
    names.forEach(function (name) {
      scores[name] = 0;
    });

    function render(activeName) {
      if (!element) return;
      element.replaceChildren();
      names.forEach(function (name) {
        var item = document.createElement("div");
        item.className = "score-item" + (name === activeName ? " is-active" : "");
        var label = document.createElement("span");
        label.className = "score-name";
        label.textContent = name;
        var value = document.createElement("strong");
        value.className = "score-value";
        value.textContent = String(scores[name]);
        item.append(label, value);
        element.appendChild(item);
      });
    }

    render(names[0]);

    return {
      names: names,
      add: function (name, amount) {
        scores[name] = (scores[name] || 0) + (amount == null ? 1 : amount);
        return scores[name];
      },
      get: function (name) {
        return scores[name] || 0;
      },
      render: render
    };
  }

  function mountMenuButton(target) {
    var existing = document.querySelector(".menu-back");
    if (existing) return existing;

    var parent = document.body;
    if (typeof target === "string") parent = document.querySelector(target) || document.body;
    else if (target && target.appendChild) parent = target;

    var link = document.createElement("a");
    link.className = "menu-back";
    link.href = "../../index.html";
    link.textContent = "← 메뉴로";

    if (parent.firstChild) parent.insertBefore(link, parent.firstChild);
    else parent.appendChild(link);

    document.body.classList.add("has-menu-back");
    return link;
  }

  global.CardGames = {
    shuffle: shuffle,
    createTimer: createTimer,
    createScoreboard: createScoreboard,
    mountMenuButton: mountMenuButton
  };
})(window);
