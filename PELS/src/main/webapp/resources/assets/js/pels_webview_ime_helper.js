/**
 * PELS WebView IME Helper
 *
 * - Android WebView에서 input 관련 키패드 생성 관련,
 *   각 html input 태그에 속성값 선언 반드시 필요 기존에는 해당 부분이 없었음.
 *
 * 주의:
 * - 이 파일 사용은 필요한 JSP 에서 PelsImeHelper.bind(...)로만 활성화.
 */
(function (global) {
  'use strict';

  var DEFAULT_LOG_PREFIX = '[PelsImeHelper]';

  function now() {
    return new Date().toISOString();
  }

  function safeLog(enabled, prefix) {
    if (!enabled) return function () {};
    var p = prefix || DEFAULT_LOG_PREFIX;
    return function () {
      try {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(p);
        // eslint-disable-next-line no-console
        console.log.apply(console, args);
      } catch (e) {}
    };
  }

  function safeWarn(enabled, prefix) {
    if (!enabled) return function () {};
    var p = prefix || DEFAULT_LOG_PREFIX;
    return function () {
      try {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(p);
        // eslint-disable-next-line no-console
        console.warn.apply(console, args);
      } catch (e) {}
    };
  }

  function safeError(enabled, prefix) {
    if (!enabled) return function () {};
    var p = prefix || DEFAULT_LOG_PREFIX;
    return function () {
      try {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(p);
        // eslint-disable-next-line no-console
        console.error.apply(console, args);
      } catch (e) {}
    };
  }

  function isEnterKey(e) {
    return (
      !!e &&
      (e.key === 'Enter' || e.keyCode === 13 || e.which === 13 || e.code === 'Enter')
    );
  }

  function getActiveElementInfo() {
    try {
      var ae = document.activeElement;
      if (!ae) return null;
      return { id: ae.id, name: ae.name, tagName: ae.tagName, type: ae.type };
    } catch (e) {
      return null;
    }
  }

  function safeBlur(el) {
    if (!el) return;
    try {
      if (typeof el.blur === 'function') el.blur();
    } catch (e) {}
  }

  function safeFocus(el) {
    if (!el) return;
    try {
      if (typeof el.focus === 'function') el.focus();
    } catch (e) {}
  }

  function safeClick(el) {
    if (!el) return;
    try {
      if (typeof el.click === 'function') el.click();
    } catch (e) {}
  }

  function safeScrollIntoView(el) {
    if (!el) return;
    try {
      if (typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ block: 'center', inline: 'nearest' });
      }
    } catch (e) {}
  }

  /**
   * WebView 에서 키패드 이벤트 관련한 사항 정의 (focus/click/scrollIntoView 재시도).
   */
  function requestSoftKeyboardOnAndroid(opts) {
    opts = opts || {};
    var el = opts.el;
    var reason = opts.reason || '';
    var logEnabled = !!opts.log;
    var logPrefix = opts.logPrefix || DEFAULT_LOG_PREFIX;
    var log = safeLog(logEnabled, logPrefix);

    if (!el) return;

    var isPopup = !!(global.opener || global.name);

    log('requestSoftKeyboardOnAndroid', { reason: reason, id: el.id, isPopup: isPopup, ts: now() });

    try { el.removeAttribute('readonly'); } catch (e) {}
    try { el.removeAttribute('disabled'); } catch (e) {}

    safeFocus(el);
    safeClick(el);
    setTimeout(function () {
      safeFocus(el);
      safeScrollIntoView(el);
    }, 50);
  }

  /**
   * 지정한 input id 리스트에 대해:
   * - focus/click/touchstart 시 requestSoftKeyboardOnAndroid 실행(옵션)
   * - Enter(IME 완료) 시 blur + 다음 input focus 흐름(옵션)
   */
  function bind(opts) {
    opts = opts || {};
    var ids = Array.isArray(opts.ids) ? opts.ids : [];
    var logEnabled = !!opts.log;
    var logPrefix = opts.logPrefix || DEFAULT_LOG_PREFIX;
    var enableKeyboardRequest = opts.enableKeyboardRequest !== false; // default true
    var enableEnterFlow = opts.enableEnterFlow !== false; // default true
    var enterFlowDelayMs = typeof opts.enterFlowDelayMs === 'number' ? opts.enterFlowDelayMs : 0;
    var preventEnterSubmit = opts.preventEnterSubmit !== false; // default true

    var log = safeLog(logEnabled, logPrefix);
    var warn = safeWarn(logEnabled, logPrefix);
    var error = safeError(logEnabled, logPrefix);

    log('bind START', {
      ids: ids,
      enableKeyboardRequest: enableKeyboardRequest,
      enableEnterFlow: enableEnterFlow,
      activeElement: getActiveElementInfo(),
      ts: now()
    });

    ids.forEach(function (id, idx) {
      try {
        var el = document.getElementById(id);
        if (!el) {
          warn('element NOT FOUND', { id: id, idx: idx });
          return;
        }

        if (el.dataset && el.dataset.pelsImeBound === '1') {
          log('skip already bound', { id: id });
          return;
        }
        if (el.dataset) el.dataset.pelsImeBound = '1';

        log('bind element', { id: id, idx: idx, readOnly: el.readOnly, disabled: el.disabled, tabIndex: el.tabIndex });

        if (enableKeyboardRequest) {
          el.addEventListener('focus', function () {
            requestSoftKeyboardOnAndroid({ el: el, reason: 'focus', log: logEnabled, logPrefix: logPrefix });
          });
          el.addEventListener('click', function () {
            requestSoftKeyboardOnAndroid({ el: el, reason: 'click', log: logEnabled, logPrefix: logPrefix });
          });
          el.addEventListener('touchstart', function () {
            requestSoftKeyboardOnAndroid({ el: el, reason: 'touchstart', log: logEnabled, logPrefix: logPrefix });
          }, { passive: true });
        }

        if (enableEnterFlow) {
          el.addEventListener('keydown', function (e) {
            if (!isEnterKey(e)) return;
            if (preventEnterSubmit && e && typeof e.preventDefault === 'function') e.preventDefault();

            log('ENTER keydown', { id: id, idx: idx });
            safeBlur(el);

            var nextId = ids[idx + 1];
            if (!nextId) return;

            setTimeout(function () {
              var nextEl = document.getElementById(nextId);
              if (!nextEl) {
                warn('next element NOT FOUND', { nextId: nextId, from: id });
                return;
              }
              safeFocus(nextEl);
            }, enterFlowDelayMs);
          });
        }
      } catch (e) {
        error('bind element failed', { id: id, idx: idx, error: String(e && e.message ? e.message : e) });
      }
    });

    log('bind END', { ids: ids, ts: now() });
  }

  global.PelsImeHelper = global.PelsImeHelper || {};
  global.PelsImeHelper.bind = bind;
  global.PelsImeHelper.requestSoftKeyboardOnAndroid = function (el, reason, options) {
    options = options || {};
    requestSoftKeyboardOnAndroid({
      el: el,
      reason: reason || '',
      log: !!options.log,
      logPrefix: options.logPrefix
    });
  };
})(window);
