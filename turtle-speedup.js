let WITH_ANIMATE = true;
{
  // Fast mode used to drain the entire BlocklyApps.log in one synchronous
  // forEach.  Large drawings then monopolised the main thread, so even the
  // browser's own pause/cancel UI could not respond.  Run for a short time
  // slice, yield with setTimeout(0), and let the same button pause/resume.
  const FAST_SLICE_MS = 10;
  const FAST_SLICE_COMMANDS = 2500;
  const FAST_DISPLAY_INTERVAL_MS = 50;
  const FAST_LOOP_TICKS = 1000000;
  const ANIMATED_LOOP_TICKS = 1000000;
  const SOUND_LOOP_TICKS = 500;
  let fastRun = null;
  let speedupButton = null;

  const now = () => (window.performance && typeof performance.now === 'function')
    ? performance.now()
    : Date.now();

  function setSpeedupButton(text, title, disabled = false) {
    if (!speedupButton) return;
    speedupButton.textContent = text;
    speedupButton.title = title || '';
    speedupButton.disabled = disabled;
  }

  function finishFastRun() {
    fastRun = null;
    Turtle.pid = 0;
    setSpeedupButton('加速', '分批快速執行；執行中可暫停');
    const spinner = document.getElementById('spinner');
    if (spinner) spinner.style.visibility = 'hidden';
    if (Turtle.level.noCheck() && !Turtle.isScratchBlank()) {
      BlocklyApps.setSaveCode();
      const saveButton = document.getElementById('saveButton');
      if (saveButton) saveButton.style.display = 'inline';
    } else {
      // 原本在 Turtle.runButtonClick，改成畫完後才顯示。
      const resetButton = document.getElementById('resetButton');
      if (resetButton) {
        resetButton.style.display = 'inline';
        resetButton.disabled = true;
        setTimeout(function () { resetButton.disabled = false; }, BlocklyApps.DOUBLE_CLICK_TIME);
      }
      if (typeof Turtle.checkAnswer === 'function') Turtle.checkAnswer();
    }
  }

  function failFastRun(error) {
    console.error('[Egame Tools] 分批加速執行失敗', error);
    fastRun = null;
    Turtle.pid = 0;
    setSpeedupButton('加速', '分批快速執行；執行中可暫停');
    const spinner = document.getElementById('spinner');
    if (spinner) spinner.style.visibility = 'hidden';
    const resetButton = document.getElementById('resetButton');
    if (resetButton) resetButton.style.display = 'inline';
    alert('加速執行失敗：\n' + (error && error.message ? error.message : String(error)));
  }

  function runFastSlice(run) {
    if (fastRun !== run || run.paused) return;
    Turtle.pid = 0;
    const started = now();
    let count = 0;

    try {
      while (run.index < run.log.length &&
             count < FAST_SLICE_COMMANDS &&
             now() - started < FAST_SLICE_MS) {
        const tuple = run.log[run.index++];
        Turtle.step(tuple[0], tuple.slice(1));
        count++;
      }

      const current = now();
      if (run.index >= run.log.length || current - run.lastDisplay >= FAST_DISPLAY_INTERVAL_MS) {
        Turtle.display();
        run.lastDisplay = current;
      }

      if (run.index >= run.log.length) {
        finishFastRun();
        return;
      }

      const percent = Math.floor(run.index * 100 / run.log.length);
      setSpeedupButton('暫停', `已執行 ${run.index.toLocaleString()} / ${run.log.length.toLocaleString()}（${percent}%）`);
      Turtle.pid = window.setTimeout(() => runFastSlice(run), 0);
    } catch (error) {
      failFastRun(error);
    }
  }

  // Abandon previously scheduled fast drawing when the user starts over.
  function cancelFastRun() {
    const run = fastRun;
    if (!run) return;
    run.paused = true;
    fastRun = null;
    if (Turtle.pid) window.clearTimeout(Turtle.pid);
    Turtle.pid = 0;
    setSpeedupButton('加速', '分批快速執行；執行中可暫停');
  }

  function startFastRun() {
    const run = {
      log: BlocklyApps.log,
      index: 0,
      paused: false,
      lastDisplay: now()
    };
    fastRun = run;
    setSpeedupButton('暫停', `準備執行 ${run.log.length.toLocaleString()} 個動作`);
    Turtle.pid = window.setTimeout(() => runFastSlice(run), 0);
  }

  function toggleFastPause() {
    const run = fastRun;
    if (!run) return;
    if (run.paused) {
      run.paused = false;
      setSpeedupButton('暫停', `繼續執行 ${run.index.toLocaleString()} / ${run.log.length.toLocaleString()}`);
      Turtle.pid = window.setTimeout(() => runFastSlice(run), 0);
    } else {
      run.paused = true;
      if (Turtle.pid) window.clearTimeout(Turtle.pid);
      Turtle.pid = 0;
      Turtle.display();
      setSpeedupButton('繼續', `已暫停於 ${run.index.toLocaleString()} / ${run.log.length.toLocaleString()}`);
    }
  }

  function closeGeneratedSound() {
    try {
      if (Turtle.egameSoundContext && Turtle.egameSoundContext.state !== 'closed') {
        Turtle.egameSoundContext.close();
      }
      Turtle.egameSoundContext = null;
      Turtle.egameSoundGeneration = (Turtle.egameSoundGeneration || 0) + 1;
    } catch (_) {}
  }

  function workspaceCodeWithLoopGuard() {
    const generator = Blockly.JavaScript;
    const oldTrap = generator.INFINITE_LOOP_TRAP;
    // Blockly's loop generators replace %1 with the originating block id.
    // Older E-game builds expose checkTimeout(); retain a self-contained
    // fallback for builds where that helper is missing.
    generator.INFINITE_LOOP_TRAP = typeof BlocklyApps.checkTimeout === 'function'
      ? 'BlocklyApps.checkTimeout(%1);\n'
      : 'if (--BlocklyApps.ticks <= 0) throw Infinity;\n';
    try {
      return generator.workspaceToCode(Turtle.workspace);
    } finally {
      generator.INFINITE_LOOP_TRAP = oldTrap;
    }
  }

  const interval = setInterval(() => {
    if (!window.Turtle || !Turtle.animate || !Turtle.execute) {
      return;
    }
    clearInterval(interval);

    Turtle.execute = function () {
      BlocklyApps.log = [];
      Turtle.code = workspaceCodeWithLoopGuard();
      const usesGeneratedSound = /\begameSound(?:Note|Rest|SetBackground|StopAtPosition|Ensure|Sync)\s*\(/.test(Turtle.code);
      BlocklyApps.ticks = usesGeneratedSound
        ? SOUND_LOOP_TICKS
        : (WITH_ANIMATE ? ANIMATED_LOOP_TICKS : FAST_LOOP_TICKS);

      try {
        eval(Turtle.code);
      } catch (e) {
        // Null is thrown for infinite loop.
        // Otherwise, abnormal termination is a user error.
        if (e !== Infinity) {
          alert(e);
        }
        if (e === Infinity && usesGeneratedSound) closeGeneratedSound();
        // When there is an Infinity error, it cannot be executed without animation.
        if (e === Infinity && !WITH_ANIMATE) {
          const result = window.confirm(`程式陷入無限循環，確定要執行？\n（執行 ${BlocklyApps.log.length} 個積木）`);
          if (!result) {
            BlocklyApps.log = [];
            WITH_ANIMATE = true;
            setSpeedupButton('加速', '分批快速執行；執行中可暫停');
          }
        }
      }

      // BlocklyApps.log now contains a transcript of all the user's actions.
      // Reset the graphic and animate the transcript.
      Turtle.reset();
      Turtle.pid = window.setTimeout(Turtle.animate, 100);
    };
    const withAnimate = Turtle.animate;
    const withoutAnimate = function () {
      Turtle.pid = 0;
      startFastRun();
    };
    Turtle.animate = function () {
      if (WITH_ANIMATE) {
        cancelFastRun();
        withAnimate();
      } else {
        withoutAnimate();
      }
    }
  }, 200);

  const observer = new MutationObserver(function (mutationList, observer) {
    const runButton = document.querySelector("#runButton");
    if (!runButton) {
      return;
    }
    observer.disconnect();
    const parent = runButton.parentElement;
    speedupButton = runButton.cloneNode(false);
    speedupButton.id = 'speedupButton';
    speedupButton.textContent = '加速';
    speedupButton.style.width = '72px';
    speedupButton.style.paddingLeft = '25px';
    speedupButton.style.whiteSpace = 'nowrap';

    speedupButton.title = '分批快速執行；執行中可暫停';
    speedupButton.addEventListener('click', () => {
      if (fastRun) {
        toggleFastPause();
        return;
      }
      WITH_ANIMATE = false;
      setSpeedupButton('準備中', '正在產生執行指令…', true);
      Turtle.runButtonClick();
    });
    // Capture phase makes sure normal Run selects animation before the page's
    // own click handler calls Turtle.runButtonClick().
    runButton.addEventListener('click', () => {
      cancelFastRun();
      WITH_ANIMATE = true;
    }, true);

    // Reset is a separate native E-game control. Cancel any pending fast batches
    // before E-game clears its canvas.
    const resetButton = document.querySelector('#resetButton');
    if (resetButton) resetButton.addEventListener('click', () => {
      cancelFastRun();
      WITH_ANIMATE = true;
    }, true);
    parent.insertBefore(speedupButton, runButton);
  });
  observer.observe(document.documentElement, { attributes: false, childList: true, subtree: true });
}
