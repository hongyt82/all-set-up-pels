/**
 * Pels Android JS Bridge (ACK / Promise 적용).
 *
 *
 *  - PelsAndroidBridge.ui.showAlertWithAck(...)
 *  - PelsAndroidBridge.input.requestWithAck(...)
 *  - PelsAndroidBridge.api.callWithAck(...)
 * 형태로 Web → Android 호출 + ACK/Promise 응답을 테스트할 수 있다.
 */

(function (global) {
  var ANDROID_BRIDGE_NAME = 'PelsAndroidBridge';
  var BRIDGE_VERSION = '1.0.0';

  // Android 가 주입한 네이티브 브리지 객체 (postMessage 제공)
  var nativeBridge = global[ANDROID_BRIDGE_NAME];

  if (!nativeBridge || typeof nativeBridge.postMessage !== 'function') {
    console.log('[PelsAndroidBridge] native bridge not available (window.PelsAndroidBridge.postMessage).');
    return;
  }

  // 내부용: 너무 짧은 시간 안에 중복 호출되는 것을 막기 위한 debounce (ms)
  var DUPLICATE_SUPPRESS_MS = 500;
  var lastSendTimeByMethod = {};

  // 내부용: 실제 postMessage 를 호출하는 저수준 함수 (외부에 노출하지 않음)
  function sendRaw(method, payloadObj) {
    var now = Date.now();
    var last = lastSendTimeByMethod[method] || 0;
    if (now - last < DUPLICATE_SUPPRESS_MS) {
      return { ok: false, reason: 'DUPLICATE_SUPPRESSED' };
    }

    try {
      var payload = payloadObj != null ? JSON.stringify(payloadObj) : null;
      nativeBridge.postMessage(method, payload);
      lastSendTimeByMethod[method] = now;
      return { ok: true };
    } catch (e) {
      console.log('[PelsAndroidBridge] sendRaw error', e);
      return { ok: false, reason: 'EXCEPTION', error: String(e && e.message ? e.message : e) };
    }
  }

  // 전역 브리지 객체 생성 또는 재사용
  var bridge = global.PelsAndroidBridge || {};
  bridge.__pelsBridgeVersion = BRIDGE_VERSION;

  // ===== ACK / Promise 구현 =====

  var pendingAcks = {};
  var REQUEST_TIMEOUT_MS = 10000;

  function generateRequestId(method) {
    var ts = Date.now();
    var rnd = Math.floor(Math.random() * 100000);
    return method + '-' + ts + '-' + rnd;
  }

  function sendWithAck(method, payloadObj) {
    var requestId = generateRequestId(method);
    var payloadWithId = Object.assign({}, payloadObj || {}, {
      requestId: requestId
    });

    var sendResult = sendRaw(method, payloadWithId);
    if (!sendResult || !sendResult.ok) {
      console.log('[PelsAndroidBridge] sendWithAck failed for', method, 'requestId=', requestId, 'result=', sendResult);
      return Promise.reject(
        Object.assign({ ok: false, method: method, requestId: requestId }, sendResult || { reason: 'SEND_FAILED' })
      );
    }

    console.log('[PelsAndroidBridge] sendWithAck', method, 'requestId=', requestId, 'payload=', payloadWithId);

    return new Promise(function (resolve, reject) {
      var key = method + ':' + requestId;
      pendingAcks[key] = {
        resolve: resolve,
        reject: reject,
        createdAt: Date.now()
      };

      setTimeout(function () {
        var entry = pendingAcks[key];
        if (!entry) return;
        delete pendingAcks[key];
        console.log('[PelsAndroidBridge] ACK TIMEOUT for', method, 'requestId=', requestId);
        reject({ ok: false, method: method, requestId: requestId, reason: 'ACK_TIMEOUT' });
      }, REQUEST_TIMEOUT_MS);
    });
  }

  // Android → Web ACK 진입점
  global.PelsNative = global.PelsNative || {};

  global.PelsNative.onBridgeAck = function (method, requestId, status, detailJson) {
    console.log('[PelsAndroidBridge] ACK from native', method, requestId, status, detailJson);

    var key = method + ':' + requestId;
    var entry = pendingAcks[key];
    if (!entry) {
      // 이미 처리됐거나 알 수 없는 요청
      return;
    }
    delete pendingAcks[key];

    var detail = null;
    if (typeof detailJson === 'string' && detailJson.length > 0 && detailJson !== 'null') {
      try {
        detail = JSON.parse(detailJson);
      } catch (e) {
        console.log('[PelsAndroidBridge] failed to parse ack detail JSON', e);
      }
    }

    if (status === 'OK') {
      entry.resolve({ ok: true, method: method, requestId: requestId, detail: detail });
    } else {
      entry.reject({ ok: false, method: method, requestId: requestId, detail: detail });
    }
  };

  // 외부에 노출되는 ACK 기반 API
  bridge.sendWithAck = sendWithAck;

  bridge.ui = bridge.ui || {};
  bridge.ui.showAlertWithAck = function (message) {
    return sendWithAck('SHOW_NATIVE_ALERT', {
      channel: 'ui',
      message: String(message != null ? message : '')
    });
  };

  bridge.input = bridge.input || {};
  bridge.input.requestWithAck = function (field, value) {
    return sendWithAck('SHOW_NATIVE_INPUT', {
      channel: 'input',
      field: String(field != null ? field : ''),
      value: String(value != null ? value : '')
    });
  };

  bridge.api = bridge.api || {};
  bridge.api.callWithAck = function (endpoint, params, method) {
    return sendWithAck('CALL_NATIVE_API', {
      channel: 'api',
      endpoint: String(endpoint != null ? endpoint : ''),
      method: String(method != null ? method : 'GET'),
      params: params || {}
    });
  };

  // 최종적으로 전역에 다시 할당
  global.PelsAndroidBridge = bridge;
})(window);

