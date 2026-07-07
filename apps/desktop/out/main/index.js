"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const path = require("path");
const os = require("os");
const Bt = require("node:http");
const zs = require("node:https");
const st = require("node:zlib");
const me = require("node:stream");
const node_buffer = require("node:buffer");
const node_util = require("node:util");
const node_url = require("node:url");
const node_net = require("node:net");
const node_fs = require("node:fs");
const node_path = require("node:path");
const fs = require("fs");
const child_process = require("child_process");
const util = require("util");
const IPC = {
  settingsGet: "settings:get",
  settingsUpdate: "settings:update",
  sessionPair: "session:pair",
  sessionDisconnect: "session:disconnect",
  sessionBootstrap: "session:bootstrap",
  refineRun: "refine:run",
  tonesList: "tones:list",
  tonesCreate: "tones:create",
  tonesUpdate: "tones:update",
  tonesDelete: "tones:delete",
  providersList: "providers:list",
  historyList: "history:list",
  historyDelete: "history:delete",
  systemCapabilities: "system:capabilities",
  shortcutSetRecording: "shortcut:set-recording",
  pairConsume: "pair:consume"
};
const EVENTS = {
  stateChanged: "state:changed",
  overlayState: "overlay:state",
  historyPrepend: "history:prepend",
  pairIncoming: "pair:incoming"
};
let mainWindow = null;
let quitting = false;
const setQuitting = (value) => {
  quitting = value;
};
const getMainWindow = () => mainWindow;
const createMainWindow = () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return mainWindow;
  }
  mainWindow = new electron.BrowserWindow({
    width: 980,
    height: 720,
    minWidth: 640,
    minHeight: 480,
    show: false,
    autoHideMenuBar: true,
    icon: electron.app.isPackaged ? void 0 : path.join(__dirname, "../../resources/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js")
    }
  });
  mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.on("close", (e) => {
    if (!quitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  if (process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  return mainWindow;
};
let pending = null;
const consumePendingPair = () => {
  const value = pending;
  pending = null;
  return value;
};
const parsePairDeepLink = (raw) => {
  try {
    const url = new URL(raw);
    if (url.protocol !== "refine:" || url.hostname !== "pair") return null;
    const token = url.searchParams.get("token");
    const serverUrl = url.searchParams.get("url");
    if (!token || !serverUrl) return null;
    return {
      token,
      url: serverUrl,
      name: url.searchParams.get("name") || void 0
    };
  } catch {
    return null;
  }
};
const handleDeepLink = (raw) => {
  const parsed = parsePairDeepLink(raw);
  if (!parsed) return;
  const win = createMainWindow();
  const send = () => win.webContents.send(EVENTS.pairIncoming, parsed);
  if (win.webContents.isLoading()) {
    pending = parsed;
    win.webContents.once("did-finish-load", send);
  } else {
    send();
  }
};
const findDeepLink = (argv) => argv.find((arg) => arg.startsWith("refine://"));
const registerProtocolClient = () => {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      electron.app.setAsDefaultProtocolClient("refine", process.execPath, [
        path.resolve(process.argv[1])
      ]);
    }
  } else {
    electron.app.setAsDefaultProtocolClient("refine");
  }
};
var t = Object.defineProperty;
var o$1 = (e, l) => t(e, "name", { value: l, configurable: true });
var n$2 = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function f(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
o$1(f, "getDefaultExportFromCjs");
var Os = Object.defineProperty;
var fi = (i) => {
  throw TypeError(i);
};
var n$1 = (i, o2) => Os(i, "name", { value: o2, configurable: true });
var ci = (i, o2, a) => o2.has(i) || fi("Cannot " + a);
var O = (i, o2, a) => (ci(i, o2, "read from private field"), a ? a.call(i) : o2.get(i)), be = (i, o2, a) => o2.has(i) ? fi("Cannot add the same private member more than once") : o2 instanceof WeakSet ? o2.add(i) : o2.set(i, a), X = (i, o2, a, f2) => (ci(i, o2, "write to private field"), o2.set(i, a), a);
var ve, zt, bt, Cr, ze, It, Ft, mt, ee, yt, He, Ve, gt;
function Us(i) {
  if (!/^data:/i.test(i)) throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  i = i.replace(/\r?\n/g, "");
  const o2 = i.indexOf(",");
  if (o2 === -1 || o2 <= 4) throw new TypeError("malformed data: URI");
  const a = i.substring(5, o2).split(";");
  let f2 = "", l = false;
  const p = a[0] || "text/plain";
  let h = p;
  for (let A = 1; A < a.length; A++) a[A] === "base64" ? l = true : a[A] && (h += `;${a[A]}`, a[A].indexOf("charset=") === 0 && (f2 = a[A].substring(8)));
  !a[0] && !f2.length && (h += ";charset=US-ASCII", f2 = "US-ASCII");
  const S = l ? "base64" : "ascii", v = unescape(i.substring(o2 + 1)), w = Buffer.from(v, S);
  return w.type = p, w.typeFull = h, w.charset = f2, w;
}
n$1(Us, "dataUriToBuffer");
var pi = {}, kt = { exports: {} };
var xs = kt.exports, bi;
function Ns() {
  return bi || (bi = 1, (function(i, o2) {
    (function(a, f2) {
      f2(o2);
    })(xs, function(a) {
      function f2() {
      }
      n$1(f2, "noop");
      function l(e) {
        return typeof e == "object" && e !== null || typeof e == "function";
      }
      n$1(l, "typeIsObject");
      const p = f2;
      function h(e, t2) {
        try {
          Object.defineProperty(e, "name", { value: t2, configurable: true });
        } catch {
        }
      }
      n$1(h, "setFunctionName");
      const S = Promise, v = Promise.prototype.then, w = Promise.reject.bind(S);
      function A(e) {
        return new S(e);
      }
      n$1(A, "newPromise");
      function T2(e) {
        return A((t2) => t2(e));
      }
      n$1(T2, "promiseResolvedWith");
      function b(e) {
        return w(e);
      }
      n$1(b, "promiseRejectedWith");
      function q(e, t2, r2) {
        return v.call(e, t2, r2);
      }
      n$1(q, "PerformPromiseThen");
      function g(e, t2, r2) {
        q(q(e, t2, r2), void 0, p);
      }
      n$1(g, "uponPromise");
      function V(e, t2) {
        g(e, t2);
      }
      n$1(V, "uponFulfillment");
      function I(e, t2) {
        g(e, void 0, t2);
      }
      n$1(I, "uponRejection");
      function F(e, t2, r2) {
        return q(e, t2, r2);
      }
      n$1(F, "transformPromiseWith");
      function Q(e) {
        q(e, void 0, p);
      }
      n$1(Q, "setPromiseIsHandledToTrue");
      let ge = n$1((e) => {
        if (typeof queueMicrotask == "function") ge = queueMicrotask;
        else {
          const t2 = T2(void 0);
          ge = n$1((r2) => q(t2, r2), "_queueMicrotask");
        }
        return ge(e);
      }, "_queueMicrotask");
      function z(e, t2, r2) {
        if (typeof e != "function") throw new TypeError("Argument is not a function");
        return Function.prototype.apply.call(e, t2, r2);
      }
      n$1(z, "reflectCall");
      function j(e, t2, r2) {
        try {
          return T2(z(e, t2, r2));
        } catch (s) {
          return b(s);
        }
      }
      n$1(j, "promiseCall");
      const U = 16384, bn = class bn {
        constructor() {
          this._cursor = 0, this._size = 0, this._front = { _elements: [], _next: void 0 }, this._back = this._front, this._cursor = 0, this._size = 0;
        }
        get length() {
          return this._size;
        }
        push(t2) {
          const r2 = this._back;
          let s = r2;
          r2._elements.length === U - 1 && (s = { _elements: [], _next: void 0 }), r2._elements.push(t2), s !== r2 && (this._back = s, r2._next = s), ++this._size;
        }
        shift() {
          const t2 = this._front;
          let r2 = t2;
          const s = this._cursor;
          let u = s + 1;
          const c = t2._elements, d = c[s];
          return u === U && (r2 = t2._next, u = 0), --this._size, this._cursor = u, t2 !== r2 && (this._front = r2), c[s] = void 0, d;
        }
        forEach(t2) {
          let r2 = this._cursor, s = this._front, u = s._elements;
          for (; (r2 !== u.length || s._next !== void 0) && !(r2 === u.length && (s = s._next, u = s._elements, r2 = 0, u.length === 0)); ) t2(u[r2]), ++r2;
        }
        peek() {
          const t2 = this._front, r2 = this._cursor;
          return t2._elements[r2];
        }
      };
      n$1(bn, "SimpleQueue");
      let D = bn;
      const jt = /* @__PURE__ */ Symbol("[[AbortSteps]]"), Qn = /* @__PURE__ */ Symbol("[[ErrorSteps]]"), Ar = /* @__PURE__ */ Symbol("[[CancelSteps]]"), Br = /* @__PURE__ */ Symbol("[[PullSteps]]"), kr = /* @__PURE__ */ Symbol("[[ReleaseSteps]]");
      function Yn(e, t2) {
        e._ownerReadableStream = t2, t2._reader = e, t2._state === "readable" ? qr(e) : t2._state === "closed" ? xi(e) : Gn(e, t2._storedError);
      }
      n$1(Yn, "ReadableStreamReaderGenericInitialize");
      function Wr(e, t2) {
        const r2 = e._ownerReadableStream;
        return ie(r2, t2);
      }
      n$1(Wr, "ReadableStreamReaderGenericCancel");
      function _e(e) {
        const t2 = e._ownerReadableStream;
        t2._state === "readable" ? Or(e, new TypeError("Reader was released and can no longer be used to monitor the stream's closedness")) : Ni(e, new TypeError("Reader was released and can no longer be used to monitor the stream's closedness")), t2._readableStreamController[kr](), t2._reader = void 0, e._ownerReadableStream = void 0;
      }
      n$1(_e, "ReadableStreamReaderGenericRelease");
      function Lt(e) {
        return new TypeError("Cannot " + e + " a stream using a released reader");
      }
      n$1(Lt, "readerLockException");
      function qr(e) {
        e._closedPromise = A((t2, r2) => {
          e._closedPromise_resolve = t2, e._closedPromise_reject = r2;
        });
      }
      n$1(qr, "defaultReaderClosedPromiseInitialize");
      function Gn(e, t2) {
        qr(e), Or(e, t2);
      }
      n$1(Gn, "defaultReaderClosedPromiseInitializeAsRejected");
      function xi(e) {
        qr(e), Zn(e);
      }
      n$1(xi, "defaultReaderClosedPromiseInitializeAsResolved");
      function Or(e, t2) {
        e._closedPromise_reject !== void 0 && (Q(e._closedPromise), e._closedPromise_reject(t2), e._closedPromise_resolve = void 0, e._closedPromise_reject = void 0);
      }
      n$1(Or, "defaultReaderClosedPromiseReject");
      function Ni(e, t2) {
        Gn(e, t2);
      }
      n$1(Ni, "defaultReaderClosedPromiseResetToRejected");
      function Zn(e) {
        e._closedPromise_resolve !== void 0 && (e._closedPromise_resolve(void 0), e._closedPromise_resolve = void 0, e._closedPromise_reject = void 0);
      }
      n$1(Zn, "defaultReaderClosedPromiseResolve");
      const Kn = Number.isFinite || function(e) {
        return typeof e == "number" && isFinite(e);
      }, Hi = Math.trunc || function(e) {
        return e < 0 ? Math.ceil(e) : Math.floor(e);
      };
      function Vi(e) {
        return typeof e == "object" || typeof e == "function";
      }
      n$1(Vi, "isDictionary");
      function ue(e, t2) {
        if (e !== void 0 && !Vi(e)) throw new TypeError(`${t2} is not an object.`);
      }
      n$1(ue, "assertDictionary");
      function Z(e, t2) {
        if (typeof e != "function") throw new TypeError(`${t2} is not a function.`);
      }
      n$1(Z, "assertFunction");
      function Qi(e) {
        return typeof e == "object" && e !== null || typeof e == "function";
      }
      n$1(Qi, "isObject");
      function Jn(e, t2) {
        if (!Qi(e)) throw new TypeError(`${t2} is not an object.`);
      }
      n$1(Jn, "assertObject");
      function Se(e, t2, r2) {
        if (e === void 0) throw new TypeError(`Parameter ${t2} is required in '${r2}'.`);
      }
      n$1(Se, "assertRequiredArgument");
      function zr(e, t2, r2) {
        if (e === void 0) throw new TypeError(`${t2} is required in '${r2}'.`);
      }
      n$1(zr, "assertRequiredField");
      function Ir(e) {
        return Number(e);
      }
      n$1(Ir, "convertUnrestrictedDouble");
      function Xn(e) {
        return e === 0 ? 0 : e;
      }
      n$1(Xn, "censorNegativeZero");
      function Yi(e) {
        return Xn(Hi(e));
      }
      n$1(Yi, "integerPart");
      function Fr(e, t2) {
        const s = Number.MAX_SAFE_INTEGER;
        let u = Number(e);
        if (u = Xn(u), !Kn(u)) throw new TypeError(`${t2} is not a finite number`);
        if (u = Yi(u), u < 0 || u > s) throw new TypeError(`${t2} is outside the accepted range of 0 to ${s}, inclusive`);
        return !Kn(u) || u === 0 ? 0 : u;
      }
      n$1(Fr, "convertUnsignedLongLongWithEnforceRange");
      function jr(e, t2) {
        if (!We(e)) throw new TypeError(`${t2} is not a ReadableStream.`);
      }
      n$1(jr, "assertReadableStream");
      function Qe(e) {
        return new fe(e);
      }
      n$1(Qe, "AcquireReadableStreamDefaultReader");
      function eo(e, t2) {
        e._reader._readRequests.push(t2);
      }
      n$1(eo, "ReadableStreamAddReadRequest");
      function Lr(e, t2, r2) {
        const u = e._reader._readRequests.shift();
        r2 ? u._closeSteps() : u._chunkSteps(t2);
      }
      n$1(Lr, "ReadableStreamFulfillReadRequest");
      function $t(e) {
        return e._reader._readRequests.length;
      }
      n$1($t, "ReadableStreamGetNumReadRequests");
      function to(e) {
        const t2 = e._reader;
        return !(t2 === void 0 || !Ee(t2));
      }
      n$1(to, "ReadableStreamHasDefaultReader");
      const mn = class mn {
        constructor(t2) {
          if (Se(t2, 1, "ReadableStreamDefaultReader"), jr(t2, "First parameter"), qe(t2)) throw new TypeError("This stream has already been locked for exclusive reading by another reader");
          Yn(this, t2), this._readRequests = new D();
        }
        get closed() {
          return Ee(this) ? this._closedPromise : b(Dt("closed"));
        }
        cancel(t2 = void 0) {
          return Ee(this) ? this._ownerReadableStream === void 0 ? b(Lt("cancel")) : Wr(this, t2) : b(Dt("cancel"));
        }
        read() {
          if (!Ee(this)) return b(Dt("read"));
          if (this._ownerReadableStream === void 0) return b(Lt("read from"));
          let t2, r2;
          const s = A((c, d) => {
            t2 = c, r2 = d;
          });
          return _t(this, { _chunkSteps: n$1((c) => t2({ value: c, done: false }), "_chunkSteps"), _closeSteps: n$1(() => t2({ value: void 0, done: true }), "_closeSteps"), _errorSteps: n$1((c) => r2(c), "_errorSteps") }), s;
        }
        releaseLock() {
          if (!Ee(this)) throw Dt("releaseLock");
          this._ownerReadableStream !== void 0 && Gi(this);
        }
      };
      n$1(mn, "ReadableStreamDefaultReader");
      let fe = mn;
      Object.defineProperties(fe.prototype, { cancel: { enumerable: true }, read: { enumerable: true }, releaseLock: { enumerable: true }, closed: { enumerable: true } }), h(fe.prototype.cancel, "cancel"), h(fe.prototype.read, "read"), h(fe.prototype.releaseLock, "releaseLock"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(fe.prototype, Symbol.toStringTag, { value: "ReadableStreamDefaultReader", configurable: true });
      function Ee(e) {
        return !l(e) || !Object.prototype.hasOwnProperty.call(e, "_readRequests") ? false : e instanceof fe;
      }
      n$1(Ee, "IsReadableStreamDefaultReader");
      function _t(e, t2) {
        const r2 = e._ownerReadableStream;
        r2._disturbed = true, r2._state === "closed" ? t2._closeSteps() : r2._state === "errored" ? t2._errorSteps(r2._storedError) : r2._readableStreamController[Br](t2);
      }
      n$1(_t, "ReadableStreamDefaultReaderRead");
      function Gi(e) {
        _e(e);
        const t2 = new TypeError("Reader was released");
        ro(e, t2);
      }
      n$1(Gi, "ReadableStreamDefaultReaderRelease");
      function ro(e, t2) {
        const r2 = e._readRequests;
        e._readRequests = new D(), r2.forEach((s) => {
          s._errorSteps(t2);
        });
      }
      n$1(ro, "ReadableStreamDefaultReaderErrorReadRequests");
      function Dt(e) {
        return new TypeError(`ReadableStreamDefaultReader.prototype.${e} can only be used on a ReadableStreamDefaultReader`);
      }
      n$1(Dt, "defaultReaderBrandCheckException");
      const Zi = Object.getPrototypeOf(Object.getPrototypeOf(async function* () {
      }).prototype), yn = class yn {
        constructor(t2, r2) {
          this._ongoingPromise = void 0, this._isFinished = false, this._reader = t2, this._preventCancel = r2;
        }
        next() {
          const t2 = n$1(() => this._nextSteps(), "nextSteps");
          return this._ongoingPromise = this._ongoingPromise ? F(this._ongoingPromise, t2, t2) : t2(), this._ongoingPromise;
        }
        return(t2) {
          const r2 = n$1(() => this._returnSteps(t2), "returnSteps");
          return this._ongoingPromise ? F(this._ongoingPromise, r2, r2) : r2();
        }
        _nextSteps() {
          if (this._isFinished) return Promise.resolve({ value: void 0, done: true });
          const t2 = this._reader;
          let r2, s;
          const u = A((d, m) => {
            r2 = d, s = m;
          });
          return _t(t2, { _chunkSteps: n$1((d) => {
            this._ongoingPromise = void 0, ge(() => r2({ value: d, done: false }));
          }, "_chunkSteps"), _closeSteps: n$1(() => {
            this._ongoingPromise = void 0, this._isFinished = true, _e(t2), r2({ value: void 0, done: true });
          }, "_closeSteps"), _errorSteps: n$1((d) => {
            this._ongoingPromise = void 0, this._isFinished = true, _e(t2), s(d);
          }, "_errorSteps") }), u;
        }
        _returnSteps(t2) {
          if (this._isFinished) return Promise.resolve({ value: t2, done: true });
          this._isFinished = true;
          const r2 = this._reader;
          if (!this._preventCancel) {
            const s = Wr(r2, t2);
            return _e(r2), F(s, () => ({ value: t2, done: true }));
          }
          return _e(r2), T2({ value: t2, done: true });
        }
      };
      n$1(yn, "ReadableStreamAsyncIteratorImpl");
      let Mt = yn;
      const no = { next() {
        return oo(this) ? this._asyncIteratorImpl.next() : b(io("next"));
      }, return(e) {
        return oo(this) ? this._asyncIteratorImpl.return(e) : b(io("return"));
      } };
      Object.setPrototypeOf(no, Zi);
      function Ki(e, t2) {
        const r2 = Qe(e), s = new Mt(r2, t2), u = Object.create(no);
        return u._asyncIteratorImpl = s, u;
      }
      n$1(Ki, "AcquireReadableStreamAsyncIterator");
      function oo(e) {
        if (!l(e) || !Object.prototype.hasOwnProperty.call(e, "_asyncIteratorImpl")) return false;
        try {
          return e._asyncIteratorImpl instanceof Mt;
        } catch {
          return false;
        }
      }
      n$1(oo, "IsReadableStreamAsyncIterator");
      function io(e) {
        return new TypeError(`ReadableStreamAsyncIterator.${e} can only be used on a ReadableSteamAsyncIterator`);
      }
      n$1(io, "streamAsyncIteratorBrandCheckException");
      const ao = Number.isNaN || function(e) {
        return e !== e;
      };
      var $r, Dr, Mr;
      function St(e) {
        return e.slice();
      }
      n$1(St, "CreateArrayFromList");
      function so(e, t2, r2, s, u) {
        new Uint8Array(e).set(new Uint8Array(r2, s, u), t2);
      }
      n$1(so, "CopyDataBlockBytes");
      let we = n$1((e) => (typeof e.transfer == "function" ? we = n$1((t2) => t2.transfer(), "TransferArrayBuffer") : typeof structuredClone == "function" ? we = n$1((t2) => structuredClone(t2, { transfer: [t2] }), "TransferArrayBuffer") : we = n$1((t2) => t2, "TransferArrayBuffer"), we(e)), "TransferArrayBuffer"), Ae = n$1((e) => (typeof e.detached == "boolean" ? Ae = n$1((t2) => t2.detached, "IsDetachedBuffer") : Ae = n$1((t2) => t2.byteLength === 0, "IsDetachedBuffer"), Ae(e)), "IsDetachedBuffer");
      function lo(e, t2, r2) {
        if (e.slice) return e.slice(t2, r2);
        const s = r2 - t2, u = new ArrayBuffer(s);
        return so(u, 0, e, t2, s), u;
      }
      n$1(lo, "ArrayBufferSlice");
      function Ut(e, t2) {
        const r2 = e[t2];
        if (r2 != null) {
          if (typeof r2 != "function") throw new TypeError(`${String(t2)} is not a function`);
          return r2;
        }
      }
      n$1(Ut, "GetMethod");
      function Ji(e) {
        const t2 = { [Symbol.iterator]: () => e.iterator }, r2 = (async function* () {
          return yield* t2;
        })(), s = r2.next;
        return { iterator: r2, nextMethod: s, done: false };
      }
      n$1(Ji, "CreateAsyncFromSyncIterator");
      const Ur = (Mr = ($r = Symbol.asyncIterator) !== null && $r !== void 0 ? $r : (Dr = Symbol.for) === null || Dr === void 0 ? void 0 : Dr.call(Symbol, "Symbol.asyncIterator")) !== null && Mr !== void 0 ? Mr : "@@asyncIterator";
      function uo(e, t2 = "sync", r2) {
        if (r2 === void 0) if (t2 === "async") {
          if (r2 = Ut(e, Ur), r2 === void 0) {
            const c = Ut(e, Symbol.iterator), d = uo(e, "sync", c);
            return Ji(d);
          }
        } else r2 = Ut(e, Symbol.iterator);
        if (r2 === void 0) throw new TypeError("The object is not iterable");
        const s = z(r2, e, []);
        if (!l(s)) throw new TypeError("The iterator method must return an object");
        const u = s.next;
        return { iterator: s, nextMethod: u, done: false };
      }
      n$1(uo, "GetIterator");
      function Xi(e) {
        const t2 = z(e.nextMethod, e.iterator, []);
        if (!l(t2)) throw new TypeError("The iterator.next() method must return an object");
        return t2;
      }
      n$1(Xi, "IteratorNext");
      function ea(e) {
        return !!e.done;
      }
      n$1(ea, "IteratorComplete");
      function ta(e) {
        return e.value;
      }
      n$1(ta, "IteratorValue");
      function ra(e) {
        return !(typeof e != "number" || ao(e) || e < 0);
      }
      n$1(ra, "IsNonNegativeNumber");
      function fo(e) {
        const t2 = lo(e.buffer, e.byteOffset, e.byteOffset + e.byteLength);
        return new Uint8Array(t2);
      }
      n$1(fo, "CloneAsUint8Array");
      function xr(e) {
        const t2 = e._queue.shift();
        return e._queueTotalSize -= t2.size, e._queueTotalSize < 0 && (e._queueTotalSize = 0), t2.value;
      }
      n$1(xr, "DequeueValue");
      function Nr(e, t2, r2) {
        if (!ra(r2) || r2 === 1 / 0) throw new RangeError("Size must be a finite, non-NaN, non-negative number.");
        e._queue.push({ value: t2, size: r2 }), e._queueTotalSize += r2;
      }
      n$1(Nr, "EnqueueValueWithSize");
      function na(e) {
        return e._queue.peek().value;
      }
      n$1(na, "PeekQueueValue");
      function Be(e) {
        e._queue = new D(), e._queueTotalSize = 0;
      }
      n$1(Be, "ResetQueue");
      function co(e) {
        return e === DataView;
      }
      n$1(co, "isDataViewConstructor");
      function oa(e) {
        return co(e.constructor);
      }
      n$1(oa, "isDataView");
      function ia(e) {
        return co(e) ? 1 : e.BYTES_PER_ELEMENT;
      }
      n$1(ia, "arrayBufferViewElementSize");
      const gn = class gn {
        constructor() {
          throw new TypeError("Illegal constructor");
        }
        get view() {
          if (!Hr(this)) throw Zr("view");
          return this._view;
        }
        respond(t2) {
          if (!Hr(this)) throw Zr("respond");
          if (Se(t2, 1, "respond"), t2 = Fr(t2, "First parameter"), this._associatedReadableByteStreamController === void 0) throw new TypeError("This BYOB request has been invalidated");
          if (Ae(this._view.buffer)) throw new TypeError("The BYOB request's buffer has been detached and so cannot be used as a response");
          Vt(this._associatedReadableByteStreamController, t2);
        }
        respondWithNewView(t2) {
          if (!Hr(this)) throw Zr("respondWithNewView");
          if (Se(t2, 1, "respondWithNewView"), !ArrayBuffer.isView(t2)) throw new TypeError("You can only respond with array buffer views");
          if (this._associatedReadableByteStreamController === void 0) throw new TypeError("This BYOB request has been invalidated");
          if (Ae(t2.buffer)) throw new TypeError("The given view's buffer has been detached and so cannot be used as a response");
          Qt(this._associatedReadableByteStreamController, t2);
        }
      };
      n$1(gn, "ReadableStreamBYOBRequest");
      let Re = gn;
      Object.defineProperties(Re.prototype, { respond: { enumerable: true }, respondWithNewView: { enumerable: true }, view: { enumerable: true } }), h(Re.prototype.respond, "respond"), h(Re.prototype.respondWithNewView, "respondWithNewView"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(Re.prototype, Symbol.toStringTag, { value: "ReadableStreamBYOBRequest", configurable: true });
      const _n = class _n {
        constructor() {
          throw new TypeError("Illegal constructor");
        }
        get byobRequest() {
          if (!Ie(this)) throw Rt("byobRequest");
          return Gr(this);
        }
        get desiredSize() {
          if (!Ie(this)) throw Rt("desiredSize");
          return Ro(this);
        }
        close() {
          if (!Ie(this)) throw Rt("close");
          if (this._closeRequested) throw new TypeError("The stream has already been closed; do not close it again!");
          const t2 = this._controlledReadableByteStream._state;
          if (t2 !== "readable") throw new TypeError(`The stream (in ${t2} state) is not in the readable state and cannot be closed`);
          wt(this);
        }
        enqueue(t2) {
          if (!Ie(this)) throw Rt("enqueue");
          if (Se(t2, 1, "enqueue"), !ArrayBuffer.isView(t2)) throw new TypeError("chunk must be an array buffer view");
          if (t2.byteLength === 0) throw new TypeError("chunk must have non-zero byteLength");
          if (t2.buffer.byteLength === 0) throw new TypeError("chunk's buffer must have non-zero byteLength");
          if (this._closeRequested) throw new TypeError("stream is closed or draining");
          const r2 = this._controlledReadableByteStream._state;
          if (r2 !== "readable") throw new TypeError(`The stream (in ${r2} state) is not in the readable state and cannot be enqueued to`);
          Ht(this, t2);
        }
        error(t2 = void 0) {
          if (!Ie(this)) throw Rt("error");
          K(this, t2);
        }
        [Ar](t2) {
          ho(this), Be(this);
          const r2 = this._cancelAlgorithm(t2);
          return Nt(this), r2;
        }
        [Br](t2) {
          const r2 = this._controlledReadableByteStream;
          if (this._queueTotalSize > 0) {
            wo(this, t2);
            return;
          }
          const s = this._autoAllocateChunkSize;
          if (s !== void 0) {
            let u;
            try {
              u = new ArrayBuffer(s);
            } catch (d) {
              t2._errorSteps(d);
              return;
            }
            const c = { buffer: u, bufferByteLength: s, byteOffset: 0, byteLength: s, bytesFilled: 0, minimumFill: 1, elementSize: 1, viewConstructor: Uint8Array, readerType: "default" };
            this._pendingPullIntos.push(c);
          }
          eo(r2, t2), Fe(this);
        }
        [kr]() {
          if (this._pendingPullIntos.length > 0) {
            const t2 = this._pendingPullIntos.peek();
            t2.readerType = "none", this._pendingPullIntos = new D(), this._pendingPullIntos.push(t2);
          }
        }
      };
      n$1(_n, "ReadableByteStreamController");
      let te = _n;
      Object.defineProperties(te.prototype, { close: { enumerable: true }, enqueue: { enumerable: true }, error: { enumerable: true }, byobRequest: { enumerable: true }, desiredSize: { enumerable: true } }), h(te.prototype.close, "close"), h(te.prototype.enqueue, "enqueue"), h(te.prototype.error, "error"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(te.prototype, Symbol.toStringTag, { value: "ReadableByteStreamController", configurable: true });
      function Ie(e) {
        return !l(e) || !Object.prototype.hasOwnProperty.call(e, "_controlledReadableByteStream") ? false : e instanceof te;
      }
      n$1(Ie, "IsReadableByteStreamController");
      function Hr(e) {
        return !l(e) || !Object.prototype.hasOwnProperty.call(e, "_associatedReadableByteStreamController") ? false : e instanceof Re;
      }
      n$1(Hr, "IsReadableStreamBYOBRequest");
      function Fe(e) {
        if (!fa(e)) return;
        if (e._pulling) {
          e._pullAgain = true;
          return;
        }
        e._pulling = true;
        const r2 = e._pullAlgorithm();
        g(r2, () => (e._pulling = false, e._pullAgain && (e._pullAgain = false, Fe(e)), null), (s) => (K(e, s), null));
      }
      n$1(Fe, "ReadableByteStreamControllerCallPullIfNeeded");
      function ho(e) {
        Qr(e), e._pendingPullIntos = new D();
      }
      n$1(ho, "ReadableByteStreamControllerClearPendingPullIntos");
      function Vr(e, t2) {
        let r2 = false;
        e._state === "closed" && (r2 = true);
        const s = po(t2);
        t2.readerType === "default" ? Lr(e, s, r2) : ma(e, s, r2);
      }
      n$1(Vr, "ReadableByteStreamControllerCommitPullIntoDescriptor");
      function po(e) {
        const t2 = e.bytesFilled, r2 = e.elementSize;
        return new e.viewConstructor(e.buffer, e.byteOffset, t2 / r2);
      }
      n$1(po, "ReadableByteStreamControllerConvertPullIntoDescriptor");
      function xt(e, t2, r2, s) {
        e._queue.push({ buffer: t2, byteOffset: r2, byteLength: s }), e._queueTotalSize += s;
      }
      n$1(xt, "ReadableByteStreamControllerEnqueueChunkToQueue");
      function bo(e, t2, r2, s) {
        let u;
        try {
          u = lo(t2, r2, r2 + s);
        } catch (c) {
          throw K(e, c), c;
        }
        xt(e, u, 0, s);
      }
      n$1(bo, "ReadableByteStreamControllerEnqueueClonedChunkToQueue");
      function mo(e, t2) {
        t2.bytesFilled > 0 && bo(e, t2.buffer, t2.byteOffset, t2.bytesFilled), Ye(e);
      }
      n$1(mo, "ReadableByteStreamControllerEnqueueDetachedPullIntoToQueue");
      function yo(e, t2) {
        const r2 = Math.min(e._queueTotalSize, t2.byteLength - t2.bytesFilled), s = t2.bytesFilled + r2;
        let u = r2, c = false;
        const d = s % t2.elementSize, m = s - d;
        m >= t2.minimumFill && (u = m - t2.bytesFilled, c = true);
        const R = e._queue;
        for (; u > 0; ) {
          const y = R.peek(), C = Math.min(u, y.byteLength), P = t2.byteOffset + t2.bytesFilled;
          so(t2.buffer, P, y.buffer, y.byteOffset, C), y.byteLength === C ? R.shift() : (y.byteOffset += C, y.byteLength -= C), e._queueTotalSize -= C, go(e, C, t2), u -= C;
        }
        return c;
      }
      n$1(yo, "ReadableByteStreamControllerFillPullIntoDescriptorFromQueue");
      function go(e, t2, r2) {
        r2.bytesFilled += t2;
      }
      n$1(go, "ReadableByteStreamControllerFillHeadPullIntoDescriptor");
      function _o(e) {
        e._queueTotalSize === 0 && e._closeRequested ? (Nt(e), At(e._controlledReadableByteStream)) : Fe(e);
      }
      n$1(_o, "ReadableByteStreamControllerHandleQueueDrain");
      function Qr(e) {
        e._byobRequest !== null && (e._byobRequest._associatedReadableByteStreamController = void 0, e._byobRequest._view = null, e._byobRequest = null);
      }
      n$1(Qr, "ReadableByteStreamControllerInvalidateBYOBRequest");
      function Yr(e) {
        for (; e._pendingPullIntos.length > 0; ) {
          if (e._queueTotalSize === 0) return;
          const t2 = e._pendingPullIntos.peek();
          yo(e, t2) && (Ye(e), Vr(e._controlledReadableByteStream, t2));
        }
      }
      n$1(Yr, "ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue");
      function aa(e) {
        const t2 = e._controlledReadableByteStream._reader;
        for (; t2._readRequests.length > 0; ) {
          if (e._queueTotalSize === 0) return;
          const r2 = t2._readRequests.shift();
          wo(e, r2);
        }
      }
      n$1(aa, "ReadableByteStreamControllerProcessReadRequestsUsingQueue");
      function sa(e, t2, r2, s) {
        const u = e._controlledReadableByteStream, c = t2.constructor, d = ia(c), { byteOffset: m, byteLength: R } = t2, y = r2 * d;
        let C;
        try {
          C = we(t2.buffer);
        } catch (B) {
          s._errorSteps(B);
          return;
        }
        const P = { buffer: C, bufferByteLength: C.byteLength, byteOffset: m, byteLength: R, bytesFilled: 0, minimumFill: y, elementSize: d, viewConstructor: c, readerType: "byob" };
        if (e._pendingPullIntos.length > 0) {
          e._pendingPullIntos.push(P), Po(u, s);
          return;
        }
        if (u._state === "closed") {
          const B = new c(P.buffer, P.byteOffset, 0);
          s._closeSteps(B);
          return;
        }
        if (e._queueTotalSize > 0) {
          if (yo(e, P)) {
            const B = po(P);
            _o(e), s._chunkSteps(B);
            return;
          }
          if (e._closeRequested) {
            const B = new TypeError("Insufficient bytes to fill elements in the given buffer");
            K(e, B), s._errorSteps(B);
            return;
          }
        }
        e._pendingPullIntos.push(P), Po(u, s), Fe(e);
      }
      n$1(sa, "ReadableByteStreamControllerPullInto");
      function la(e, t2) {
        t2.readerType === "none" && Ye(e);
        const r2 = e._controlledReadableByteStream;
        if (Kr(r2)) for (; vo(r2) > 0; ) {
          const s = Ye(e);
          Vr(r2, s);
        }
      }
      n$1(la, "ReadableByteStreamControllerRespondInClosedState");
      function ua(e, t2, r2) {
        if (go(e, t2, r2), r2.readerType === "none") {
          mo(e, r2), Yr(e);
          return;
        }
        if (r2.bytesFilled < r2.minimumFill) return;
        Ye(e);
        const s = r2.bytesFilled % r2.elementSize;
        if (s > 0) {
          const u = r2.byteOffset + r2.bytesFilled;
          bo(e, r2.buffer, u - s, s);
        }
        r2.bytesFilled -= s, Vr(e._controlledReadableByteStream, r2), Yr(e);
      }
      n$1(ua, "ReadableByteStreamControllerRespondInReadableState");
      function So(e, t2) {
        const r2 = e._pendingPullIntos.peek();
        Qr(e), e._controlledReadableByteStream._state === "closed" ? la(e, r2) : ua(e, t2, r2), Fe(e);
      }
      n$1(So, "ReadableByteStreamControllerRespondInternal");
      function Ye(e) {
        return e._pendingPullIntos.shift();
      }
      n$1(Ye, "ReadableByteStreamControllerShiftPendingPullInto");
      function fa(e) {
        const t2 = e._controlledReadableByteStream;
        return t2._state !== "readable" || e._closeRequested || !e._started ? false : !!(to(t2) && $t(t2) > 0 || Kr(t2) && vo(t2) > 0 || Ro(e) > 0);
      }
      n$1(fa, "ReadableByteStreamControllerShouldCallPull");
      function Nt(e) {
        e._pullAlgorithm = void 0, e._cancelAlgorithm = void 0;
      }
      n$1(Nt, "ReadableByteStreamControllerClearAlgorithms");
      function wt(e) {
        const t2 = e._controlledReadableByteStream;
        if (!(e._closeRequested || t2._state !== "readable")) {
          if (e._queueTotalSize > 0) {
            e._closeRequested = true;
            return;
          }
          if (e._pendingPullIntos.length > 0) {
            const r2 = e._pendingPullIntos.peek();
            if (r2.bytesFilled % r2.elementSize !== 0) {
              const s = new TypeError("Insufficient bytes to fill elements in the given buffer");
              throw K(e, s), s;
            }
          }
          Nt(e), At(t2);
        }
      }
      n$1(wt, "ReadableByteStreamControllerClose");
      function Ht(e, t2) {
        const r2 = e._controlledReadableByteStream;
        if (e._closeRequested || r2._state !== "readable") return;
        const { buffer: s, byteOffset: u, byteLength: c } = t2;
        if (Ae(s)) throw new TypeError("chunk's buffer is detached and so cannot be enqueued");
        const d = we(s);
        if (e._pendingPullIntos.length > 0) {
          const m = e._pendingPullIntos.peek();
          if (Ae(m.buffer)) throw new TypeError("The BYOB request's buffer has been detached and so cannot be filled with an enqueued chunk");
          Qr(e), m.buffer = we(m.buffer), m.readerType === "none" && mo(e, m);
        }
        if (to(r2)) if (aa(e), $t(r2) === 0) xt(e, d, u, c);
        else {
          e._pendingPullIntos.length > 0 && Ye(e);
          const m = new Uint8Array(d, u, c);
          Lr(r2, m, false);
        }
        else Kr(r2) ? (xt(e, d, u, c), Yr(e)) : xt(e, d, u, c);
        Fe(e);
      }
      n$1(Ht, "ReadableByteStreamControllerEnqueue");
      function K(e, t2) {
        const r2 = e._controlledReadableByteStream;
        r2._state === "readable" && (ho(e), Be(e), Nt(e), Zo(r2, t2));
      }
      n$1(K, "ReadableByteStreamControllerError");
      function wo(e, t2) {
        const r2 = e._queue.shift();
        e._queueTotalSize -= r2.byteLength, _o(e);
        const s = new Uint8Array(r2.buffer, r2.byteOffset, r2.byteLength);
        t2._chunkSteps(s);
      }
      n$1(wo, "ReadableByteStreamControllerFillReadRequestFromQueue");
      function Gr(e) {
        if (e._byobRequest === null && e._pendingPullIntos.length > 0) {
          const t2 = e._pendingPullIntos.peek(), r2 = new Uint8Array(t2.buffer, t2.byteOffset + t2.bytesFilled, t2.byteLength - t2.bytesFilled), s = Object.create(Re.prototype);
          da(s, e, r2), e._byobRequest = s;
        }
        return e._byobRequest;
      }
      n$1(Gr, "ReadableByteStreamControllerGetBYOBRequest");
      function Ro(e) {
        const t2 = e._controlledReadableByteStream._state;
        return t2 === "errored" ? null : t2 === "closed" ? 0 : e._strategyHWM - e._queueTotalSize;
      }
      n$1(Ro, "ReadableByteStreamControllerGetDesiredSize");
      function Vt(e, t2) {
        const r2 = e._pendingPullIntos.peek();
        if (e._controlledReadableByteStream._state === "closed") {
          if (t2 !== 0) throw new TypeError("bytesWritten must be 0 when calling respond() on a closed stream");
        } else {
          if (t2 === 0) throw new TypeError("bytesWritten must be greater than 0 when calling respond() on a readable stream");
          if (r2.bytesFilled + t2 > r2.byteLength) throw new RangeError("bytesWritten out of range");
        }
        r2.buffer = we(r2.buffer), So(e, t2);
      }
      n$1(Vt, "ReadableByteStreamControllerRespond");
      function Qt(e, t2) {
        const r2 = e._pendingPullIntos.peek();
        if (e._controlledReadableByteStream._state === "closed") {
          if (t2.byteLength !== 0) throw new TypeError("The view's length must be 0 when calling respondWithNewView() on a closed stream");
        } else if (t2.byteLength === 0) throw new TypeError("The view's length must be greater than 0 when calling respondWithNewView() on a readable stream");
        if (r2.byteOffset + r2.bytesFilled !== t2.byteOffset) throw new RangeError("The region specified by view does not match byobRequest");
        if (r2.bufferByteLength !== t2.buffer.byteLength) throw new RangeError("The buffer of view has different capacity than byobRequest");
        if (r2.bytesFilled + t2.byteLength > r2.byteLength) throw new RangeError("The region specified by view is larger than byobRequest");
        const u = t2.byteLength;
        r2.buffer = we(t2.buffer), So(e, u);
      }
      n$1(Qt, "ReadableByteStreamControllerRespondWithNewView");
      function To(e, t2, r2, s, u, c, d) {
        t2._controlledReadableByteStream = e, t2._pullAgain = false, t2._pulling = false, t2._byobRequest = null, t2._queue = t2._queueTotalSize = void 0, Be(t2), t2._closeRequested = false, t2._started = false, t2._strategyHWM = c, t2._pullAlgorithm = s, t2._cancelAlgorithm = u, t2._autoAllocateChunkSize = d, t2._pendingPullIntos = new D(), e._readableStreamController = t2;
        const m = r2();
        g(T2(m), () => (t2._started = true, Fe(t2), null), (R) => (K(t2, R), null));
      }
      n$1(To, "SetUpReadableByteStreamController");
      function ca(e, t2, r2) {
        const s = Object.create(te.prototype);
        let u, c, d;
        t2.start !== void 0 ? u = n$1(() => t2.start(s), "startAlgorithm") : u = n$1(() => {
        }, "startAlgorithm"), t2.pull !== void 0 ? c = n$1(() => t2.pull(s), "pullAlgorithm") : c = n$1(() => T2(void 0), "pullAlgorithm"), t2.cancel !== void 0 ? d = n$1((R) => t2.cancel(R), "cancelAlgorithm") : d = n$1(() => T2(void 0), "cancelAlgorithm");
        const m = t2.autoAllocateChunkSize;
        if (m === 0) throw new TypeError("autoAllocateChunkSize must be greater than 0");
        To(e, s, u, c, d, r2, m);
      }
      n$1(ca, "SetUpReadableByteStreamControllerFromUnderlyingSource");
      function da(e, t2, r2) {
        e._associatedReadableByteStreamController = t2, e._view = r2;
      }
      n$1(da, "SetUpReadableStreamBYOBRequest");
      function Zr(e) {
        return new TypeError(`ReadableStreamBYOBRequest.prototype.${e} can only be used on a ReadableStreamBYOBRequest`);
      }
      n$1(Zr, "byobRequestBrandCheckException");
      function Rt(e) {
        return new TypeError(`ReadableByteStreamController.prototype.${e} can only be used on a ReadableByteStreamController`);
      }
      n$1(Rt, "byteStreamControllerBrandCheckException");
      function ha(e, t2) {
        ue(e, t2);
        const r2 = e?.mode;
        return { mode: r2 === void 0 ? void 0 : pa(r2, `${t2} has member 'mode' that`) };
      }
      n$1(ha, "convertReaderOptions");
      function pa(e, t2) {
        if (e = `${e}`, e !== "byob") throw new TypeError(`${t2} '${e}' is not a valid enumeration value for ReadableStreamReaderMode`);
        return e;
      }
      n$1(pa, "convertReadableStreamReaderMode");
      function ba(e, t2) {
        var r2;
        ue(e, t2);
        const s = (r2 = e?.min) !== null && r2 !== void 0 ? r2 : 1;
        return { min: Fr(s, `${t2} has member 'min' that`) };
      }
      n$1(ba, "convertByobReadOptions");
      function Co(e) {
        return new ce(e);
      }
      n$1(Co, "AcquireReadableStreamBYOBReader");
      function Po(e, t2) {
        e._reader._readIntoRequests.push(t2);
      }
      n$1(Po, "ReadableStreamAddReadIntoRequest");
      function ma(e, t2, r2) {
        const u = e._reader._readIntoRequests.shift();
        r2 ? u._closeSteps(t2) : u._chunkSteps(t2);
      }
      n$1(ma, "ReadableStreamFulfillReadIntoRequest");
      function vo(e) {
        return e._reader._readIntoRequests.length;
      }
      n$1(vo, "ReadableStreamGetNumReadIntoRequests");
      function Kr(e) {
        const t2 = e._reader;
        return !(t2 === void 0 || !je(t2));
      }
      n$1(Kr, "ReadableStreamHasBYOBReader");
      const Sn = class Sn {
        constructor(t2) {
          if (Se(t2, 1, "ReadableStreamBYOBReader"), jr(t2, "First parameter"), qe(t2)) throw new TypeError("This stream has already been locked for exclusive reading by another reader");
          if (!Ie(t2._readableStreamController)) throw new TypeError("Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source");
          Yn(this, t2), this._readIntoRequests = new D();
        }
        get closed() {
          return je(this) ? this._closedPromise : b(Yt("closed"));
        }
        cancel(t2 = void 0) {
          return je(this) ? this._ownerReadableStream === void 0 ? b(Lt("cancel")) : Wr(this, t2) : b(Yt("cancel"));
        }
        read(t2, r2 = {}) {
          if (!je(this)) return b(Yt("read"));
          if (!ArrayBuffer.isView(t2)) return b(new TypeError("view must be an array buffer view"));
          if (t2.byteLength === 0) return b(new TypeError("view must have non-zero byteLength"));
          if (t2.buffer.byteLength === 0) return b(new TypeError("view's buffer must have non-zero byteLength"));
          if (Ae(t2.buffer)) return b(new TypeError("view's buffer has been detached"));
          let s;
          try {
            s = ba(r2, "options");
          } catch (y) {
            return b(y);
          }
          const u = s.min;
          if (u === 0) return b(new TypeError("options.min must be greater than 0"));
          if (oa(t2)) {
            if (u > t2.byteLength) return b(new RangeError("options.min must be less than or equal to view's byteLength"));
          } else if (u > t2.length) return b(new RangeError("options.min must be less than or equal to view's length"));
          if (this._ownerReadableStream === void 0) return b(Lt("read from"));
          let c, d;
          const m = A((y, C) => {
            c = y, d = C;
          });
          return Eo(this, t2, u, { _chunkSteps: n$1((y) => c({ value: y, done: false }), "_chunkSteps"), _closeSteps: n$1((y) => c({ value: y, done: true }), "_closeSteps"), _errorSteps: n$1((y) => d(y), "_errorSteps") }), m;
        }
        releaseLock() {
          if (!je(this)) throw Yt("releaseLock");
          this._ownerReadableStream !== void 0 && ya(this);
        }
      };
      n$1(Sn, "ReadableStreamBYOBReader");
      let ce = Sn;
      Object.defineProperties(ce.prototype, { cancel: { enumerable: true }, read: { enumerable: true }, releaseLock: { enumerable: true }, closed: { enumerable: true } }), h(ce.prototype.cancel, "cancel"), h(ce.prototype.read, "read"), h(ce.prototype.releaseLock, "releaseLock"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(ce.prototype, Symbol.toStringTag, { value: "ReadableStreamBYOBReader", configurable: true });
      function je(e) {
        return !l(e) || !Object.prototype.hasOwnProperty.call(e, "_readIntoRequests") ? false : e instanceof ce;
      }
      n$1(je, "IsReadableStreamBYOBReader");
      function Eo(e, t2, r2, s) {
        const u = e._ownerReadableStream;
        u._disturbed = true, u._state === "errored" ? s._errorSteps(u._storedError) : sa(u._readableStreamController, t2, r2, s);
      }
      n$1(Eo, "ReadableStreamBYOBReaderRead");
      function ya(e) {
        _e(e);
        const t2 = new TypeError("Reader was released");
        Ao(e, t2);
      }
      n$1(ya, "ReadableStreamBYOBReaderRelease");
      function Ao(e, t2) {
        const r2 = e._readIntoRequests;
        e._readIntoRequests = new D(), r2.forEach((s) => {
          s._errorSteps(t2);
        });
      }
      n$1(Ao, "ReadableStreamBYOBReaderErrorReadIntoRequests");
      function Yt(e) {
        return new TypeError(`ReadableStreamBYOBReader.prototype.${e} can only be used on a ReadableStreamBYOBReader`);
      }
      n$1(Yt, "byobReaderBrandCheckException");
      function Tt(e, t2) {
        const { highWaterMark: r2 } = e;
        if (r2 === void 0) return t2;
        if (ao(r2) || r2 < 0) throw new RangeError("Invalid highWaterMark");
        return r2;
      }
      n$1(Tt, "ExtractHighWaterMark");
      function Gt(e) {
        const { size: t2 } = e;
        return t2 || (() => 1);
      }
      n$1(Gt, "ExtractSizeAlgorithm");
      function Zt(e, t2) {
        ue(e, t2);
        const r2 = e?.highWaterMark, s = e?.size;
        return { highWaterMark: r2 === void 0 ? void 0 : Ir(r2), size: s === void 0 ? void 0 : ga(s, `${t2} has member 'size' that`) };
      }
      n$1(Zt, "convertQueuingStrategy");
      function ga(e, t2) {
        return Z(e, t2), (r2) => Ir(e(r2));
      }
      n$1(ga, "convertQueuingStrategySize");
      function _a(e, t2) {
        ue(e, t2);
        const r2 = e?.abort, s = e?.close, u = e?.start, c = e?.type, d = e?.write;
        return { abort: r2 === void 0 ? void 0 : Sa(r2, e, `${t2} has member 'abort' that`), close: s === void 0 ? void 0 : wa(s, e, `${t2} has member 'close' that`), start: u === void 0 ? void 0 : Ra(u, e, `${t2} has member 'start' that`), write: d === void 0 ? void 0 : Ta(d, e, `${t2} has member 'write' that`), type: c };
      }
      n$1(_a, "convertUnderlyingSink");
      function Sa(e, t2, r2) {
        return Z(e, r2), (s) => j(e, t2, [s]);
      }
      n$1(Sa, "convertUnderlyingSinkAbortCallback");
      function wa(e, t2, r2) {
        return Z(e, r2), () => j(e, t2, []);
      }
      n$1(wa, "convertUnderlyingSinkCloseCallback");
      function Ra(e, t2, r2) {
        return Z(e, r2), (s) => z(e, t2, [s]);
      }
      n$1(Ra, "convertUnderlyingSinkStartCallback");
      function Ta(e, t2, r2) {
        return Z(e, r2), (s, u) => j(e, t2, [s, u]);
      }
      n$1(Ta, "convertUnderlyingSinkWriteCallback");
      function Bo(e, t2) {
        if (!Ge(e)) throw new TypeError(`${t2} is not a WritableStream.`);
      }
      n$1(Bo, "assertWritableStream");
      function Ca(e) {
        if (typeof e != "object" || e === null) return false;
        try {
          return typeof e.aborted == "boolean";
        } catch {
          return false;
        }
      }
      n$1(Ca, "isAbortSignal");
      const Pa = typeof AbortController == "function";
      function va() {
        if (Pa) return new AbortController();
      }
      n$1(va, "createAbortController");
      const wn = class wn {
        constructor(t2 = {}, r2 = {}) {
          t2 === void 0 ? t2 = null : Jn(t2, "First parameter");
          const s = Zt(r2, "Second parameter"), u = _a(t2, "First parameter");
          if (Wo(this), u.type !== void 0) throw new RangeError("Invalid type is specified");
          const d = Gt(s), m = Tt(s, 1);
          Da(this, u, m, d);
        }
        get locked() {
          if (!Ge(this)) throw tr("locked");
          return Ze(this);
        }
        abort(t2 = void 0) {
          return Ge(this) ? Ze(this) ? b(new TypeError("Cannot abort a stream that already has a writer")) : Kt(this, t2) : b(tr("abort"));
        }
        close() {
          return Ge(this) ? Ze(this) ? b(new TypeError("Cannot close a stream that already has a writer")) : he(this) ? b(new TypeError("Cannot close an already-closing stream")) : qo(this) : b(tr("close"));
        }
        getWriter() {
          if (!Ge(this)) throw tr("getWriter");
          return ko(this);
        }
      };
      n$1(wn, "WritableStream");
      let de = wn;
      Object.defineProperties(de.prototype, { abort: { enumerable: true }, close: { enumerable: true }, getWriter: { enumerable: true }, locked: { enumerable: true } }), h(de.prototype.abort, "abort"), h(de.prototype.close, "close"), h(de.prototype.getWriter, "getWriter"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(de.prototype, Symbol.toStringTag, { value: "WritableStream", configurable: true });
      function ko(e) {
        return new re(e);
      }
      n$1(ko, "AcquireWritableStreamDefaultWriter");
      function Ea(e, t2, r2, s, u = 1, c = () => 1) {
        const d = Object.create(de.prototype);
        Wo(d);
        const m = Object.create(ke.prototype);
        return Lo(d, m, e, t2, r2, s, u, c), d;
      }
      n$1(Ea, "CreateWritableStream");
      function Wo(e) {
        e._state = "writable", e._storedError = void 0, e._writer = void 0, e._writableStreamController = void 0, e._writeRequests = new D(), e._inFlightWriteRequest = void 0, e._closeRequest = void 0, e._inFlightCloseRequest = void 0, e._pendingAbortRequest = void 0, e._backpressure = false;
      }
      n$1(Wo, "InitializeWritableStream");
      function Ge(e) {
        return !l(e) || !Object.prototype.hasOwnProperty.call(e, "_writableStreamController") ? false : e instanceof de;
      }
      n$1(Ge, "IsWritableStream");
      function Ze(e) {
        return e._writer !== void 0;
      }
      n$1(Ze, "IsWritableStreamLocked");
      function Kt(e, t2) {
        var r2;
        if (e._state === "closed" || e._state === "errored") return T2(void 0);
        e._writableStreamController._abortReason = t2, (r2 = e._writableStreamController._abortController) === null || r2 === void 0 || r2.abort(t2);
        const s = e._state;
        if (s === "closed" || s === "errored") return T2(void 0);
        if (e._pendingAbortRequest !== void 0) return e._pendingAbortRequest._promise;
        let u = false;
        s === "erroring" && (u = true, t2 = void 0);
        const c = A((d, m) => {
          e._pendingAbortRequest = { _promise: void 0, _resolve: d, _reject: m, _reason: t2, _wasAlreadyErroring: u };
        });
        return e._pendingAbortRequest._promise = c, u || Xr(e, t2), c;
      }
      n$1(Kt, "WritableStreamAbort");
      function qo(e) {
        const t2 = e._state;
        if (t2 === "closed" || t2 === "errored") return b(new TypeError(`The stream (in ${t2} state) is not in the writable state and cannot be closed`));
        const r2 = A((u, c) => {
          const d = { _resolve: u, _reject: c };
          e._closeRequest = d;
        }), s = e._writer;
        return s !== void 0 && e._backpressure && t2 === "writable" && ln(s), Ma(e._writableStreamController), r2;
      }
      n$1(qo, "WritableStreamClose");
      function Aa(e) {
        return A((r2, s) => {
          const u = { _resolve: r2, _reject: s };
          e._writeRequests.push(u);
        });
      }
      n$1(Aa, "WritableStreamAddWriteRequest");
      function Jr(e, t2) {
        if (e._state === "writable") {
          Xr(e, t2);
          return;
        }
        en(e);
      }
      n$1(Jr, "WritableStreamDealWithRejection");
      function Xr(e, t2) {
        const r2 = e._writableStreamController;
        e._state = "erroring", e._storedError = t2;
        const s = e._writer;
        s !== void 0 && zo(s, t2), !Oa(e) && r2._started && en(e);
      }
      n$1(Xr, "WritableStreamStartErroring");
      function en(e) {
        e._state = "errored", e._writableStreamController[Qn]();
        const t2 = e._storedError;
        if (e._writeRequests.forEach((u) => {
          u._reject(t2);
        }), e._writeRequests = new D(), e._pendingAbortRequest === void 0) {
          Jt(e);
          return;
        }
        const r2 = e._pendingAbortRequest;
        if (e._pendingAbortRequest = void 0, r2._wasAlreadyErroring) {
          r2._reject(t2), Jt(e);
          return;
        }
        const s = e._writableStreamController[jt](r2._reason);
        g(s, () => (r2._resolve(), Jt(e), null), (u) => (r2._reject(u), Jt(e), null));
      }
      n$1(en, "WritableStreamFinishErroring");
      function Ba(e) {
        e._inFlightWriteRequest._resolve(void 0), e._inFlightWriteRequest = void 0;
      }
      n$1(Ba, "WritableStreamFinishInFlightWrite");
      function ka(e, t2) {
        e._inFlightWriteRequest._reject(t2), e._inFlightWriteRequest = void 0, Jr(e, t2);
      }
      n$1(ka, "WritableStreamFinishInFlightWriteWithError");
      function Wa(e) {
        e._inFlightCloseRequest._resolve(void 0), e._inFlightCloseRequest = void 0, e._state === "erroring" && (e._storedError = void 0, e._pendingAbortRequest !== void 0 && (e._pendingAbortRequest._resolve(), e._pendingAbortRequest = void 0)), e._state = "closed";
        const r2 = e._writer;
        r2 !== void 0 && Uo(r2);
      }
      n$1(Wa, "WritableStreamFinishInFlightClose");
      function qa(e, t2) {
        e._inFlightCloseRequest._reject(t2), e._inFlightCloseRequest = void 0, e._pendingAbortRequest !== void 0 && (e._pendingAbortRequest._reject(t2), e._pendingAbortRequest = void 0), Jr(e, t2);
      }
      n$1(qa, "WritableStreamFinishInFlightCloseWithError");
      function he(e) {
        return !(e._closeRequest === void 0 && e._inFlightCloseRequest === void 0);
      }
      n$1(he, "WritableStreamCloseQueuedOrInFlight");
      function Oa(e) {
        return !(e._inFlightWriteRequest === void 0 && e._inFlightCloseRequest === void 0);
      }
      n$1(Oa, "WritableStreamHasOperationMarkedInFlight");
      function za(e) {
        e._inFlightCloseRequest = e._closeRequest, e._closeRequest = void 0;
      }
      n$1(za, "WritableStreamMarkCloseRequestInFlight");
      function Ia(e) {
        e._inFlightWriteRequest = e._writeRequests.shift();
      }
      n$1(Ia, "WritableStreamMarkFirstWriteRequestInFlight");
      function Jt(e) {
        e._closeRequest !== void 0 && (e._closeRequest._reject(e._storedError), e._closeRequest = void 0);
        const t2 = e._writer;
        t2 !== void 0 && an(t2, e._storedError);
      }
      n$1(Jt, "WritableStreamRejectCloseAndClosedPromiseIfNeeded");
      function tn(e, t2) {
        const r2 = e._writer;
        r2 !== void 0 && t2 !== e._backpressure && (t2 ? Ya(r2) : ln(r2)), e._backpressure = t2;
      }
      n$1(tn, "WritableStreamUpdateBackpressure");
      const Rn = class Rn {
        constructor(t2) {
          if (Se(t2, 1, "WritableStreamDefaultWriter"), Bo(t2, "First parameter"), Ze(t2)) throw new TypeError("This stream has already been locked for exclusive writing by another writer");
          this._ownerWritableStream = t2, t2._writer = this;
          const r2 = t2._state;
          if (r2 === "writable") !he(t2) && t2._backpressure ? nr(this) : xo(this), rr(this);
          else if (r2 === "erroring") sn(this, t2._storedError), rr(this);
          else if (r2 === "closed") xo(this), Va(this);
          else {
            const s = t2._storedError;
            sn(this, s), Mo(this, s);
          }
        }
        get closed() {
          return Le(this) ? this._closedPromise : b($e("closed"));
        }
        get desiredSize() {
          if (!Le(this)) throw $e("desiredSize");
          if (this._ownerWritableStream === void 0) throw Pt("desiredSize");
          return $a(this);
        }
        get ready() {
          return Le(this) ? this._readyPromise : b($e("ready"));
        }
        abort(t2 = void 0) {
          return Le(this) ? this._ownerWritableStream === void 0 ? b(Pt("abort")) : Fa(this, t2) : b($e("abort"));
        }
        close() {
          if (!Le(this)) return b($e("close"));
          const t2 = this._ownerWritableStream;
          return t2 === void 0 ? b(Pt("close")) : he(t2) ? b(new TypeError("Cannot close an already-closing stream")) : Oo(this);
        }
        releaseLock() {
          if (!Le(this)) throw $e("releaseLock");
          this._ownerWritableStream !== void 0 && Io(this);
        }
        write(t2 = void 0) {
          return Le(this) ? this._ownerWritableStream === void 0 ? b(Pt("write to")) : Fo(this, t2) : b($e("write"));
        }
      };
      n$1(Rn, "WritableStreamDefaultWriter");
      let re = Rn;
      Object.defineProperties(re.prototype, { abort: { enumerable: true }, close: { enumerable: true }, releaseLock: { enumerable: true }, write: { enumerable: true }, closed: { enumerable: true }, desiredSize: { enumerable: true }, ready: { enumerable: true } }), h(re.prototype.abort, "abort"), h(re.prototype.close, "close"), h(re.prototype.releaseLock, "releaseLock"), h(re.prototype.write, "write"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(re.prototype, Symbol.toStringTag, { value: "WritableStreamDefaultWriter", configurable: true });
      function Le(e) {
        return !l(e) || !Object.prototype.hasOwnProperty.call(e, "_ownerWritableStream") ? false : e instanceof re;
      }
      n$1(Le, "IsWritableStreamDefaultWriter");
      function Fa(e, t2) {
        const r2 = e._ownerWritableStream;
        return Kt(r2, t2);
      }
      n$1(Fa, "WritableStreamDefaultWriterAbort");
      function Oo(e) {
        const t2 = e._ownerWritableStream;
        return qo(t2);
      }
      n$1(Oo, "WritableStreamDefaultWriterClose");
      function ja(e) {
        const t2 = e._ownerWritableStream, r2 = t2._state;
        return he(t2) || r2 === "closed" ? T2(void 0) : r2 === "errored" ? b(t2._storedError) : Oo(e);
      }
      n$1(ja, "WritableStreamDefaultWriterCloseWithErrorPropagation");
      function La(e, t2) {
        e._closedPromiseState === "pending" ? an(e, t2) : Qa(e, t2);
      }
      n$1(La, "WritableStreamDefaultWriterEnsureClosedPromiseRejected");
      function zo(e, t2) {
        e._readyPromiseState === "pending" ? No(e, t2) : Ga(e, t2);
      }
      n$1(zo, "WritableStreamDefaultWriterEnsureReadyPromiseRejected");
      function $a(e) {
        const t2 = e._ownerWritableStream, r2 = t2._state;
        return r2 === "errored" || r2 === "erroring" ? null : r2 === "closed" ? 0 : $o(t2._writableStreamController);
      }
      n$1($a, "WritableStreamDefaultWriterGetDesiredSize");
      function Io(e) {
        const t2 = e._ownerWritableStream, r2 = new TypeError("Writer was released and can no longer be used to monitor the stream's closedness");
        zo(e, r2), La(e, r2), t2._writer = void 0, e._ownerWritableStream = void 0;
      }
      n$1(Io, "WritableStreamDefaultWriterRelease");
      function Fo(e, t2) {
        const r2 = e._ownerWritableStream, s = r2._writableStreamController, u = Ua(s, t2);
        if (r2 !== e._ownerWritableStream) return b(Pt("write to"));
        const c = r2._state;
        if (c === "errored") return b(r2._storedError);
        if (he(r2) || c === "closed") return b(new TypeError("The stream is closing or closed and cannot be written to"));
        if (c === "erroring") return b(r2._storedError);
        const d = Aa(r2);
        return xa(s, t2, u), d;
      }
      n$1(Fo, "WritableStreamDefaultWriterWrite");
      const jo = {}, Tn = class Tn {
        constructor() {
          throw new TypeError("Illegal constructor");
        }
        get abortReason() {
          if (!rn(this)) throw on("abortReason");
          return this._abortReason;
        }
        get signal() {
          if (!rn(this)) throw on("signal");
          if (this._abortController === void 0) throw new TypeError("WritableStreamDefaultController.prototype.signal is not supported");
          return this._abortController.signal;
        }
        error(t2 = void 0) {
          if (!rn(this)) throw on("error");
          this._controlledWritableStream._state === "writable" && Do(this, t2);
        }
        [jt](t2) {
          const r2 = this._abortAlgorithm(t2);
          return Xt(this), r2;
        }
        [Qn]() {
          Be(this);
        }
      };
      n$1(Tn, "WritableStreamDefaultController");
      let ke = Tn;
      Object.defineProperties(ke.prototype, { abortReason: { enumerable: true }, signal: { enumerable: true }, error: { enumerable: true } }), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(ke.prototype, Symbol.toStringTag, { value: "WritableStreamDefaultController", configurable: true });
      function rn(e) {
        return !l(e) || !Object.prototype.hasOwnProperty.call(e, "_controlledWritableStream") ? false : e instanceof ke;
      }
      n$1(rn, "IsWritableStreamDefaultController");
      function Lo(e, t2, r2, s, u, c, d, m) {
        t2._controlledWritableStream = e, e._writableStreamController = t2, t2._queue = void 0, t2._queueTotalSize = void 0, Be(t2), t2._abortReason = void 0, t2._abortController = va(), t2._started = false, t2._strategySizeAlgorithm = m, t2._strategyHWM = d, t2._writeAlgorithm = s, t2._closeAlgorithm = u, t2._abortAlgorithm = c;
        const R = nn(t2);
        tn(e, R);
        const y = r2(), C = T2(y);
        g(C, () => (t2._started = true, er(t2), null), (P) => (t2._started = true, Jr(e, P), null));
      }
      n$1(Lo, "SetUpWritableStreamDefaultController");
      function Da(e, t2, r2, s) {
        const u = Object.create(ke.prototype);
        let c, d, m, R;
        t2.start !== void 0 ? c = n$1(() => t2.start(u), "startAlgorithm") : c = n$1(() => {
        }, "startAlgorithm"), t2.write !== void 0 ? d = n$1((y) => t2.write(y, u), "writeAlgorithm") : d = n$1(() => T2(void 0), "writeAlgorithm"), t2.close !== void 0 ? m = n$1(() => t2.close(), "closeAlgorithm") : m = n$1(() => T2(void 0), "closeAlgorithm"), t2.abort !== void 0 ? R = n$1((y) => t2.abort(y), "abortAlgorithm") : R = n$1(() => T2(void 0), "abortAlgorithm"), Lo(e, u, c, d, m, R, r2, s);
      }
      n$1(Da, "SetUpWritableStreamDefaultControllerFromUnderlyingSink");
      function Xt(e) {
        e._writeAlgorithm = void 0, e._closeAlgorithm = void 0, e._abortAlgorithm = void 0, e._strategySizeAlgorithm = void 0;
      }
      n$1(Xt, "WritableStreamDefaultControllerClearAlgorithms");
      function Ma(e) {
        Nr(e, jo, 0), er(e);
      }
      n$1(Ma, "WritableStreamDefaultControllerClose");
      function Ua(e, t2) {
        try {
          return e._strategySizeAlgorithm(t2);
        } catch (r2) {
          return Ct(e, r2), 1;
        }
      }
      n$1(Ua, "WritableStreamDefaultControllerGetChunkSize");
      function $o(e) {
        return e._strategyHWM - e._queueTotalSize;
      }
      n$1($o, "WritableStreamDefaultControllerGetDesiredSize");
      function xa(e, t2, r2) {
        try {
          Nr(e, t2, r2);
        } catch (u) {
          Ct(e, u);
          return;
        }
        const s = e._controlledWritableStream;
        if (!he(s) && s._state === "writable") {
          const u = nn(e);
          tn(s, u);
        }
        er(e);
      }
      n$1(xa, "WritableStreamDefaultControllerWrite");
      function er(e) {
        const t2 = e._controlledWritableStream;
        if (!e._started || t2._inFlightWriteRequest !== void 0) return;
        if (t2._state === "erroring") {
          en(t2);
          return;
        }
        if (e._queue.length === 0) return;
        const s = na(e);
        s === jo ? Na(e) : Ha(e, s);
      }
      n$1(er, "WritableStreamDefaultControllerAdvanceQueueIfNeeded");
      function Ct(e, t2) {
        e._controlledWritableStream._state === "writable" && Do(e, t2);
      }
      n$1(Ct, "WritableStreamDefaultControllerErrorIfNeeded");
      function Na(e) {
        const t2 = e._controlledWritableStream;
        za(t2), xr(e);
        const r2 = e._closeAlgorithm();
        Xt(e), g(r2, () => (Wa(t2), null), (s) => (qa(t2, s), null));
      }
      n$1(Na, "WritableStreamDefaultControllerProcessClose");
      function Ha(e, t2) {
        const r2 = e._controlledWritableStream;
        Ia(r2);
        const s = e._writeAlgorithm(t2);
        g(s, () => {
          Ba(r2);
          const u = r2._state;
          if (xr(e), !he(r2) && u === "writable") {
            const c = nn(e);
            tn(r2, c);
          }
          return er(e), null;
        }, (u) => (r2._state === "writable" && Xt(e), ka(r2, u), null));
      }
      n$1(Ha, "WritableStreamDefaultControllerProcessWrite");
      function nn(e) {
        return $o(e) <= 0;
      }
      n$1(nn, "WritableStreamDefaultControllerGetBackpressure");
      function Do(e, t2) {
        const r2 = e._controlledWritableStream;
        Xt(e), Xr(r2, t2);
      }
      n$1(Do, "WritableStreamDefaultControllerError");
      function tr(e) {
        return new TypeError(`WritableStream.prototype.${e} can only be used on a WritableStream`);
      }
      n$1(tr, "streamBrandCheckException$2");
      function on(e) {
        return new TypeError(`WritableStreamDefaultController.prototype.${e} can only be used on a WritableStreamDefaultController`);
      }
      n$1(on, "defaultControllerBrandCheckException$2");
      function $e(e) {
        return new TypeError(`WritableStreamDefaultWriter.prototype.${e} can only be used on a WritableStreamDefaultWriter`);
      }
      n$1($e, "defaultWriterBrandCheckException");
      function Pt(e) {
        return new TypeError("Cannot " + e + " a stream using a released writer");
      }
      n$1(Pt, "defaultWriterLockException");
      function rr(e) {
        e._closedPromise = A((t2, r2) => {
          e._closedPromise_resolve = t2, e._closedPromise_reject = r2, e._closedPromiseState = "pending";
        });
      }
      n$1(rr, "defaultWriterClosedPromiseInitialize");
      function Mo(e, t2) {
        rr(e), an(e, t2);
      }
      n$1(Mo, "defaultWriterClosedPromiseInitializeAsRejected");
      function Va(e) {
        rr(e), Uo(e);
      }
      n$1(Va, "defaultWriterClosedPromiseInitializeAsResolved");
      function an(e, t2) {
        e._closedPromise_reject !== void 0 && (Q(e._closedPromise), e._closedPromise_reject(t2), e._closedPromise_resolve = void 0, e._closedPromise_reject = void 0, e._closedPromiseState = "rejected");
      }
      n$1(an, "defaultWriterClosedPromiseReject");
      function Qa(e, t2) {
        Mo(e, t2);
      }
      n$1(Qa, "defaultWriterClosedPromiseResetToRejected");
      function Uo(e) {
        e._closedPromise_resolve !== void 0 && (e._closedPromise_resolve(void 0), e._closedPromise_resolve = void 0, e._closedPromise_reject = void 0, e._closedPromiseState = "resolved");
      }
      n$1(Uo, "defaultWriterClosedPromiseResolve");
      function nr(e) {
        e._readyPromise = A((t2, r2) => {
          e._readyPromise_resolve = t2, e._readyPromise_reject = r2;
        }), e._readyPromiseState = "pending";
      }
      n$1(nr, "defaultWriterReadyPromiseInitialize");
      function sn(e, t2) {
        nr(e), No(e, t2);
      }
      n$1(sn, "defaultWriterReadyPromiseInitializeAsRejected");
      function xo(e) {
        nr(e), ln(e);
      }
      n$1(xo, "defaultWriterReadyPromiseInitializeAsResolved");
      function No(e, t2) {
        e._readyPromise_reject !== void 0 && (Q(e._readyPromise), e._readyPromise_reject(t2), e._readyPromise_resolve = void 0, e._readyPromise_reject = void 0, e._readyPromiseState = "rejected");
      }
      n$1(No, "defaultWriterReadyPromiseReject");
      function Ya(e) {
        nr(e);
      }
      n$1(Ya, "defaultWriterReadyPromiseReset");
      function Ga(e, t2) {
        sn(e, t2);
      }
      n$1(Ga, "defaultWriterReadyPromiseResetToRejected");
      function ln(e) {
        e._readyPromise_resolve !== void 0 && (e._readyPromise_resolve(void 0), e._readyPromise_resolve = void 0, e._readyPromise_reject = void 0, e._readyPromiseState = "fulfilled");
      }
      n$1(ln, "defaultWriterReadyPromiseResolve");
      function Za() {
        if (typeof globalThis < "u") return globalThis;
        if (typeof self < "u") return self;
        if (typeof n$2 < "u") return n$2;
      }
      n$1(Za, "getGlobals");
      const un = Za();
      function Ka(e) {
        if (!(typeof e == "function" || typeof e == "object") || e.name !== "DOMException") return false;
        try {
          return new e(), true;
        } catch {
          return false;
        }
      }
      n$1(Ka, "isDOMExceptionConstructor");
      function Ja() {
        const e = un?.DOMException;
        return Ka(e) ? e : void 0;
      }
      n$1(Ja, "getFromGlobal");
      function Xa() {
        const e = n$1(function(r2, s) {
          this.message = r2 || "", this.name = s || "Error", Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
        }, "DOMException");
        return h(e, "DOMException"), e.prototype = Object.create(Error.prototype), Object.defineProperty(e.prototype, "constructor", { value: e, writable: true, configurable: true }), e;
      }
      n$1(Xa, "createPolyfill");
      const es = Ja() || Xa();
      function Ho(e, t2, r2, s, u, c) {
        const d = Qe(e), m = ko(t2);
        e._disturbed = true;
        let R = false, y = T2(void 0);
        return A((C, P) => {
          let B;
          if (c !== void 0) {
            if (B = n$1(() => {
              const _ = c.reason !== void 0 ? c.reason : new es("Aborted", "AbortError"), E = [];
              s || E.push(() => t2._state === "writable" ? Kt(t2, _) : T2(void 0)), u || E.push(() => e._state === "readable" ? ie(e, _) : T2(void 0)), N(() => Promise.all(E.map((k) => k())), true, _);
            }, "abortAlgorithm"), c.aborted) {
              B();
              return;
            }
            c.addEventListener("abort", B);
          }
          function ae() {
            return A((_, E) => {
              function k(Y) {
                Y ? _() : q(nt(), k, E);
              }
              n$1(k, "next"), k(false);
            });
          }
          n$1(ae, "pipeLoop");
          function nt() {
            return R ? T2(true) : q(m._readyPromise, () => A((_, E) => {
              _t(d, { _chunkSteps: n$1((k) => {
                y = q(Fo(m, k), void 0, f2), _(false);
              }, "_chunkSteps"), _closeSteps: n$1(() => _(true), "_closeSteps"), _errorSteps: E });
            }));
          }
          if (n$1(nt, "pipeStep"), Te(e, d._closedPromise, (_) => (s ? J(true, _) : N(() => Kt(t2, _), true, _), null)), Te(t2, m._closedPromise, (_) => (u ? J(true, _) : N(() => ie(e, _), true, _), null)), x(e, d._closedPromise, () => (r2 ? J() : N(() => ja(m)), null)), he(t2) || t2._state === "closed") {
            const _ = new TypeError("the destination writable stream closed before all data could be piped to it");
            u ? J(true, _) : N(() => ie(e, _), true, _);
          }
          Q(ae());
          function Oe() {
            const _ = y;
            return q(y, () => _ !== y ? Oe() : void 0);
          }
          n$1(Oe, "waitForWritesToFinish");
          function Te(_, E, k) {
            _._state === "errored" ? k(_._storedError) : I(E, k);
          }
          n$1(Te, "isOrBecomesErrored");
          function x(_, E, k) {
            _._state === "closed" ? k() : V(E, k);
          }
          n$1(x, "isOrBecomesClosed");
          function N(_, E, k) {
            if (R) return;
            R = true, t2._state === "writable" && !he(t2) ? V(Oe(), Y) : Y();
            function Y() {
              return g(_(), () => Ce(E, k), (ot) => Ce(true, ot)), null;
            }
            n$1(Y, "doTheRest");
          }
          n$1(N, "shutdownWithAction");
          function J(_, E) {
            R || (R = true, t2._state === "writable" && !he(t2) ? V(Oe(), () => Ce(_, E)) : Ce(_, E));
          }
          n$1(J, "shutdown");
          function Ce(_, E) {
            return Io(m), _e(d), c !== void 0 && c.removeEventListener("abort", B), _ ? P(E) : C(void 0), null;
          }
          n$1(Ce, "finalize");
        });
      }
      n$1(Ho, "ReadableStreamPipeTo");
      const Cn = class Cn {
        constructor() {
          throw new TypeError("Illegal constructor");
        }
        get desiredSize() {
          if (!or(this)) throw ar("desiredSize");
          return fn(this);
        }
        close() {
          if (!or(this)) throw ar("close");
          if (!Je(this)) throw new TypeError("The stream is not in a state that permits close");
          De(this);
        }
        enqueue(t2 = void 0) {
          if (!or(this)) throw ar("enqueue");
          if (!Je(this)) throw new TypeError("The stream is not in a state that permits enqueue");
          return Ke(this, t2);
        }
        error(t2 = void 0) {
          if (!or(this)) throw ar("error");
          oe(this, t2);
        }
        [Ar](t2) {
          Be(this);
          const r2 = this._cancelAlgorithm(t2);
          return ir(this), r2;
        }
        [Br](t2) {
          const r2 = this._controlledReadableStream;
          if (this._queue.length > 0) {
            const s = xr(this);
            this._closeRequested && this._queue.length === 0 ? (ir(this), At(r2)) : vt(this), t2._chunkSteps(s);
          } else eo(r2, t2), vt(this);
        }
        [kr]() {
        }
      };
      n$1(Cn, "ReadableStreamDefaultController");
      let ne = Cn;
      Object.defineProperties(ne.prototype, { close: { enumerable: true }, enqueue: { enumerable: true }, error: { enumerable: true }, desiredSize: { enumerable: true } }), h(ne.prototype.close, "close"), h(ne.prototype.enqueue, "enqueue"), h(ne.prototype.error, "error"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(ne.prototype, Symbol.toStringTag, { value: "ReadableStreamDefaultController", configurable: true });
      function or(e) {
        return !l(e) || !Object.prototype.hasOwnProperty.call(e, "_controlledReadableStream") ? false : e instanceof ne;
      }
      n$1(or, "IsReadableStreamDefaultController");
      function vt(e) {
        if (!Vo(e)) return;
        if (e._pulling) {
          e._pullAgain = true;
          return;
        }
        e._pulling = true;
        const r2 = e._pullAlgorithm();
        g(r2, () => (e._pulling = false, e._pullAgain && (e._pullAgain = false, vt(e)), null), (s) => (oe(e, s), null));
      }
      n$1(vt, "ReadableStreamDefaultControllerCallPullIfNeeded");
      function Vo(e) {
        const t2 = e._controlledReadableStream;
        return !Je(e) || !e._started ? false : !!(qe(t2) && $t(t2) > 0 || fn(e) > 0);
      }
      n$1(Vo, "ReadableStreamDefaultControllerShouldCallPull");
      function ir(e) {
        e._pullAlgorithm = void 0, e._cancelAlgorithm = void 0, e._strategySizeAlgorithm = void 0;
      }
      n$1(ir, "ReadableStreamDefaultControllerClearAlgorithms");
      function De(e) {
        if (!Je(e)) return;
        const t2 = e._controlledReadableStream;
        e._closeRequested = true, e._queue.length === 0 && (ir(e), At(t2));
      }
      n$1(De, "ReadableStreamDefaultControllerClose");
      function Ke(e, t2) {
        if (!Je(e)) return;
        const r2 = e._controlledReadableStream;
        if (qe(r2) && $t(r2) > 0) Lr(r2, t2, false);
        else {
          let s;
          try {
            s = e._strategySizeAlgorithm(t2);
          } catch (u) {
            throw oe(e, u), u;
          }
          try {
            Nr(e, t2, s);
          } catch (u) {
            throw oe(e, u), u;
          }
        }
        vt(e);
      }
      n$1(Ke, "ReadableStreamDefaultControllerEnqueue");
      function oe(e, t2) {
        const r2 = e._controlledReadableStream;
        r2._state === "readable" && (Be(e), ir(e), Zo(r2, t2));
      }
      n$1(oe, "ReadableStreamDefaultControllerError");
      function fn(e) {
        const t2 = e._controlledReadableStream._state;
        return t2 === "errored" ? null : t2 === "closed" ? 0 : e._strategyHWM - e._queueTotalSize;
      }
      n$1(fn, "ReadableStreamDefaultControllerGetDesiredSize");
      function ts(e) {
        return !Vo(e);
      }
      n$1(ts, "ReadableStreamDefaultControllerHasBackpressure");
      function Je(e) {
        const t2 = e._controlledReadableStream._state;
        return !e._closeRequested && t2 === "readable";
      }
      n$1(Je, "ReadableStreamDefaultControllerCanCloseOrEnqueue");
      function Qo(e, t2, r2, s, u, c, d) {
        t2._controlledReadableStream = e, t2._queue = void 0, t2._queueTotalSize = void 0, Be(t2), t2._started = false, t2._closeRequested = false, t2._pullAgain = false, t2._pulling = false, t2._strategySizeAlgorithm = d, t2._strategyHWM = c, t2._pullAlgorithm = s, t2._cancelAlgorithm = u, e._readableStreamController = t2;
        const m = r2();
        g(T2(m), () => (t2._started = true, vt(t2), null), (R) => (oe(t2, R), null));
      }
      n$1(Qo, "SetUpReadableStreamDefaultController");
      function rs(e, t2, r2, s) {
        const u = Object.create(ne.prototype);
        let c, d, m;
        t2.start !== void 0 ? c = n$1(() => t2.start(u), "startAlgorithm") : c = n$1(() => {
        }, "startAlgorithm"), t2.pull !== void 0 ? d = n$1(() => t2.pull(u), "pullAlgorithm") : d = n$1(() => T2(void 0), "pullAlgorithm"), t2.cancel !== void 0 ? m = n$1((R) => t2.cancel(R), "cancelAlgorithm") : m = n$1(() => T2(void 0), "cancelAlgorithm"), Qo(e, u, c, d, m, r2, s);
      }
      n$1(rs, "SetUpReadableStreamDefaultControllerFromUnderlyingSource");
      function ar(e) {
        return new TypeError(`ReadableStreamDefaultController.prototype.${e} can only be used on a ReadableStreamDefaultController`);
      }
      n$1(ar, "defaultControllerBrandCheckException$1");
      function ns(e, t2) {
        return Ie(e._readableStreamController) ? is(e) : os2(e);
      }
      n$1(ns, "ReadableStreamTee");
      function os2(e, t2) {
        const r2 = Qe(e);
        let s = false, u = false, c = false, d = false, m, R, y, C, P;
        const B = A((x) => {
          P = x;
        });
        function ae() {
          return s ? (u = true, T2(void 0)) : (s = true, _t(r2, { _chunkSteps: n$1((N) => {
            ge(() => {
              u = false;
              const J = N, Ce = N;
              c || Ke(y._readableStreamController, J), d || Ke(C._readableStreamController, Ce), s = false, u && ae();
            });
          }, "_chunkSteps"), _closeSteps: n$1(() => {
            s = false, c || De(y._readableStreamController), d || De(C._readableStreamController), (!c || !d) && P(void 0);
          }, "_closeSteps"), _errorSteps: n$1(() => {
            s = false;
          }, "_errorSteps") }), T2(void 0));
        }
        n$1(ae, "pullAlgorithm");
        function nt(x) {
          if (c = true, m = x, d) {
            const N = St([m, R]), J = ie(e, N);
            P(J);
          }
          return B;
        }
        n$1(nt, "cancel1Algorithm");
        function Oe(x) {
          if (d = true, R = x, c) {
            const N = St([m, R]), J = ie(e, N);
            P(J);
          }
          return B;
        }
        n$1(Oe, "cancel2Algorithm");
        function Te() {
        }
        return n$1(Te, "startAlgorithm"), y = Et(Te, ae, nt), C = Et(Te, ae, Oe), I(r2._closedPromise, (x) => (oe(y._readableStreamController, x), oe(C._readableStreamController, x), (!c || !d) && P(void 0), null)), [y, C];
      }
      n$1(os2, "ReadableStreamDefaultTee");
      function is(e) {
        let t2 = Qe(e), r2 = false, s = false, u = false, c = false, d = false, m, R, y, C, P;
        const B = A((_) => {
          P = _;
        });
        function ae(_) {
          I(_._closedPromise, (E) => (_ !== t2 || (K(y._readableStreamController, E), K(C._readableStreamController, E), (!c || !d) && P(void 0)), null));
        }
        n$1(ae, "forwardReaderError");
        function nt() {
          je(t2) && (_e(t2), t2 = Qe(e), ae(t2)), _t(t2, { _chunkSteps: n$1((E) => {
            ge(() => {
              s = false, u = false;
              const k = E;
              let Y = E;
              if (!c && !d) try {
                Y = fo(E);
              } catch (ot) {
                K(y._readableStreamController, ot), K(C._readableStreamController, ot), P(ie(e, ot));
                return;
              }
              c || Ht(y._readableStreamController, k), d || Ht(C._readableStreamController, Y), r2 = false, s ? Te() : u && x();
            });
          }, "_chunkSteps"), _closeSteps: n$1(() => {
            r2 = false, c || wt(y._readableStreamController), d || wt(C._readableStreamController), y._readableStreamController._pendingPullIntos.length > 0 && Vt(y._readableStreamController, 0), C._readableStreamController._pendingPullIntos.length > 0 && Vt(C._readableStreamController, 0), (!c || !d) && P(void 0);
          }, "_closeSteps"), _errorSteps: n$1(() => {
            r2 = false;
          }, "_errorSteps") });
        }
        n$1(nt, "pullWithDefaultReader");
        function Oe(_, E) {
          Ee(t2) && (_e(t2), t2 = Co(e), ae(t2));
          const k = E ? C : y, Y = E ? y : C;
          Eo(t2, _, 1, { _chunkSteps: n$1((it) => {
            ge(() => {
              s = false, u = false;
              const at = E ? d : c;
              if (E ? c : d) at || Qt(k._readableStreamController, it);
              else {
                let ui;
                try {
                  ui = fo(it);
                } catch (kn) {
                  K(k._readableStreamController, kn), K(Y._readableStreamController, kn), P(ie(e, kn));
                  return;
                }
                at || Qt(k._readableStreamController, it), Ht(Y._readableStreamController, ui);
              }
              r2 = false, s ? Te() : u && x();
            });
          }, "_chunkSteps"), _closeSteps: n$1((it) => {
            r2 = false;
            const at = E ? d : c, cr = E ? c : d;
            at || wt(k._readableStreamController), cr || wt(Y._readableStreamController), it !== void 0 && (at || Qt(k._readableStreamController, it), !cr && Y._readableStreamController._pendingPullIntos.length > 0 && Vt(Y._readableStreamController, 0)), (!at || !cr) && P(void 0);
          }, "_closeSteps"), _errorSteps: n$1(() => {
            r2 = false;
          }, "_errorSteps") });
        }
        n$1(Oe, "pullWithBYOBReader");
        function Te() {
          if (r2) return s = true, T2(void 0);
          r2 = true;
          const _ = Gr(y._readableStreamController);
          return _ === null ? nt() : Oe(_._view, false), T2(void 0);
        }
        n$1(Te, "pull1Algorithm");
        function x() {
          if (r2) return u = true, T2(void 0);
          r2 = true;
          const _ = Gr(C._readableStreamController);
          return _ === null ? nt() : Oe(_._view, true), T2(void 0);
        }
        n$1(x, "pull2Algorithm");
        function N(_) {
          if (c = true, m = _, d) {
            const E = St([m, R]), k = ie(e, E);
            P(k);
          }
          return B;
        }
        n$1(N, "cancel1Algorithm");
        function J(_) {
          if (d = true, R = _, c) {
            const E = St([m, R]), k = ie(e, E);
            P(k);
          }
          return B;
        }
        n$1(J, "cancel2Algorithm");
        function Ce() {
        }
        return n$1(Ce, "startAlgorithm"), y = Go(Ce, Te, N), C = Go(Ce, x, J), ae(t2), [y, C];
      }
      n$1(is, "ReadableByteStreamTee");
      function as(e) {
        return l(e) && typeof e.getReader < "u";
      }
      n$1(as, "isReadableStreamLike");
      function ss(e) {
        return as(e) ? us(e.getReader()) : ls(e);
      }
      n$1(ss, "ReadableStreamFrom");
      function ls(e) {
        let t2;
        const r2 = uo(e, "async"), s = f2;
        function u() {
          let d;
          try {
            d = Xi(r2);
          } catch (R) {
            return b(R);
          }
          const m = T2(d);
          return F(m, (R) => {
            if (!l(R)) throw new TypeError("The promise returned by the iterator.next() method must fulfill with an object");
            if (ea(R)) De(t2._readableStreamController);
            else {
              const C = ta(R);
              Ke(t2._readableStreamController, C);
            }
          });
        }
        n$1(u, "pullAlgorithm");
        function c(d) {
          const m = r2.iterator;
          let R;
          try {
            R = Ut(m, "return");
          } catch (P) {
            return b(P);
          }
          if (R === void 0) return T2(void 0);
          let y;
          try {
            y = z(R, m, [d]);
          } catch (P) {
            return b(P);
          }
          const C = T2(y);
          return F(C, (P) => {
            if (!l(P)) throw new TypeError("The promise returned by the iterator.return() method must fulfill with an object");
          });
        }
        return n$1(c, "cancelAlgorithm"), t2 = Et(s, u, c, 0), t2;
      }
      n$1(ls, "ReadableStreamFromIterable");
      function us(e) {
        let t2;
        const r2 = f2;
        function s() {
          let c;
          try {
            c = e.read();
          } catch (d) {
            return b(d);
          }
          return F(c, (d) => {
            if (!l(d)) throw new TypeError("The promise returned by the reader.read() method must fulfill with an object");
            if (d.done) De(t2._readableStreamController);
            else {
              const m = d.value;
              Ke(t2._readableStreamController, m);
            }
          });
        }
        n$1(s, "pullAlgorithm");
        function u(c) {
          try {
            return T2(e.cancel(c));
          } catch (d) {
            return b(d);
          }
        }
        return n$1(u, "cancelAlgorithm"), t2 = Et(r2, s, u, 0), t2;
      }
      n$1(us, "ReadableStreamFromDefaultReader");
      function fs2(e, t2) {
        ue(e, t2);
        const r2 = e, s = r2?.autoAllocateChunkSize, u = r2?.cancel, c = r2?.pull, d = r2?.start, m = r2?.type;
        return { autoAllocateChunkSize: s === void 0 ? void 0 : Fr(s, `${t2} has member 'autoAllocateChunkSize' that`), cancel: u === void 0 ? void 0 : cs(u, r2, `${t2} has member 'cancel' that`), pull: c === void 0 ? void 0 : ds(c, r2, `${t2} has member 'pull' that`), start: d === void 0 ? void 0 : hs(d, r2, `${t2} has member 'start' that`), type: m === void 0 ? void 0 : ps(m, `${t2} has member 'type' that`) };
      }
      n$1(fs2, "convertUnderlyingDefaultOrByteSource");
      function cs(e, t2, r2) {
        return Z(e, r2), (s) => j(e, t2, [s]);
      }
      n$1(cs, "convertUnderlyingSourceCancelCallback");
      function ds(e, t2, r2) {
        return Z(e, r2), (s) => j(e, t2, [s]);
      }
      n$1(ds, "convertUnderlyingSourcePullCallback");
      function hs(e, t2, r2) {
        return Z(e, r2), (s) => z(e, t2, [s]);
      }
      n$1(hs, "convertUnderlyingSourceStartCallback");
      function ps(e, t2) {
        if (e = `${e}`, e !== "bytes") throw new TypeError(`${t2} '${e}' is not a valid enumeration value for ReadableStreamType`);
        return e;
      }
      n$1(ps, "convertReadableStreamType");
      function bs(e, t2) {
        return ue(e, t2), { preventCancel: !!e?.preventCancel };
      }
      n$1(bs, "convertIteratorOptions");
      function Yo(e, t2) {
        ue(e, t2);
        const r2 = e?.preventAbort, s = e?.preventCancel, u = e?.preventClose, c = e?.signal;
        return c !== void 0 && ms(c, `${t2} has member 'signal' that`), { preventAbort: !!r2, preventCancel: !!s, preventClose: !!u, signal: c };
      }
      n$1(Yo, "convertPipeOptions");
      function ms(e, t2) {
        if (!Ca(e)) throw new TypeError(`${t2} is not an AbortSignal.`);
      }
      n$1(ms, "assertAbortSignal");
      function ys(e, t2) {
        ue(e, t2);
        const r2 = e?.readable;
        zr(r2, "readable", "ReadableWritablePair"), jr(r2, `${t2} has member 'readable' that`);
        const s = e?.writable;
        return zr(s, "writable", "ReadableWritablePair"), Bo(s, `${t2} has member 'writable' that`), { readable: r2, writable: s };
      }
      n$1(ys, "convertReadableWritablePair");
      const Pn = class Pn {
        constructor(t2 = {}, r2 = {}) {
          t2 === void 0 ? t2 = null : Jn(t2, "First parameter");
          const s = Zt(r2, "Second parameter"), u = fs2(t2, "First parameter");
          if (cn(this), u.type === "bytes") {
            if (s.size !== void 0) throw new RangeError("The strategy for a byte stream cannot have a size function");
            const c = Tt(s, 0);
            ca(this, u, c);
          } else {
            const c = Gt(s), d = Tt(s, 1);
            rs(this, u, d, c);
          }
        }
        get locked() {
          if (!We(this)) throw Me("locked");
          return qe(this);
        }
        cancel(t2 = void 0) {
          return We(this) ? qe(this) ? b(new TypeError("Cannot cancel a stream that already has a reader")) : ie(this, t2) : b(Me("cancel"));
        }
        getReader(t2 = void 0) {
          if (!We(this)) throw Me("getReader");
          return ha(t2, "First parameter").mode === void 0 ? Qe(this) : Co(this);
        }
        pipeThrough(t2, r2 = {}) {
          if (!We(this)) throw Me("pipeThrough");
          Se(t2, 1, "pipeThrough");
          const s = ys(t2, "First parameter"), u = Yo(r2, "Second parameter");
          if (qe(this)) throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream");
          if (Ze(s.writable)) throw new TypeError("ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream");
          const c = Ho(this, s.writable, u.preventClose, u.preventAbort, u.preventCancel, u.signal);
          return Q(c), s.readable;
        }
        pipeTo(t2, r2 = {}) {
          if (!We(this)) return b(Me("pipeTo"));
          if (t2 === void 0) return b("Parameter 1 is required in 'pipeTo'.");
          if (!Ge(t2)) return b(new TypeError("ReadableStream.prototype.pipeTo's first argument must be a WritableStream"));
          let s;
          try {
            s = Yo(r2, "Second parameter");
          } catch (u) {
            return b(u);
          }
          return qe(this) ? b(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream")) : Ze(t2) ? b(new TypeError("ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream")) : Ho(this, t2, s.preventClose, s.preventAbort, s.preventCancel, s.signal);
        }
        tee() {
          if (!We(this)) throw Me("tee");
          const t2 = ns(this);
          return St(t2);
        }
        values(t2 = void 0) {
          if (!We(this)) throw Me("values");
          const r2 = bs(t2, "First parameter");
          return Ki(this, r2.preventCancel);
        }
        [Ur](t2) {
          return this.values(t2);
        }
        static from(t2) {
          return ss(t2);
        }
      };
      n$1(Pn, "ReadableStream");
      let L = Pn;
      Object.defineProperties(L, { from: { enumerable: true } }), Object.defineProperties(L.prototype, { cancel: { enumerable: true }, getReader: { enumerable: true }, pipeThrough: { enumerable: true }, pipeTo: { enumerable: true }, tee: { enumerable: true }, values: { enumerable: true }, locked: { enumerable: true } }), h(L.from, "from"), h(L.prototype.cancel, "cancel"), h(L.prototype.getReader, "getReader"), h(L.prototype.pipeThrough, "pipeThrough"), h(L.prototype.pipeTo, "pipeTo"), h(L.prototype.tee, "tee"), h(L.prototype.values, "values"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(L.prototype, Symbol.toStringTag, { value: "ReadableStream", configurable: true }), Object.defineProperty(L.prototype, Ur, { value: L.prototype.values, writable: true, configurable: true });
      function Et(e, t2, r2, s = 1, u = () => 1) {
        const c = Object.create(L.prototype);
        cn(c);
        const d = Object.create(ne.prototype);
        return Qo(c, d, e, t2, r2, s, u), c;
      }
      n$1(Et, "CreateReadableStream");
      function Go(e, t2, r2) {
        const s = Object.create(L.prototype);
        cn(s);
        const u = Object.create(te.prototype);
        return To(s, u, e, t2, r2, 0, void 0), s;
      }
      n$1(Go, "CreateReadableByteStream");
      function cn(e) {
        e._state = "readable", e._reader = void 0, e._storedError = void 0, e._disturbed = false;
      }
      n$1(cn, "InitializeReadableStream");
      function We(e) {
        return !l(e) || !Object.prototype.hasOwnProperty.call(e, "_readableStreamController") ? false : e instanceof L;
      }
      n$1(We, "IsReadableStream");
      function qe(e) {
        return e._reader !== void 0;
      }
      n$1(qe, "IsReadableStreamLocked");
      function ie(e, t2) {
        if (e._disturbed = true, e._state === "closed") return T2(void 0);
        if (e._state === "errored") return b(e._storedError);
        At(e);
        const r2 = e._reader;
        if (r2 !== void 0 && je(r2)) {
          const u = r2._readIntoRequests;
          r2._readIntoRequests = new D(), u.forEach((c) => {
            c._closeSteps(void 0);
          });
        }
        const s = e._readableStreamController[Ar](t2);
        return F(s, f2);
      }
      n$1(ie, "ReadableStreamCancel");
      function At(e) {
        e._state = "closed";
        const t2 = e._reader;
        if (t2 !== void 0 && (Zn(t2), Ee(t2))) {
          const r2 = t2._readRequests;
          t2._readRequests = new D(), r2.forEach((s) => {
            s._closeSteps();
          });
        }
      }
      n$1(At, "ReadableStreamClose");
      function Zo(e, t2) {
        e._state = "errored", e._storedError = t2;
        const r2 = e._reader;
        r2 !== void 0 && (Or(r2, t2), Ee(r2) ? ro(r2, t2) : Ao(r2, t2));
      }
      n$1(Zo, "ReadableStreamError");
      function Me(e) {
        return new TypeError(`ReadableStream.prototype.${e} can only be used on a ReadableStream`);
      }
      n$1(Me, "streamBrandCheckException$1");
      function Ko(e, t2) {
        ue(e, t2);
        const r2 = e?.highWaterMark;
        return zr(r2, "highWaterMark", "QueuingStrategyInit"), { highWaterMark: Ir(r2) };
      }
      n$1(Ko, "convertQueuingStrategyInit");
      const Jo = n$1((e) => e.byteLength, "byteLengthSizeFunction");
      h(Jo, "size");
      const vn = class vn {
        constructor(t2) {
          Se(t2, 1, "ByteLengthQueuingStrategy"), t2 = Ko(t2, "First parameter"), this._byteLengthQueuingStrategyHighWaterMark = t2.highWaterMark;
        }
        get highWaterMark() {
          if (!ei(this)) throw Xo("highWaterMark");
          return this._byteLengthQueuingStrategyHighWaterMark;
        }
        get size() {
          if (!ei(this)) throw Xo("size");
          return Jo;
        }
      };
      n$1(vn, "ByteLengthQueuingStrategy");
      let Xe = vn;
      Object.defineProperties(Xe.prototype, { highWaterMark: { enumerable: true }, size: { enumerable: true } }), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(Xe.prototype, Symbol.toStringTag, { value: "ByteLengthQueuingStrategy", configurable: true });
      function Xo(e) {
        return new TypeError(`ByteLengthQueuingStrategy.prototype.${e} can only be used on a ByteLengthQueuingStrategy`);
      }
      n$1(Xo, "byteLengthBrandCheckException");
      function ei(e) {
        return !l(e) || !Object.prototype.hasOwnProperty.call(e, "_byteLengthQueuingStrategyHighWaterMark") ? false : e instanceof Xe;
      }
      n$1(ei, "IsByteLengthQueuingStrategy");
      const ti = n$1(() => 1, "countSizeFunction");
      h(ti, "size");
      const En = class En {
        constructor(t2) {
          Se(t2, 1, "CountQueuingStrategy"), t2 = Ko(t2, "First parameter"), this._countQueuingStrategyHighWaterMark = t2.highWaterMark;
        }
        get highWaterMark() {
          if (!ni(this)) throw ri("highWaterMark");
          return this._countQueuingStrategyHighWaterMark;
        }
        get size() {
          if (!ni(this)) throw ri("size");
          return ti;
        }
      };
      n$1(En, "CountQueuingStrategy");
      let et = En;
      Object.defineProperties(et.prototype, { highWaterMark: { enumerable: true }, size: { enumerable: true } }), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(et.prototype, Symbol.toStringTag, { value: "CountQueuingStrategy", configurable: true });
      function ri(e) {
        return new TypeError(`CountQueuingStrategy.prototype.${e} can only be used on a CountQueuingStrategy`);
      }
      n$1(ri, "countBrandCheckException");
      function ni(e) {
        return !l(e) || !Object.prototype.hasOwnProperty.call(e, "_countQueuingStrategyHighWaterMark") ? false : e instanceof et;
      }
      n$1(ni, "IsCountQueuingStrategy");
      function gs(e, t2) {
        ue(e, t2);
        const r2 = e?.cancel, s = e?.flush, u = e?.readableType, c = e?.start, d = e?.transform, m = e?.writableType;
        return { cancel: r2 === void 0 ? void 0 : Rs(r2, e, `${t2} has member 'cancel' that`), flush: s === void 0 ? void 0 : _s(s, e, `${t2} has member 'flush' that`), readableType: u, start: c === void 0 ? void 0 : Ss(c, e, `${t2} has member 'start' that`), transform: d === void 0 ? void 0 : ws(d, e, `${t2} has member 'transform' that`), writableType: m };
      }
      n$1(gs, "convertTransformer");
      function _s(e, t2, r2) {
        return Z(e, r2), (s) => j(e, t2, [s]);
      }
      n$1(_s, "convertTransformerFlushCallback");
      function Ss(e, t2, r2) {
        return Z(e, r2), (s) => z(e, t2, [s]);
      }
      n$1(Ss, "convertTransformerStartCallback");
      function ws(e, t2, r2) {
        return Z(e, r2), (s, u) => j(e, t2, [s, u]);
      }
      n$1(ws, "convertTransformerTransformCallback");
      function Rs(e, t2, r2) {
        return Z(e, r2), (s) => j(e, t2, [s]);
      }
      n$1(Rs, "convertTransformerCancelCallback");
      const An = class An {
        constructor(t2 = {}, r2 = {}, s = {}) {
          t2 === void 0 && (t2 = null);
          const u = Zt(r2, "Second parameter"), c = Zt(s, "Third parameter"), d = gs(t2, "First parameter");
          if (d.readableType !== void 0) throw new RangeError("Invalid readableType specified");
          if (d.writableType !== void 0) throw new RangeError("Invalid writableType specified");
          const m = Tt(c, 0), R = Gt(c), y = Tt(u, 1), C = Gt(u);
          let P;
          const B = A((ae) => {
            P = ae;
          });
          Ts(this, B, y, C, m, R), Ps(this, d), d.start !== void 0 ? P(d.start(this._transformStreamController)) : P(void 0);
        }
        get readable() {
          if (!oi(this)) throw li("readable");
          return this._readable;
        }
        get writable() {
          if (!oi(this)) throw li("writable");
          return this._writable;
        }
      };
      n$1(An, "TransformStream");
      let tt = An;
      Object.defineProperties(tt.prototype, { readable: { enumerable: true }, writable: { enumerable: true } }), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(tt.prototype, Symbol.toStringTag, { value: "TransformStream", configurable: true });
      function Ts(e, t2, r2, s, u, c) {
        function d() {
          return t2;
        }
        n$1(d, "startAlgorithm");
        function m(B) {
          return As(e, B);
        }
        n$1(m, "writeAlgorithm");
        function R(B) {
          return Bs(e, B);
        }
        n$1(R, "abortAlgorithm");
        function y() {
          return ks(e);
        }
        n$1(y, "closeAlgorithm"), e._writable = Ea(d, m, y, R, r2, s);
        function C() {
          return Ws(e);
        }
        n$1(C, "pullAlgorithm");
        function P(B) {
          return qs(e, B);
        }
        n$1(P, "cancelAlgorithm"), e._readable = Et(d, C, P, u, c), e._backpressure = void 0, e._backpressureChangePromise = void 0, e._backpressureChangePromise_resolve = void 0, sr(e, true), e._transformStreamController = void 0;
      }
      n$1(Ts, "InitializeTransformStream");
      function oi(e) {
        return !l(e) || !Object.prototype.hasOwnProperty.call(e, "_transformStreamController") ? false : e instanceof tt;
      }
      n$1(oi, "IsTransformStream");
      function ii(e, t2) {
        oe(e._readable._readableStreamController, t2), dn(e, t2);
      }
      n$1(ii, "TransformStreamError");
      function dn(e, t2) {
        ur(e._transformStreamController), Ct(e._writable._writableStreamController, t2), hn(e);
      }
      n$1(dn, "TransformStreamErrorWritableAndUnblockWrite");
      function hn(e) {
        e._backpressure && sr(e, false);
      }
      n$1(hn, "TransformStreamUnblockWrite");
      function sr(e, t2) {
        e._backpressureChangePromise !== void 0 && e._backpressureChangePromise_resolve(), e._backpressureChangePromise = A((r2) => {
          e._backpressureChangePromise_resolve = r2;
        }), e._backpressure = t2;
      }
      n$1(sr, "TransformStreamSetBackpressure");
      const Bn = class Bn {
        constructor() {
          throw new TypeError("Illegal constructor");
        }
        get desiredSize() {
          if (!lr(this)) throw fr("desiredSize");
          const t2 = this._controlledTransformStream._readable._readableStreamController;
          return fn(t2);
        }
        enqueue(t2 = void 0) {
          if (!lr(this)) throw fr("enqueue");
          ai(this, t2);
        }
        error(t2 = void 0) {
          if (!lr(this)) throw fr("error");
          vs(this, t2);
        }
        terminate() {
          if (!lr(this)) throw fr("terminate");
          Es(this);
        }
      };
      n$1(Bn, "TransformStreamDefaultController");
      let pe = Bn;
      Object.defineProperties(pe.prototype, { enqueue: { enumerable: true }, error: { enumerable: true }, terminate: { enumerable: true }, desiredSize: { enumerable: true } }), h(pe.prototype.enqueue, "enqueue"), h(pe.prototype.error, "error"), h(pe.prototype.terminate, "terminate"), typeof Symbol.toStringTag == "symbol" && Object.defineProperty(pe.prototype, Symbol.toStringTag, { value: "TransformStreamDefaultController", configurable: true });
      function lr(e) {
        return !l(e) || !Object.prototype.hasOwnProperty.call(e, "_controlledTransformStream") ? false : e instanceof pe;
      }
      n$1(lr, "IsTransformStreamDefaultController");
      function Cs(e, t2, r2, s, u) {
        t2._controlledTransformStream = e, e._transformStreamController = t2, t2._transformAlgorithm = r2, t2._flushAlgorithm = s, t2._cancelAlgorithm = u, t2._finishPromise = void 0, t2._finishPromise_resolve = void 0, t2._finishPromise_reject = void 0;
      }
      n$1(Cs, "SetUpTransformStreamDefaultController");
      function Ps(e, t2) {
        const r2 = Object.create(pe.prototype);
        let s, u, c;
        t2.transform !== void 0 ? s = n$1((d) => t2.transform(d, r2), "transformAlgorithm") : s = n$1((d) => {
          try {
            return ai(r2, d), T2(void 0);
          } catch (m) {
            return b(m);
          }
        }, "transformAlgorithm"), t2.flush !== void 0 ? u = n$1(() => t2.flush(r2), "flushAlgorithm") : u = n$1(() => T2(void 0), "flushAlgorithm"), t2.cancel !== void 0 ? c = n$1((d) => t2.cancel(d), "cancelAlgorithm") : c = n$1(() => T2(void 0), "cancelAlgorithm"), Cs(e, r2, s, u, c);
      }
      n$1(Ps, "SetUpTransformStreamDefaultControllerFromTransformer");
      function ur(e) {
        e._transformAlgorithm = void 0, e._flushAlgorithm = void 0, e._cancelAlgorithm = void 0;
      }
      n$1(ur, "TransformStreamDefaultControllerClearAlgorithms");
      function ai(e, t2) {
        const r2 = e._controlledTransformStream, s = r2._readable._readableStreamController;
        if (!Je(s)) throw new TypeError("Readable side is not in a state that permits enqueue");
        try {
          Ke(s, t2);
        } catch (c) {
          throw dn(r2, c), r2._readable._storedError;
        }
        ts(s) !== r2._backpressure && sr(r2, true);
      }
      n$1(ai, "TransformStreamDefaultControllerEnqueue");
      function vs(e, t2) {
        ii(e._controlledTransformStream, t2);
      }
      n$1(vs, "TransformStreamDefaultControllerError");
      function si(e, t2) {
        const r2 = e._transformAlgorithm(t2);
        return F(r2, void 0, (s) => {
          throw ii(e._controlledTransformStream, s), s;
        });
      }
      n$1(si, "TransformStreamDefaultControllerPerformTransform");
      function Es(e) {
        const t2 = e._controlledTransformStream, r2 = t2._readable._readableStreamController;
        De(r2);
        const s = new TypeError("TransformStream terminated");
        dn(t2, s);
      }
      n$1(Es, "TransformStreamDefaultControllerTerminate");
      function As(e, t2) {
        const r2 = e._transformStreamController;
        if (e._backpressure) {
          const s = e._backpressureChangePromise;
          return F(s, () => {
            const u = e._writable;
            if (u._state === "erroring") throw u._storedError;
            return si(r2, t2);
          });
        }
        return si(r2, t2);
      }
      n$1(As, "TransformStreamDefaultSinkWriteAlgorithm");
      function Bs(e, t2) {
        const r2 = e._transformStreamController;
        if (r2._finishPromise !== void 0) return r2._finishPromise;
        const s = e._readable;
        r2._finishPromise = A((c, d) => {
          r2._finishPromise_resolve = c, r2._finishPromise_reject = d;
        });
        const u = r2._cancelAlgorithm(t2);
        return ur(r2), g(u, () => (s._state === "errored" ? rt(r2, s._storedError) : (oe(s._readableStreamController, t2), pn(r2)), null), (c) => (oe(s._readableStreamController, c), rt(r2, c), null)), r2._finishPromise;
      }
      n$1(Bs, "TransformStreamDefaultSinkAbortAlgorithm");
      function ks(e) {
        const t2 = e._transformStreamController;
        if (t2._finishPromise !== void 0) return t2._finishPromise;
        const r2 = e._readable;
        t2._finishPromise = A((u, c) => {
          t2._finishPromise_resolve = u, t2._finishPromise_reject = c;
        });
        const s = t2._flushAlgorithm();
        return ur(t2), g(s, () => (r2._state === "errored" ? rt(t2, r2._storedError) : (De(r2._readableStreamController), pn(t2)), null), (u) => (oe(r2._readableStreamController, u), rt(t2, u), null)), t2._finishPromise;
      }
      n$1(ks, "TransformStreamDefaultSinkCloseAlgorithm");
      function Ws(e) {
        return sr(e, false), e._backpressureChangePromise;
      }
      n$1(Ws, "TransformStreamDefaultSourcePullAlgorithm");
      function qs(e, t2) {
        const r2 = e._transformStreamController;
        if (r2._finishPromise !== void 0) return r2._finishPromise;
        const s = e._writable;
        r2._finishPromise = A((c, d) => {
          r2._finishPromise_resolve = c, r2._finishPromise_reject = d;
        });
        const u = r2._cancelAlgorithm(t2);
        return ur(r2), g(u, () => (s._state === "errored" ? rt(r2, s._storedError) : (Ct(s._writableStreamController, t2), hn(e), pn(r2)), null), (c) => (Ct(s._writableStreamController, c), hn(e), rt(r2, c), null)), r2._finishPromise;
      }
      n$1(qs, "TransformStreamDefaultSourceCancelAlgorithm");
      function fr(e) {
        return new TypeError(`TransformStreamDefaultController.prototype.${e} can only be used on a TransformStreamDefaultController`);
      }
      n$1(fr, "defaultControllerBrandCheckException");
      function pn(e) {
        e._finishPromise_resolve !== void 0 && (e._finishPromise_resolve(), e._finishPromise_resolve = void 0, e._finishPromise_reject = void 0);
      }
      n$1(pn, "defaultControllerFinishPromiseResolve");
      function rt(e, t2) {
        e._finishPromise_reject !== void 0 && (Q(e._finishPromise), e._finishPromise_reject(t2), e._finishPromise_resolve = void 0, e._finishPromise_reject = void 0);
      }
      n$1(rt, "defaultControllerFinishPromiseReject");
      function li(e) {
        return new TypeError(`TransformStream.prototype.${e} can only be used on a TransformStream`);
      }
      n$1(li, "streamBrandCheckException"), a.ByteLengthQueuingStrategy = Xe, a.CountQueuingStrategy = et, a.ReadableByteStreamController = te, a.ReadableStream = L, a.ReadableStreamBYOBReader = ce, a.ReadableStreamBYOBRequest = Re, a.ReadableStreamDefaultController = ne, a.ReadableStreamDefaultReader = fe, a.TransformStream = tt, a.TransformStreamDefaultController = pe, a.WritableStream = de, a.WritableStreamDefaultController = ke, a.WritableStreamDefaultWriter = re;
    });
  })(kt, kt.exports)), kt.exports;
}
n$1(Ns, "requirePonyfill_es2018");
var mi;
function Hs() {
  if (mi) return pi;
  mi = 1;
  const i = 65536;
  if (!globalThis.ReadableStream) try {
    const o2 = require("node:process"), { emitWarning: a } = o2;
    try {
      o2.emitWarning = () => {
      }, Object.assign(globalThis, require("node:stream/web")), o2.emitWarning = a;
    } catch (f2) {
      throw o2.emitWarning = a, f2;
    }
  } catch {
    Object.assign(globalThis, Ns());
  }
  try {
    const { Blob: o2 } = require("buffer");
    o2 && !o2.prototype.stream && (o2.prototype.stream = n$1(function(f2) {
      let l = 0;
      const p = this;
      return new ReadableStream({ type: "bytes", async pull(h) {
        const v = await p.slice(l, Math.min(p.size, l + i)).arrayBuffer();
        l += v.byteLength, h.enqueue(new Uint8Array(v)), l === p.size && h.close();
      } });
    }, "name"));
  } catch {
  }
  return pi;
}
n$1(Hs, "requireStreams"), Hs();
const yi = 65536;
async function* Wn(i, o2 = true) {
  for (const a of i) if ("stream" in a) yield* a.stream();
  else if (ArrayBuffer.isView(a)) if (o2) {
    let f2 = a.byteOffset;
    const l = a.byteOffset + a.byteLength;
    for (; f2 !== l; ) {
      const p = Math.min(l - f2, yi), h = a.buffer.slice(f2, f2 + p);
      f2 += h.byteLength, yield new Uint8Array(h);
    }
  } else yield a;
  else {
    let f2 = 0, l = a;
    for (; f2 !== l.size; ) {
      const h = await l.slice(f2, Math.min(l.size, f2 + yi)).arrayBuffer();
      f2 += h.byteLength, yield new Uint8Array(h);
    }
  }
}
n$1(Wn, "toIterator");
const gi = (ze = class {
  constructor(o2 = [], a = {}) {
    be(this, ve, []);
    be(this, zt, "");
    be(this, bt, 0);
    be(this, Cr, "transparent");
    if (typeof o2 != "object" || o2 === null) throw new TypeError("Failed to construct 'Blob': The provided value cannot be converted to a sequence.");
    if (typeof o2[Symbol.iterator] != "function") throw new TypeError("Failed to construct 'Blob': The object must have a callable @@iterator property.");
    if (typeof a != "object" && typeof a != "function") throw new TypeError("Failed to construct 'Blob': parameter 2 cannot convert to dictionary.");
    a === null && (a = {});
    const f2 = new TextEncoder();
    for (const p of o2) {
      let h;
      ArrayBuffer.isView(p) ? h = new Uint8Array(p.buffer.slice(p.byteOffset, p.byteOffset + p.byteLength)) : p instanceof ArrayBuffer ? h = new Uint8Array(p.slice(0)) : p instanceof ze ? h = p : h = f2.encode(`${p}`), X(this, bt, O(this, bt) + (ArrayBuffer.isView(h) ? h.byteLength : h.size)), O(this, ve).push(h);
    }
    X(this, Cr, `${a.endings === void 0 ? "transparent" : a.endings}`);
    const l = a.type === void 0 ? "" : String(a.type);
    X(this, zt, /^[\x20-\x7E]*$/.test(l) ? l : "");
  }
  get size() {
    return O(this, bt);
  }
  get type() {
    return O(this, zt);
  }
  async text() {
    const o2 = new TextDecoder();
    let a = "";
    for await (const f2 of Wn(O(this, ve), false)) a += o2.decode(f2, { stream: true });
    return a += o2.decode(), a;
  }
  async arrayBuffer() {
    const o2 = new Uint8Array(this.size);
    let a = 0;
    for await (const f2 of Wn(O(this, ve), false)) o2.set(f2, a), a += f2.length;
    return o2.buffer;
  }
  stream() {
    const o2 = Wn(O(this, ve), true);
    return new globalThis.ReadableStream({ type: "bytes", async pull(a) {
      const f2 = await o2.next();
      f2.done ? a.close() : a.enqueue(f2.value);
    }, async cancel() {
      await o2.return();
    } });
  }
  slice(o2 = 0, a = this.size, f2 = "") {
    const { size: l } = this;
    let p = o2 < 0 ? Math.max(l + o2, 0) : Math.min(o2, l), h = a < 0 ? Math.max(l + a, 0) : Math.min(a, l);
    const S = Math.max(h - p, 0), v = O(this, ve), w = [];
    let A = 0;
    for (const b of v) {
      if (A >= S) break;
      const q = ArrayBuffer.isView(b) ? b.byteLength : b.size;
      if (p && q <= p) p -= q, h -= q;
      else {
        let g;
        ArrayBuffer.isView(b) ? (g = b.subarray(p, Math.min(q, h)), A += g.byteLength) : (g = b.slice(p, Math.min(q, h)), A += g.size), h -= q, w.push(g), p = 0;
      }
    }
    const T2 = new ze([], { type: String(f2).toLowerCase() });
    return X(T2, bt, S), X(T2, ve, w), T2;
  }
  get [Symbol.toStringTag]() {
    return "Blob";
  }
  static [Symbol.hasInstance](o2) {
    return o2 && typeof o2 == "object" && typeof o2.constructor == "function" && (typeof o2.stream == "function" || typeof o2.arrayBuffer == "function") && /^(Blob|File)$/.test(o2[Symbol.toStringTag]);
  }
}, ve = /* @__PURE__ */ new WeakMap(), zt = /* @__PURE__ */ new WeakMap(), bt = /* @__PURE__ */ new WeakMap(), Cr = /* @__PURE__ */ new WeakMap(), n$1(ze, "Blob"), ze);
Object.defineProperties(gi.prototype, { size: { enumerable: true }, type: { enumerable: true }, slice: { enumerable: true } });
const ut = gi, Vs = (mt = class extends ut {
  constructor(a, f2, l = {}) {
    if (arguments.length < 2) throw new TypeError(`Failed to construct 'File': 2 arguments required, but only ${arguments.length} present.`);
    super(a, l);
    be(this, It, 0);
    be(this, Ft, "");
    l === null && (l = {});
    const p = l.lastModified === void 0 ? Date.now() : Number(l.lastModified);
    Number.isNaN(p) || X(this, It, p), X(this, Ft, String(f2));
  }
  get name() {
    return O(this, Ft);
  }
  get lastModified() {
    return O(this, It);
  }
  get [Symbol.toStringTag]() {
    return "File";
  }
  static [Symbol.hasInstance](a) {
    return !!a && a instanceof ut && /^(File)$/.test(a[Symbol.toStringTag]);
  }
}, It = /* @__PURE__ */ new WeakMap(), Ft = /* @__PURE__ */ new WeakMap(), n$1(mt, "File"), mt), qn = Vs;
var { toStringTag: Wt, iterator: Qs, hasInstance: Ys } = Symbol, _i = Math.random, Gs = "append,set,get,getAll,delete,keys,values,entries,forEach,constructor".split(","), Si = n$1((i, o2, a) => (i += "", /^(Blob|File)$/.test(o2 && o2[Wt]) ? [(a = a !== void 0 ? a + "" : o2[Wt] == "File" ? o2.name : "blob", i), o2.name !== a || o2[Wt] == "blob" ? new qn([o2], a, o2) : o2] : [i, o2 + ""]), "f"), On = n$1((i, o2) => (o2 ? i : i.replace(/\r?\n|\r/g, `\r
`)).replace(/\n/g, "%0A").replace(/\r/g, "%0D").replace(/"/g, "%22"), "e$1"), Ue = n$1((i, o2, a) => {
  if (o2.length < a) throw new TypeError(`Failed to execute '${i}' on 'FormData': ${a} arguments required, but only ${o2.length} present.`);
}, "x");
const br = (yt = class {
  constructor(...o2) {
    be(this, ee, []);
    if (o2.length) throw new TypeError("Failed to construct 'FormData': parameter 1 is not of type 'HTMLFormElement'.");
  }
  get [Wt]() {
    return "FormData";
  }
  [Qs]() {
    return this.entries();
  }
  static [Ys](o2) {
    return o2 && typeof o2 == "object" && o2[Wt] === "FormData" && !Gs.some((a) => typeof o2[a] != "function");
  }
  append(...o2) {
    Ue("append", arguments, 2), O(this, ee).push(Si(...o2));
  }
  delete(o2) {
    Ue("delete", arguments, 1), o2 += "", X(this, ee, O(this, ee).filter(([a]) => a !== o2));
  }
  get(o2) {
    Ue("get", arguments, 1), o2 += "";
    for (var a = O(this, ee), f2 = a.length, l = 0; l < f2; l++) if (a[l][0] === o2) return a[l][1];
    return null;
  }
  getAll(o2, a) {
    return Ue("getAll", arguments, 1), a = [], o2 += "", O(this, ee).forEach((f2) => f2[0] === o2 && a.push(f2[1])), a;
  }
  has(o2) {
    return Ue("has", arguments, 1), o2 += "", O(this, ee).some((a) => a[0] === o2);
  }
  forEach(o2, a) {
    Ue("forEach", arguments, 1);
    for (var [f2, l] of this) o2.call(a, l, f2, this);
  }
  set(...o2) {
    Ue("set", arguments, 2);
    var a = [], f2 = true;
    o2 = Si(...o2), O(this, ee).forEach((l) => {
      l[0] === o2[0] ? f2 && (f2 = !a.push(o2)) : a.push(l);
    }), f2 && a.push(o2), X(this, ee, a);
  }
  *entries() {
    yield* O(this, ee);
  }
  *keys() {
    for (var [o2] of this) yield o2;
  }
  *values() {
    for (var [, o2] of this) yield o2;
  }
}, ee = /* @__PURE__ */ new WeakMap(), n$1(yt, "FormData"), yt);
function Zs(i, o2 = ut) {
  var a = `${_i()}${_i()}`.replace(/\./g, "").slice(-28).padStart(32, "-"), f2 = [], l = `--${a}\r
Content-Disposition: form-data; name="`;
  return i.forEach((p, h) => typeof p == "string" ? f2.push(l + On(h) + `"\r
\r
${p.replace(/\r(?!\n)|(?<!\r)\n/g, `\r
`)}\r
`) : f2.push(l + On(h) + `"; filename="${On(p.name, 1)}"\r
Content-Type: ${p.type || "application/octet-stream"}\r
\r
`, p, `\r
`)), f2.push(`--${a}--`), new o2(f2, { type: "multipart/form-data; boundary=" + a });
}
n$1(Zs, "formDataToBlob");
const Un = class Un2 extends Error {
  constructor(o2, a) {
    super(o2), Error.captureStackTrace(this, this.constructor), this.type = a;
  }
  get name() {
    return this.constructor.name;
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
};
n$1(Un, "FetchBaseError");
let ft = Un;
const xn = class xn2 extends ft {
  constructor(o2, a, f2) {
    super(o2, a), f2 && (this.code = this.errno = f2.code, this.erroredSysCall = f2.syscall);
  }
};
n$1(xn, "FetchError");
let G = xn;
const mr = Symbol.toStringTag, wi = n$1((i) => typeof i == "object" && typeof i.append == "function" && typeof i.delete == "function" && typeof i.get == "function" && typeof i.getAll == "function" && typeof i.has == "function" && typeof i.set == "function" && typeof i.sort == "function" && i[mr] === "URLSearchParams", "isURLSearchParameters"), yr = n$1((i) => i && typeof i == "object" && typeof i.arrayBuffer == "function" && typeof i.type == "string" && typeof i.stream == "function" && typeof i.constructor == "function" && /^(Blob|File)$/.test(i[mr]), "isBlob"), Ks = n$1((i) => typeof i == "object" && (i[mr] === "AbortSignal" || i[mr] === "EventTarget"), "isAbortSignal"), Js = n$1((i, o2) => {
  const a = new URL(o2).hostname, f2 = new URL(i).hostname;
  return a === f2 || a.endsWith(`.${f2}`);
}, "isDomainOrSubdomain"), Xs = n$1((i, o2) => {
  const a = new URL(o2).protocol, f2 = new URL(i).protocol;
  return a === f2;
}, "isSameProtocol"), el = node_util.promisify(me.pipeline), H = /* @__PURE__ */ Symbol("Body internals"), Nn = class Nn2 {
  constructor(o2, { size: a = 0 } = {}) {
    let f2 = null;
    o2 === null ? o2 = null : wi(o2) ? o2 = node_buffer.Buffer.from(o2.toString()) : yr(o2) || node_buffer.Buffer.isBuffer(o2) || (node_util.types.isAnyArrayBuffer(o2) ? o2 = node_buffer.Buffer.from(o2) : ArrayBuffer.isView(o2) ? o2 = node_buffer.Buffer.from(o2.buffer, o2.byteOffset, o2.byteLength) : o2 instanceof me || (o2 instanceof br ? (o2 = Zs(o2), f2 = o2.type.split("=")[1]) : o2 = node_buffer.Buffer.from(String(o2))));
    let l = o2;
    node_buffer.Buffer.isBuffer(o2) ? l = me.Readable.from(o2) : yr(o2) && (l = me.Readable.from(o2.stream())), this[H] = { body: o2, stream: l, boundary: f2, disturbed: false, error: null }, this.size = a, o2 instanceof me && o2.on("error", (p) => {
      const h = p instanceof ft ? p : new G(`Invalid response body while trying to fetch ${this.url}: ${p.message}`, "system", p);
      this[H].error = h;
    });
  }
  get body() {
    return this[H].stream;
  }
  get bodyUsed() {
    return this[H].disturbed;
  }
  async arrayBuffer() {
    const { buffer: o2, byteOffset: a, byteLength: f2 } = await zn(this);
    return o2.slice(a, a + f2);
  }
  async formData() {
    const o2 = this.headers.get("content-type");
    if (o2.startsWith("application/x-www-form-urlencoded")) {
      const f2 = new br(), l = new URLSearchParams(await this.text());
      for (const [p, h] of l) f2.append(p, h);
      return f2;
    }
    const { toFormData: a } = await Promise.resolve().then(() => require("./multipart-parser-iCxfofsj.js"));
    return a(this.body, o2);
  }
  async blob() {
    const o2 = this.headers && this.headers.get("content-type") || this[H].body && this[H].body.type || "", a = await this.arrayBuffer();
    return new ut([a], { type: o2 });
  }
  async json() {
    const o2 = await this.text();
    return JSON.parse(o2);
  }
  async text() {
    const o2 = await zn(this);
    return new TextDecoder().decode(o2);
  }
  buffer() {
    return zn(this);
  }
};
n$1(Nn, "Body");
let xe = Nn;
xe.prototype.buffer = node_util.deprecate(xe.prototype.buffer, "Please use 'response.arrayBuffer()' instead of 'response.buffer()'", "node-fetch#buffer"), Object.defineProperties(xe.prototype, { body: { enumerable: true }, bodyUsed: { enumerable: true }, arrayBuffer: { enumerable: true }, blob: { enumerable: true }, json: { enumerable: true }, text: { enumerable: true }, data: { get: node_util.deprecate(() => {
}, "data doesn't exist, use json(), text(), arrayBuffer(), or body instead", "https://github.com/node-fetch/node-fetch/issues/1000 (response)") } });
async function zn(i) {
  if (i[H].disturbed) throw new TypeError(`body used already for: ${i.url}`);
  if (i[H].disturbed = true, i[H].error) throw i[H].error;
  const { body: o2 } = i;
  if (o2 === null) return node_buffer.Buffer.alloc(0);
  if (!(o2 instanceof me)) return node_buffer.Buffer.alloc(0);
  const a = [];
  let f2 = 0;
  try {
    for await (const l of o2) {
      if (i.size > 0 && f2 + l.length > i.size) {
        const p = new G(`content size at ${i.url} over limit: ${i.size}`, "max-size");
        throw o2.destroy(p), p;
      }
      f2 += l.length, a.push(l);
    }
  } catch (l) {
    throw l instanceof ft ? l : new G(`Invalid response body while trying to fetch ${i.url}: ${l.message}`, "system", l);
  }
  if (o2.readableEnded === true || o2._readableState.ended === true) try {
    return a.every((l) => typeof l == "string") ? node_buffer.Buffer.from(a.join("")) : node_buffer.Buffer.concat(a, f2);
  } catch (l) {
    throw new G(`Could not create Buffer from response body for ${i.url}: ${l.message}`, "system", l);
  }
  else throw new G(`Premature close of server response while trying to fetch ${i.url}`);
}
n$1(zn, "consumeBody");
const In = n$1((i, o2) => {
  let a, f2, { body: l } = i[H];
  if (i.bodyUsed) throw new Error("cannot clone body after it is used");
  return l instanceof me && typeof l.getBoundary != "function" && (a = new me.PassThrough({ highWaterMark: o2 }), f2 = new me.PassThrough({ highWaterMark: o2 }), l.pipe(a), l.pipe(f2), i[H].stream = a, l = f2), l;
}, "clone"), tl = node_util.deprecate((i) => i.getBoundary(), "form-data doesn't follow the spec and requires special treatment. Use alternative package", "https://github.com/node-fetch/node-fetch/issues/1167"), Ri = n$1((i, o2) => i === null ? null : typeof i == "string" ? "text/plain;charset=UTF-8" : wi(i) ? "application/x-www-form-urlencoded;charset=UTF-8" : yr(i) ? i.type || null : node_buffer.Buffer.isBuffer(i) || node_util.types.isAnyArrayBuffer(i) || ArrayBuffer.isView(i) ? null : i instanceof br ? `multipart/form-data; boundary=${o2[H].boundary}` : i && typeof i.getBoundary == "function" ? `multipart/form-data;boundary=${tl(i)}` : i instanceof me ? null : "text/plain;charset=UTF-8", "extractContentType"), rl = n$1((i) => {
  const { body: o2 } = i[H];
  return o2 === null ? 0 : yr(o2) ? o2.size : node_buffer.Buffer.isBuffer(o2) ? o2.length : o2 && typeof o2.getLengthSync == "function" && o2.hasKnownLength && o2.hasKnownLength() ? o2.getLengthSync() : null;
}, "getTotalBytes"), nl = n$1(async (i, { body: o2 }) => {
  o2 === null ? i.end() : await el(o2, i);
}, "writeToStream"), gr = typeof Bt.validateHeaderName == "function" ? Bt.validateHeaderName : (i) => {
  if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(i)) {
    const o2 = new TypeError(`Header name must be a valid HTTP token [${i}]`);
    throw Object.defineProperty(o2, "code", { value: "ERR_INVALID_HTTP_TOKEN" }), o2;
  }
}, Fn = typeof Bt.validateHeaderValue == "function" ? Bt.validateHeaderValue : (i, o2) => {
  if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(o2)) {
    const a = new TypeError(`Invalid character in header content ["${i}"]`);
    throw Object.defineProperty(a, "code", { value: "ERR_INVALID_CHAR" }), a;
  }
}, Pr = class Pr2 extends URLSearchParams {
  constructor(o2) {
    let a = [];
    if (o2 instanceof Pr2) {
      const f2 = o2.raw();
      for (const [l, p] of Object.entries(f2)) a.push(...p.map((h) => [l, h]));
    } else if (o2 != null) if (typeof o2 == "object" && !node_util.types.isBoxedPrimitive(o2)) {
      const f2 = o2[Symbol.iterator];
      if (f2 == null) a.push(...Object.entries(o2));
      else {
        if (typeof f2 != "function") throw new TypeError("Header pairs must be iterable");
        a = [...o2].map((l) => {
          if (typeof l != "object" || node_util.types.isBoxedPrimitive(l)) throw new TypeError("Each header pair must be an iterable object");
          return [...l];
        }).map((l) => {
          if (l.length !== 2) throw new TypeError("Each header pair must be a name/value tuple");
          return [...l];
        });
      }
    } else throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
    return a = a.length > 0 ? a.map(([f2, l]) => (gr(f2), Fn(f2, String(l)), [String(f2).toLowerCase(), String(l)])) : void 0, super(a), new Proxy(this, { get(f2, l, p) {
      switch (l) {
        case "append":
        case "set":
          return (h, S) => (gr(h), Fn(h, String(S)), URLSearchParams.prototype[l].call(f2, String(h).toLowerCase(), String(S)));
        case "delete":
        case "has":
        case "getAll":
          return (h) => (gr(h), URLSearchParams.prototype[l].call(f2, String(h).toLowerCase()));
        case "keys":
          return () => (f2.sort(), new Set(URLSearchParams.prototype.keys.call(f2)).keys());
        default:
          return Reflect.get(f2, l, p);
      }
    } });
  }
  get [Symbol.toStringTag]() {
    return this.constructor.name;
  }
  toString() {
    return Object.prototype.toString.call(this);
  }
  get(o2) {
    const a = this.getAll(o2);
    if (a.length === 0) return null;
    let f2 = a.join(", ");
    return /^content-encoding$/i.test(o2) && (f2 = f2.toLowerCase()), f2;
  }
  forEach(o2, a = void 0) {
    for (const f2 of this.keys()) Reflect.apply(o2, a, [this.get(f2), f2, this]);
  }
  *values() {
    for (const o2 of this.keys()) yield this.get(o2);
  }
  *entries() {
    for (const o2 of this.keys()) yield [o2, this.get(o2)];
  }
  [Symbol.iterator]() {
    return this.entries();
  }
  raw() {
    return [...this.keys()].reduce((o2, a) => (o2[a] = this.getAll(a), o2), {});
  }
  [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")]() {
    return [...this.keys()].reduce((o2, a) => {
      const f2 = this.getAll(a);
      return a === "host" ? o2[a] = f2[0] : o2[a] = f2.length > 1 ? f2 : f2[0], o2;
    }, {});
  }
};
n$1(Pr, "Headers");
let ye = Pr;
Object.defineProperties(ye.prototype, ["get", "entries", "forEach", "values"].reduce((i, o2) => (i[o2] = { enumerable: true }, i), {}));
function ol(i = []) {
  return new ye(i.reduce((o2, a, f2, l) => (f2 % 2 === 0 && o2.push(l.slice(f2, f2 + 2)), o2), []).filter(([o2, a]) => {
    try {
      return gr(o2), Fn(o2, String(a)), true;
    } catch {
      return false;
    }
  }));
}
n$1(ol, "fromRawHeaders");
const il = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]), jn = n$1((i) => il.has(i), "isRedirect"), se = /* @__PURE__ */ Symbol("Response internals"), Ne = class Ne2 extends xe {
  constructor(o2 = null, a = {}) {
    super(o2, a);
    const f2 = a.status != null ? a.status : 200, l = new ye(a.headers);
    if (o2 !== null && !l.has("Content-Type")) {
      const p = Ri(o2, this);
      p && l.append("Content-Type", p);
    }
    this[se] = { type: "default", url: a.url, status: f2, statusText: a.statusText || "", headers: l, counter: a.counter, highWaterMark: a.highWaterMark };
  }
  get type() {
    return this[se].type;
  }
  get url() {
    return this[se].url || "";
  }
  get status() {
    return this[se].status;
  }
  get ok() {
    return this[se].status >= 200 && this[se].status < 300;
  }
  get redirected() {
    return this[se].counter > 0;
  }
  get statusText() {
    return this[se].statusText;
  }
  get headers() {
    return this[se].headers;
  }
  get highWaterMark() {
    return this[se].highWaterMark;
  }
  clone() {
    return new Ne2(In(this, this.highWaterMark), { type: this.type, url: this.url, status: this.status, statusText: this.statusText, headers: this.headers, ok: this.ok, redirected: this.redirected, size: this.size, highWaterMark: this.highWaterMark });
  }
  static redirect(o2, a = 302) {
    if (!jn(a)) throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
    return new Ne2(null, { headers: { location: new URL(o2).toString() }, status: a });
  }
  static error() {
    const o2 = new Ne2(null, { status: 0, statusText: "" });
    return o2[se].type = "error", o2;
  }
  static json(o2 = void 0, a = {}) {
    const f2 = JSON.stringify(o2);
    if (f2 === void 0) throw new TypeError("data is not JSON serializable");
    const l = new ye(a && a.headers);
    return l.has("content-type") || l.set("content-type", "application/json"), new Ne2(f2, { ...a, headers: l });
  }
  get [Symbol.toStringTag]() {
    return "Response";
  }
};
n$1(Ne, "Response");
let le = Ne;
Object.defineProperties(le.prototype, { type: { enumerable: true }, url: { enumerable: true }, status: { enumerable: true }, ok: { enumerable: true }, redirected: { enumerable: true }, statusText: { enumerable: true }, headers: { enumerable: true }, clone: { enumerable: true } });
const al = n$1((i) => {
  if (i.search) return i.search;
  const o2 = i.href.length - 1, a = i.hash || (i.href[o2] === "#" ? "#" : "");
  return i.href[o2 - a.length] === "?" ? "?" : "";
}, "getSearch");
function Ti(i, o2 = false) {
  return i == null || (i = new URL(i), /^(about|blob|data):$/.test(i.protocol)) ? "no-referrer" : (i.username = "", i.password = "", i.hash = "", o2 && (i.pathname = "", i.search = ""), i);
}
n$1(Ti, "stripURLForUseAsAReferrer");
const Ci = /* @__PURE__ */ new Set(["", "no-referrer", "no-referrer-when-downgrade", "same-origin", "origin", "strict-origin", "origin-when-cross-origin", "strict-origin-when-cross-origin", "unsafe-url"]), sl = "strict-origin-when-cross-origin";
function ll(i) {
  if (!Ci.has(i)) throw new TypeError(`Invalid referrerPolicy: ${i}`);
  return i;
}
n$1(ll, "validateReferrerPolicy");
function ul(i) {
  if (/^(http|ws)s:$/.test(i.protocol)) return true;
  const o2 = i.host.replace(/(^\[)|(]$)/g, ""), a = node_net.isIP(o2);
  return a === 4 && /^127\./.test(o2) || a === 6 && /^(((0+:){7})|(::(0+:){0,6}))0*1$/.test(o2) ? true : i.host === "localhost" || i.host.endsWith(".localhost") ? false : i.protocol === "file:";
}
n$1(ul, "isOriginPotentiallyTrustworthy");
function ct(i) {
  return /^about:(blank|srcdoc)$/.test(i) || i.protocol === "data:" || /^(blob|filesystem):$/.test(i.protocol) ? true : ul(i);
}
n$1(ct, "isUrlPotentiallyTrustworthy");
function fl(i, { referrerURLCallback: o2, referrerOriginCallback: a } = {}) {
  if (i.referrer === "no-referrer" || i.referrerPolicy === "") return null;
  const f2 = i.referrerPolicy;
  if (i.referrer === "about:client") return "no-referrer";
  const l = i.referrer;
  let p = Ti(l), h = Ti(l, true);
  p.toString().length > 4096 && (p = h), o2 && (p = o2(p)), a && (h = a(h));
  const S = new URL(i.url);
  switch (f2) {
    case "no-referrer":
      return "no-referrer";
    case "origin":
      return h;
    case "unsafe-url":
      return p;
    case "strict-origin":
      return ct(p) && !ct(S) ? "no-referrer" : h.toString();
    case "strict-origin-when-cross-origin":
      return p.origin === S.origin ? p : ct(p) && !ct(S) ? "no-referrer" : h;
    case "same-origin":
      return p.origin === S.origin ? p : "no-referrer";
    case "origin-when-cross-origin":
      return p.origin === S.origin ? p : h;
    case "no-referrer-when-downgrade":
      return ct(p) && !ct(S) ? "no-referrer" : p;
    default:
      throw new TypeError(`Invalid referrerPolicy: ${f2}`);
  }
}
n$1(fl, "determineRequestsReferrer");
function cl(i) {
  const o2 = (i.get("referrer-policy") || "").split(/[,\s]+/);
  let a = "";
  for (const f2 of o2) f2 && Ci.has(f2) && (a = f2);
  return a;
}
n$1(cl, "parseReferrerPolicyFromHeader");
const $ = /* @__PURE__ */ Symbol("Request internals"), qt = n$1((i) => typeof i == "object" && typeof i[$] == "object", "isRequest"), dl = node_util.deprecate(() => {
}, ".data is not a valid RequestInit property, use .body instead", "https://github.com/node-fetch/node-fetch/issues/1000 (request)"), vr = class vr2 extends xe {
  constructor(o2, a = {}) {
    let f2;
    if (qt(o2) ? f2 = new URL(o2.url) : (f2 = new URL(o2), o2 = {}), f2.username !== "" || f2.password !== "") throw new TypeError(`${f2} is an url with embedded credentials.`);
    let l = a.method || o2.method || "GET";
    if (/^(delete|get|head|options|post|put)$/i.test(l) && (l = l.toUpperCase()), !qt(a) && "data" in a && dl(), (a.body != null || qt(o2) && o2.body !== null) && (l === "GET" || l === "HEAD")) throw new TypeError("Request with GET/HEAD method cannot have body");
    const p = a.body ? a.body : qt(o2) && o2.body !== null ? In(o2) : null;
    super(p, { size: a.size || o2.size || 0 });
    const h = new ye(a.headers || o2.headers || {});
    if (p !== null && !h.has("Content-Type")) {
      const w = Ri(p, this);
      w && h.set("Content-Type", w);
    }
    let S = qt(o2) ? o2.signal : null;
    if ("signal" in a && (S = a.signal), S != null && !Ks(S)) throw new TypeError("Expected signal to be an instanceof AbortSignal or EventTarget");
    let v = a.referrer == null ? o2.referrer : a.referrer;
    if (v === "") v = "no-referrer";
    else if (v) {
      const w = new URL(v);
      v = /^about:(\/\/)?client$/.test(w) ? "client" : w;
    } else v = void 0;
    this[$] = { method: l, redirect: a.redirect || o2.redirect || "follow", headers: h, parsedURL: f2, signal: S, referrer: v }, this.follow = a.follow === void 0 ? o2.follow === void 0 ? 20 : o2.follow : a.follow, this.compress = a.compress === void 0 ? o2.compress === void 0 ? true : o2.compress : a.compress, this.counter = a.counter || o2.counter || 0, this.agent = a.agent || o2.agent, this.highWaterMark = a.highWaterMark || o2.highWaterMark || 16384, this.insecureHTTPParser = a.insecureHTTPParser || o2.insecureHTTPParser || false, this.referrerPolicy = a.referrerPolicy || o2.referrerPolicy || "";
  }
  get method() {
    return this[$].method;
  }
  get url() {
    return node_url.format(this[$].parsedURL);
  }
  get headers() {
    return this[$].headers;
  }
  get redirect() {
    return this[$].redirect;
  }
  get signal() {
    return this[$].signal;
  }
  get referrer() {
    if (this[$].referrer === "no-referrer") return "";
    if (this[$].referrer === "client") return "about:client";
    if (this[$].referrer) return this[$].referrer.toString();
  }
  get referrerPolicy() {
    return this[$].referrerPolicy;
  }
  set referrerPolicy(o2) {
    this[$].referrerPolicy = ll(o2);
  }
  clone() {
    return new vr2(this);
  }
  get [Symbol.toStringTag]() {
    return "Request";
  }
};
n$1(vr, "Request");
let dt = vr;
Object.defineProperties(dt.prototype, { method: { enumerable: true }, url: { enumerable: true }, headers: { enumerable: true }, redirect: { enumerable: true }, clone: { enumerable: true }, signal: { enumerable: true }, referrer: { enumerable: true }, referrerPolicy: { enumerable: true } });
const hl = n$1((i) => {
  const { parsedURL: o2 } = i[$], a = new ye(i[$].headers);
  a.has("Accept") || a.set("Accept", "*/*");
  let f2 = null;
  if (i.body === null && /^(post|put)$/i.test(i.method) && (f2 = "0"), i.body !== null) {
    const S = rl(i);
    typeof S == "number" && !Number.isNaN(S) && (f2 = String(S));
  }
  f2 && a.set("Content-Length", f2), i.referrerPolicy === "" && (i.referrerPolicy = sl), i.referrer && i.referrer !== "no-referrer" ? i[$].referrer = fl(i) : i[$].referrer = "no-referrer", i[$].referrer instanceof URL && a.set("Referer", i.referrer), a.has("User-Agent") || a.set("User-Agent", "node-fetch"), i.compress && !a.has("Accept-Encoding") && a.set("Accept-Encoding", "gzip, deflate, br");
  let { agent: l } = i;
  typeof l == "function" && (l = l(o2));
  const p = al(o2), h = { path: o2.pathname + p, method: i.method, headers: a[/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")](), insecureHTTPParser: i.insecureHTTPParser, agent: l };
  return { parsedURL: o2, options: h };
}, "getNodeRequestOptions"), Hn = class Hn2 extends ft {
  constructor(o2, a = "aborted") {
    super(o2, a);
  }
};
n$1(Hn, "AbortError");
let _r = Hn;
var Ln, Pi;
function pl() {
  if (Pi) return Ln;
  if (Pi = 1, !globalThis.DOMException) try {
    const { MessageChannel: i } = require("worker_threads"), o2 = new i().port1, a = new ArrayBuffer();
    o2.postMessage(a, [a, a]);
  } catch (i) {
    i.constructor.name === "DOMException" && (globalThis.DOMException = i.constructor);
  }
  return Ln = globalThis.DOMException, Ln;
}
n$1(pl, "requireNodeDomexception");
var bl = pl();
const ml = f(bl), { stat: $n } = node_fs.promises;
n$1((i, o2) => vi(node_fs.statSync(i), i, o2), "blobFromSync");
n$1((i, o2) => $n(i).then((a) => vi(a, i, o2)), "blobFrom");
n$1((i, o2) => $n(i).then((a) => Ei(a, i, o2)), "fileFrom");
n$1((i, o2) => Ei(node_fs.statSync(i), i, o2), "fileFromSync");
const vi = n$1((i, o2, a = "") => new ut([new Sr({ path: o2, size: i.size, lastModified: i.mtimeMs, start: 0 })], { type: a }), "fromBlob"), Ei = n$1((i, o2, a = "") => new qn([new Sr({ path: o2, size: i.size, lastModified: i.mtimeMs, start: 0 })], node_path.basename(o2), { type: a, lastModified: i.mtimeMs }), "fromFile"), Er = class Er2 {
  constructor(o2) {
    be(this, He);
    be(this, Ve);
    X(this, He, o2.path), X(this, Ve, o2.start), this.size = o2.size, this.lastModified = o2.lastModified;
  }
  slice(o2, a) {
    return new Er2({ path: O(this, He), lastModified: this.lastModified, size: a - o2, start: O(this, Ve) + o2 });
  }
  async *stream() {
    const { mtimeMs: o2 } = await $n(O(this, He));
    if (o2 > this.lastModified) throw new ml("The requested file could not be read, typically due to permission problems that have occurred after a reference to a file was acquired.", "NotReadableError");
    yield* node_fs.createReadStream(O(this, He), { start: O(this, Ve), end: O(this, Ve) + this.size - 1 });
  }
  get [Symbol.toStringTag]() {
    return "Blob";
  }
};
He = /* @__PURE__ */ new WeakMap(), Ve = /* @__PURE__ */ new WeakMap(), n$1(Er, "BlobDataItem");
let Sr = Er;
const wl = /* @__PURE__ */ new Set(["data:", "http:", "https:"]);
async function Ai(i, o2) {
  return new Promise((a, f2) => {
    const l = new dt(i, o2), { parsedURL: p, options: h } = hl(l);
    if (!wl.has(p.protocol)) throw new TypeError(`node-fetch cannot load ${i}. URL scheme "${p.protocol.replace(/:$/, "")}" is not supported.`);
    if (p.protocol === "data:") {
      const g = Us(l.url), V = new le(g, { headers: { "Content-Type": g.typeFull } });
      a(V);
      return;
    }
    const S = (p.protocol === "https:" ? zs : Bt).request, { signal: v } = l;
    let w = null;
    const A = n$1(() => {
      const g = new _r("The operation was aborted.");
      f2(g), l.body && l.body instanceof me.Readable && l.body.destroy(g), !(!w || !w.body) && w.body.emit("error", g);
    }, "abort");
    if (v && v.aborted) {
      A();
      return;
    }
    const T2 = n$1(() => {
      A(), q();
    }, "abortAndFinalize"), b = S(p.toString(), h);
    v && v.addEventListener("abort", T2);
    const q = n$1(() => {
      b.abort(), v && v.removeEventListener("abort", T2);
    }, "finalize");
    b.on("error", (g) => {
      f2(new G(`request to ${l.url} failed, reason: ${g.message}`, "system", g)), q();
    }), Rl(b, (g) => {
      w && w.body && w.body.destroy(g);
    }), process.version < "v14" && b.on("socket", (g) => {
      let V;
      g.prependListener("end", () => {
        V = g._eventsCount;
      }), g.prependListener("close", (I) => {
        if (w && V < g._eventsCount && !I) {
          const F = new Error("Premature close");
          F.code = "ERR_STREAM_PREMATURE_CLOSE", w.body.emit("error", F);
        }
      });
    }), b.on("response", (g) => {
      b.setTimeout(0);
      const V = ol(g.rawHeaders);
      if (jn(g.statusCode)) {
        const z = V.get("Location");
        let j = null;
        try {
          j = z === null ? null : new URL(z, l.url);
        } catch {
          if (l.redirect !== "manual") {
            f2(new G(`uri requested responds with an invalid redirect URL: ${z}`, "invalid-redirect")), q();
            return;
          }
        }
        switch (l.redirect) {
          case "error":
            f2(new G(`uri requested responds with a redirect, redirect mode is set to error: ${l.url}`, "no-redirect")), q();
            return;
          case "manual":
            break;
          case "follow": {
            if (j === null) break;
            if (l.counter >= l.follow) {
              f2(new G(`maximum redirect reached at: ${l.url}`, "max-redirect")), q();
              return;
            }
            const U = { headers: new ye(l.headers), follow: l.follow, counter: l.counter + 1, agent: l.agent, compress: l.compress, method: l.method, body: In(l), signal: l.signal, size: l.size, referrer: l.referrer, referrerPolicy: l.referrerPolicy };
            if (!Js(l.url, j) || !Xs(l.url, j)) for (const jt of ["authorization", "www-authenticate", "cookie", "cookie2"]) U.headers.delete(jt);
            if (g.statusCode !== 303 && l.body && o2.body instanceof me.Readable) {
              f2(new G("Cannot follow redirect with body being a readable stream", "unsupported-redirect")), q();
              return;
            }
            (g.statusCode === 303 || (g.statusCode === 301 || g.statusCode === 302) && l.method === "POST") && (U.method = "GET", U.body = void 0, U.headers.delete("content-length"));
            const D = cl(V);
            D && (U.referrerPolicy = D), a(Ai(new dt(j, U))), q();
            return;
          }
          default:
            return f2(new TypeError(`Redirect option '${l.redirect}' is not a valid value of RequestRedirect`));
        }
      }
      v && g.once("end", () => {
        v.removeEventListener("abort", T2);
      });
      let I = me.pipeline(g, new me.PassThrough(), (z) => {
        z && f2(z);
      });
      process.version < "v12.10" && g.on("aborted", T2);
      const F = { url: l.url, status: g.statusCode, statusText: g.statusMessage, headers: V, size: l.size, counter: l.counter, highWaterMark: l.highWaterMark }, Q = V.get("Content-Encoding");
      if (!l.compress || l.method === "HEAD" || Q === null || g.statusCode === 204 || g.statusCode === 304) {
        w = new le(I, F), a(w);
        return;
      }
      const ge = { flush: st.Z_SYNC_FLUSH, finishFlush: st.Z_SYNC_FLUSH };
      if (Q === "gzip" || Q === "x-gzip") {
        I = me.pipeline(I, st.createGunzip(ge), (z) => {
          z && f2(z);
        }), w = new le(I, F), a(w);
        return;
      }
      if (Q === "deflate" || Q === "x-deflate") {
        const z = me.pipeline(g, new me.PassThrough(), (j) => {
          j && f2(j);
        });
        z.once("data", (j) => {
          (j[0] & 15) === 8 ? I = me.pipeline(I, st.createInflate(), (U) => {
            U && f2(U);
          }) : I = me.pipeline(I, st.createInflateRaw(), (U) => {
            U && f2(U);
          }), w = new le(I, F), a(w);
        }), z.once("end", () => {
          w || (w = new le(I, F), a(w));
        });
        return;
      }
      if (Q === "br") {
        I = me.pipeline(I, st.createBrotliDecompress(), (z) => {
          z && f2(z);
        }), w = new le(I, F), a(w);
        return;
      }
      w = new le(I, F), a(w);
    }), nl(b, l).catch(f2);
  });
}
n$1(Ai, "fetch$1");
function Rl(i, o2) {
  const a = node_buffer.Buffer.from(`0\r
\r
`);
  let f2 = false, l = false, p;
  i.on("response", (h) => {
    const { headers: S } = h;
    f2 = S["transfer-encoding"] === "chunked" && !S["content-length"];
  }), i.on("socket", (h) => {
    const S = n$1(() => {
      if (f2 && !l) {
        const w = new Error("Premature close");
        w.code = "ERR_STREAM_PREMATURE_CLOSE", o2(w);
      }
    }, "onSocketClose"), v = n$1((w) => {
      l = node_buffer.Buffer.compare(w.slice(-5), a) === 0, !l && p && (l = node_buffer.Buffer.compare(p.slice(-3), a.slice(0, 3)) === 0 && node_buffer.Buffer.compare(w.slice(-2), a.slice(3)) === 0), p = w;
    }, "onData");
    h.prependListener("close", S), h.on("data", v), i.on("close", () => {
      h.removeListener("close", S), h.removeListener("data", v);
    });
  });
}
n$1(Rl, "fixResponseChunkedTransferBadEnding");
const Bi = /* @__PURE__ */ new WeakMap(), Dn = /* @__PURE__ */ new WeakMap();
function W(i) {
  const o2 = Bi.get(i);
  return console.assert(o2 != null, "'this' is expected an Event object, but got", i), o2;
}
n$1(W, "pd");
function ki(i) {
  if (i.passiveListener != null) {
    typeof console < "u" && typeof console.error == "function" && console.error("Unable to preventDefault inside passive event listener invocation.", i.passiveListener);
    return;
  }
  i.event.cancelable && (i.canceled = true, typeof i.event.preventDefault == "function" && i.event.preventDefault());
}
n$1(ki, "setCancelFlag");
function ht(i, o2) {
  Bi.set(this, { eventTarget: i, event: o2, eventPhase: 2, currentTarget: i, canceled: false, stopped: false, immediateStopped: false, passiveListener: null, timeStamp: o2.timeStamp || Date.now() }), Object.defineProperty(this, "isTrusted", { value: false, enumerable: true });
  const a = Object.keys(o2);
  for (let f2 = 0; f2 < a.length; ++f2) {
    const l = a[f2];
    l in this || Object.defineProperty(this, l, Wi(l));
  }
}
n$1(ht, "Event"), ht.prototype = { get type() {
  return W(this).event.type;
}, get target() {
  return W(this).eventTarget;
}, get currentTarget() {
  return W(this).currentTarget;
}, composedPath() {
  const i = W(this).currentTarget;
  return i == null ? [] : [i];
}, get NONE() {
  return 0;
}, get CAPTURING_PHASE() {
  return 1;
}, get AT_TARGET() {
  return 2;
}, get BUBBLING_PHASE() {
  return 3;
}, get eventPhase() {
  return W(this).eventPhase;
}, stopPropagation() {
  const i = W(this);
  i.stopped = true, typeof i.event.stopPropagation == "function" && i.event.stopPropagation();
}, stopImmediatePropagation() {
  const i = W(this);
  i.stopped = true, i.immediateStopped = true, typeof i.event.stopImmediatePropagation == "function" && i.event.stopImmediatePropagation();
}, get bubbles() {
  return !!W(this).event.bubbles;
}, get cancelable() {
  return !!W(this).event.cancelable;
}, preventDefault() {
  ki(W(this));
}, get defaultPrevented() {
  return W(this).canceled;
}, get composed() {
  return !!W(this).event.composed;
}, get timeStamp() {
  return W(this).timeStamp;
}, get srcElement() {
  return W(this).eventTarget;
}, get cancelBubble() {
  return W(this).stopped;
}, set cancelBubble(i) {
  if (!i) return;
  const o2 = W(this);
  o2.stopped = true, typeof o2.event.cancelBubble == "boolean" && (o2.event.cancelBubble = true);
}, get returnValue() {
  return !W(this).canceled;
}, set returnValue(i) {
  i || ki(W(this));
}, initEvent() {
} }, Object.defineProperty(ht.prototype, "constructor", { value: ht, configurable: true, writable: true }), typeof window < "u" && typeof window.Event < "u" && (Object.setPrototypeOf(ht.prototype, window.Event.prototype), Dn.set(window.Event.prototype, ht));
function Wi(i) {
  return { get() {
    return W(this).event[i];
  }, set(o2) {
    W(this).event[i] = o2;
  }, configurable: true, enumerable: true };
}
n$1(Wi, "defineRedirectDescriptor");
function Tl(i) {
  return { value() {
    const o2 = W(this).event;
    return o2[i].apply(o2, arguments);
  }, configurable: true, enumerable: true };
}
n$1(Tl, "defineCallDescriptor");
function Cl(i, o2) {
  const a = Object.keys(o2);
  if (a.length === 0) return i;
  function f2(l, p) {
    i.call(this, l, p);
  }
  n$1(f2, "CustomEvent"), f2.prototype = Object.create(i.prototype, { constructor: { value: f2, configurable: true, writable: true } });
  for (let l = 0; l < a.length; ++l) {
    const p = a[l];
    if (!(p in i.prototype)) {
      const S = typeof Object.getOwnPropertyDescriptor(o2, p).value == "function";
      Object.defineProperty(f2.prototype, p, S ? Tl(p) : Wi(p));
    }
  }
  return f2;
}
n$1(Cl, "defineWrapper");
function qi(i) {
  if (i == null || i === Object.prototype) return ht;
  let o2 = Dn.get(i);
  return o2 == null && (o2 = Cl(qi(Object.getPrototypeOf(i)), i), Dn.set(i, o2)), o2;
}
n$1(qi, "getWrapper");
function Pl(i, o2) {
  const a = qi(Object.getPrototypeOf(o2));
  return new a(i, o2);
}
n$1(Pl, "wrapEvent");
function vl(i) {
  return W(i).immediateStopped;
}
n$1(vl, "isStopped");
function El(i, o2) {
  W(i).eventPhase = o2;
}
n$1(El, "setEventPhase");
function Al(i, o2) {
  W(i).currentTarget = o2;
}
n$1(Al, "setCurrentTarget");
function Oi(i, o2) {
  W(i).passiveListener = o2;
}
n$1(Oi, "setPassiveListener");
const zi = /* @__PURE__ */ new WeakMap(), Ii = 1, Fi = 2, wr = 3;
function Rr(i) {
  return i !== null && typeof i == "object";
}
n$1(Rr, "isObject");
function Ot(i) {
  const o2 = zi.get(i);
  if (o2 == null) throw new TypeError("'this' is expected an EventTarget object, but got another value.");
  return o2;
}
n$1(Ot, "getListeners");
function Bl(i) {
  return { get() {
    let a = Ot(this).get(i);
    for (; a != null; ) {
      if (a.listenerType === wr) return a.listener;
      a = a.next;
    }
    return null;
  }, set(o2) {
    typeof o2 != "function" && !Rr(o2) && (o2 = null);
    const a = Ot(this);
    let f2 = null, l = a.get(i);
    for (; l != null; ) l.listenerType === wr ? f2 !== null ? f2.next = l.next : l.next !== null ? a.set(i, l.next) : a.delete(i) : f2 = l, l = l.next;
    if (o2 !== null) {
      const p = { listener: o2, listenerType: wr, passive: false, once: false, next: null };
      f2 === null ? a.set(i, p) : f2.next = p;
    }
  }, configurable: true, enumerable: true };
}
n$1(Bl, "defineEventAttributeDescriptor");
function ji(i, o2) {
  Object.defineProperty(i, `on${o2}`, Bl(o2));
}
n$1(ji, "defineEventAttribute");
function Li(i) {
  function o2() {
    Pe.call(this);
  }
  n$1(o2, "CustomEventTarget"), o2.prototype = Object.create(Pe.prototype, { constructor: { value: o2, configurable: true, writable: true } });
  for (let a = 0; a < i.length; ++a) ji(o2.prototype, i[a]);
  return o2;
}
n$1(Li, "defineCustomEventTarget");
function Pe() {
  if (this instanceof Pe) {
    zi.set(this, /* @__PURE__ */ new Map());
    return;
  }
  if (arguments.length === 1 && Array.isArray(arguments[0])) return Li(arguments[0]);
  if (arguments.length > 0) {
    const i = new Array(arguments.length);
    for (let o2 = 0; o2 < arguments.length; ++o2) i[o2] = arguments[o2];
    return Li(i);
  }
  throw new TypeError("Cannot call a class as a function");
}
n$1(Pe, "EventTarget"), Pe.prototype = { addEventListener(i, o2, a) {
  if (o2 == null) return;
  if (typeof o2 != "function" && !Rr(o2)) throw new TypeError("'listener' should be a function or an object.");
  const f2 = Ot(this), l = Rr(a), h = (l ? !!a.capture : !!a) ? Ii : Fi, S = { listener: o2, listenerType: h, passive: l && !!a.passive, once: l && !!a.once, next: null };
  let v = f2.get(i);
  if (v === void 0) {
    f2.set(i, S);
    return;
  }
  let w = null;
  for (; v != null; ) {
    if (v.listener === o2 && v.listenerType === h) return;
    w = v, v = v.next;
  }
  w.next = S;
}, removeEventListener(i, o2, a) {
  if (o2 == null) return;
  const f2 = Ot(this), p = (Rr(a) ? !!a.capture : !!a) ? Ii : Fi;
  let h = null, S = f2.get(i);
  for (; S != null; ) {
    if (S.listener === o2 && S.listenerType === p) {
      h !== null ? h.next = S.next : S.next !== null ? f2.set(i, S.next) : f2.delete(i);
      return;
    }
    h = S, S = S.next;
  }
}, dispatchEvent(i) {
  if (i == null || typeof i.type != "string") throw new TypeError('"event.type" should be a string.');
  const o2 = Ot(this), a = i.type;
  let f2 = o2.get(a);
  if (f2 == null) return true;
  const l = Pl(this, i);
  let p = null;
  for (; f2 != null; ) {
    if (f2.once ? p !== null ? p.next = f2.next : f2.next !== null ? o2.set(a, f2.next) : o2.delete(a) : p = f2, Oi(l, f2.passive ? f2.listener : null), typeof f2.listener == "function") try {
      f2.listener.call(this, l);
    } catch (h) {
      typeof console < "u" && typeof console.error == "function" && console.error(h);
    }
    else f2.listenerType !== wr && typeof f2.listener.handleEvent == "function" && f2.listener.handleEvent(l);
    if (vl(l)) break;
    f2 = f2.next;
  }
  return Oi(l, null), El(l, 0), Al(l, null), !l.defaultPrevented;
} }, Object.defineProperty(Pe.prototype, "constructor", { value: Pe, configurable: true, writable: true }), typeof window < "u" && typeof window.EventTarget < "u" && Object.setPrototypeOf(Pe.prototype, window.EventTarget.prototype);
const Vn = class Vn2 extends Pe {
  constructor() {
    throw super(), new TypeError("AbortSignal cannot be constructed directly");
  }
  get aborted() {
    const o2 = Tr.get(this);
    if (typeof o2 != "boolean") throw new TypeError(`Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? "null" : typeof this}`);
    return o2;
  }
};
n$1(Vn, "AbortSignal");
let pt = Vn;
ji(pt.prototype, "abort");
function kl() {
  const i = Object.create(pt.prototype);
  return Pe.call(i), Tr.set(i, false), i;
}
n$1(kl, "createAbortSignal");
function Wl(i) {
  Tr.get(i) === false && (Tr.set(i, true), i.dispatchEvent({ type: "abort" }));
}
n$1(Wl, "abortSignal");
const Tr = /* @__PURE__ */ new WeakMap();
Object.defineProperties(pt.prototype, { aborted: { enumerable: true } }), typeof Symbol == "function" && typeof Symbol.toStringTag == "symbol" && Object.defineProperty(pt.prototype, Symbol.toStringTag, { configurable: true, value: "AbortSignal" });
let Mn = (gt = class {
  constructor() {
    $i.set(this, kl());
  }
  get signal() {
    return Di(this);
  }
  abort() {
    Wl(Di(this));
  }
}, n$1(gt, "AbortController"), gt);
const $i = /* @__PURE__ */ new WeakMap();
function Di(i) {
  const o2 = $i.get(i);
  if (o2 == null) throw new TypeError(`Expected 'this' to be an 'AbortController' object, but got ${i === null ? "null" : typeof i}`);
  return o2;
}
n$1(Di, "getSignal"), Object.defineProperties(Mn.prototype, { signal: { enumerable: true }, abort: { enumerable: true } }), typeof Symbol == "function" && typeof Symbol.toStringTag == "symbol" && Object.defineProperty(Mn.prototype, Symbol.toStringTag, { configurable: true, value: "AbortController" });
var ql = Object.defineProperty, Ol = n$1((i, o2) => ql(i, "name", { value: o2, configurable: true }), "e");
const Mi = Ai;
Ui();
function Ui() {
  !globalThis.process?.versions?.node && !globalThis.process.env?.DISABLE_NODE_FETCH_NATIVE_WARN && console.warn("[node-fetch-native] Node.js compatible build of `node-fetch-native` is being used in a non-Node.js environment. Please make sure you are using proper export conditions or report this issue to https://github.com/unjs/node-fetch-native. You can set `process.env.DISABLE_NODE_FETCH_NATIVE_WARN` to disable this warning.");
}
n$1(Ui, "s"), Ol(Ui, "checkNodeEnvironment");
const o = !!globalThis.process.env?.FORCE_NODE_FETCH, r = !o && globalThis.fetch || Mi, n = !o && globalThis.Headers || ye, T = !o && globalThis.AbortController || Mn;
const suspectProtoRx = /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
    warnKeyDropped(key);
    return;
  }
  return value;
}
function warnKeyDropped(key) {
  console.warn(`[destr] Dropping "${key}" key to prevent prototype pollution.`);
}
function destr(value, options = {}) {
  if (typeof value !== "string") {
    return value;
  }
  if (value[0] === '"' && value[value.length - 1] === '"' && value.indexOf("\\") === -1) {
    return value.slice(1, -1);
  }
  const _value = value.trim();
  if (_value.length <= 9) {
    switch (_value.toLowerCase()) {
      case "true": {
        return true;
      }
      case "false": {
        return false;
      }
      case "undefined": {
        return void 0;
      }
      case "null": {
        return null;
      }
      case "nan": {
        return Number.NaN;
      }
      case "infinity": {
        return Number.POSITIVE_INFINITY;
      }
      case "-infinity": {
        return Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (!JsonSigRx.test(value)) {
    if (options.strict) {
      throw new SyntaxError("[destr] Invalid JSON");
    }
    return value;
  }
  try {
    if (suspectProtoRx.test(value) || suspectConstructorRx.test(value)) {
      if (options.strict) {
        throw new Error("[destr] Possible prototype pollution");
      }
      return JSON.parse(value, jsonParseTransform);
    }
    return JSON.parse(value);
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return value;
  }
}
const HASH_RE = /#/g;
const AMPERSAND_RE = /&/g;
const SLASH_RE = /\//g;
const EQUAL_RE = /=/g;
const PLUS_RE = /\+/g;
const ENC_CARET_RE = /%5e/gi;
const ENC_BACKTICK_RE = /%60/gi;
const ENC_PIPE_RE = /%7c/gi;
const ENC_SPACE_RE = /%20/gi;
function encode(text) {
  return encodeURI("" + text).replace(ENC_PIPE_RE, "|");
}
function encodeQueryValue(input) {
  return encode(typeof input === "string" ? input : JSON.stringify(input)).replace(PLUS_RE, "%2B").replace(ENC_SPACE_RE, "+").replace(HASH_RE, "%23").replace(AMPERSAND_RE, "%26").replace(ENC_BACKTICK_RE, "`").replace(ENC_CARET_RE, "^").replace(SLASH_RE, "%2F");
}
function encodeQueryKey(text) {
  return encodeQueryValue(text).replace(EQUAL_RE, "%3D");
}
function decode(text = "") {
  try {
    return decodeURIComponent("" + text);
  } catch {
    return "" + text;
  }
}
function decodeQueryKey(text) {
  return decode(text.replace(PLUS_RE, " "));
}
function decodeQueryValue(text) {
  return decode(text.replace(PLUS_RE, " "));
}
function parseQuery(parametersString = "") {
  const object = /* @__PURE__ */ Object.create(null);
  if (parametersString[0] === "?") {
    parametersString = parametersString.slice(1);
  }
  for (const parameter of parametersString.split("&")) {
    const s = parameter.match(/([^=]+)=?(.*)/) || [];
    if (s.length < 2) {
      continue;
    }
    const key = decodeQueryKey(s[1]);
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const value = decodeQueryValue(s[2] || "");
    if (object[key] === void 0) {
      object[key] = value;
    } else if (Array.isArray(object[key])) {
      object[key].push(value);
    } else {
      object[key] = [object[key], value];
    }
  }
  return object;
}
function encodeQueryItem(key, value) {
  if (typeof value === "number" || typeof value === "boolean") {
    value = String(value);
  }
  if (!value) {
    return encodeQueryKey(key);
  }
  if (Array.isArray(value)) {
    return value.map(
      (_value) => `${encodeQueryKey(key)}=${encodeQueryValue(_value)}`
    ).join("&");
  }
  return `${encodeQueryKey(key)}=${encodeQueryValue(value)}`;
}
function stringifyQuery(query) {
  return Object.keys(query).filter((k) => query[k] !== void 0).map((k) => encodeQueryItem(k, query[k])).filter(Boolean).join("&");
}
const PROTOCOL_STRICT_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{1,2})/;
const PROTOCOL_REGEX = /^[\s\w\0+.-]{2,}:([/\\]{2})?/;
const PROTOCOL_RELATIVE_REGEX = /^([/\\]\s*){2,}[^/\\]/;
const JOIN_LEADING_SLASH_RE = /^\.?\//;
function hasProtocol(inputString, opts = {}) {
  if (typeof opts === "boolean") {
    opts = { acceptRelative: opts };
  }
  if (opts.strict) {
    return PROTOCOL_STRICT_REGEX.test(inputString);
  }
  return PROTOCOL_REGEX.test(inputString) || (opts.acceptRelative ? PROTOCOL_RELATIVE_REGEX.test(inputString) : false);
}
function hasTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/");
  }
}
function withoutTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return (hasTrailingSlash(input) ? input.slice(0, -1) : input) || "/";
  }
}
function withTrailingSlash(input = "", respectQueryAndFragment) {
  {
    return input.endsWith("/") ? input : input + "/";
  }
}
function withBase(input, base) {
  if (isEmptyURL(base) || hasProtocol(input)) {
    return input;
  }
  const _base = withoutTrailingSlash(base);
  if (input.startsWith(_base)) {
    const nextChar = input[_base.length];
    if (!nextChar || nextChar === "/" || nextChar === "?") {
      return input;
    }
  }
  return joinURL(_base, input);
}
function withQuery(input, query) {
  const parsed = parseURL(input);
  const mergedQuery = { ...parseQuery(parsed.search), ...query };
  parsed.search = stringifyQuery(mergedQuery);
  return stringifyParsedURL(parsed);
}
function isEmptyURL(url) {
  return !url || url === "/";
}
function isNonEmptyURL(url) {
  return url && url !== "/";
}
function joinURL(base, ...input) {
  let url = base || "";
  for (const segment of input.filter((url2) => isNonEmptyURL(url2))) {
    if (url) {
      const _segment = segment.replace(JOIN_LEADING_SLASH_RE, "");
      url = withTrailingSlash(url) + _segment;
    } else {
      url = segment;
    }
  }
  return url;
}
const protocolRelative = /* @__PURE__ */ Symbol.for("ufo:protocolRelative");
function parseURL(input = "", defaultProto) {
  const _specialProtoMatch = input.match(
    /^[\s\0]*(blob:|data:|javascript:|vbscript:)(.*)/i
  );
  if (_specialProtoMatch) {
    const [, _proto, _pathname = ""] = _specialProtoMatch;
    return {
      protocol: _proto.toLowerCase(),
      pathname: _pathname,
      href: _proto + _pathname,
      auth: "",
      host: "",
      search: "",
      hash: ""
    };
  }
  if (!hasProtocol(input, { acceptRelative: true })) {
    return parsePath(input);
  }
  const [, protocol = "", auth, hostAndPath = ""] = input.replace(/\\/g, "/").match(/^[\s\0]*([\w+.-]{2,}:)?\/\/([^/@]+@)?(.*)/) || [];
  let [, host = "", path2 = ""] = hostAndPath.match(/([^#/?]*)(.*)?/) || [];
  if (protocol === "file:") {
    path2 = path2.replace(/\/(?=[A-Za-z]:)/, "");
  }
  const { pathname, search, hash } = parsePath(path2);
  return {
    protocol: protocol.toLowerCase(),
    auth: auth ? auth.slice(0, Math.max(0, auth.length - 1)) : "",
    host,
    pathname,
    search,
    hash,
    [protocolRelative]: !protocol
  };
}
function parsePath(input = "") {
  const [pathname = "", search = "", hash = ""] = (input.match(/([^#?]*)(\?[^#]*)?(#.*)?/) || []).splice(1);
  return {
    pathname,
    search,
    hash
  };
}
function stringifyParsedURL(parsed) {
  const pathname = parsed.pathname || "";
  const search = parsed.search ? (parsed.search.startsWith("?") ? "" : "?") + parsed.search : "";
  const hash = parsed.hash || "";
  const auth = parsed.auth ? parsed.auth + "@" : "";
  const host = parsed.host || "";
  const proto = parsed.protocol || parsed[protocolRelative] ? (parsed.protocol || "") + "//" : "";
  return proto + auth + host + pathname + search + hash;
}
class FetchError extends Error {
  constructor(message, opts) {
    super(message, opts);
    this.name = "FetchError";
    if (opts?.cause && !this.cause) {
      this.cause = opts.cause;
    }
  }
}
function createFetchError(ctx) {
  const errorMessage = ctx.error?.message || ctx.error?.toString() || "";
  const method = ctx.request?.method || ctx.options?.method || "GET";
  const url = ctx.request?.url || String(ctx.request) || "/";
  const requestStr = `[${method}] ${JSON.stringify(url)}`;
  const statusStr = ctx.response ? `${ctx.response.status} ${ctx.response.statusText}` : "<no response>";
  const message = `${requestStr}: ${statusStr}${errorMessage ? ` ${errorMessage}` : ""}`;
  const fetchError = new FetchError(
    message,
    ctx.error ? { cause: ctx.error } : void 0
  );
  for (const key of ["request", "options", "response"]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx[key];
      }
    });
  }
  for (const [key, refKey] of [
    ["data", "_data"],
    ["status", "status"],
    ["statusCode", "status"],
    ["statusText", "statusText"],
    ["statusMessage", "statusText"]
  ]) {
    Object.defineProperty(fetchError, key, {
      get() {
        return ctx.response && ctx.response[refKey];
      }
    });
  }
  return fetchError;
}
const payloadMethods = new Set(
  Object.freeze(["PATCH", "POST", "PUT", "DELETE"])
);
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(value) {
  if (value === void 0) {
    return false;
  }
  const t2 = typeof value;
  if (t2 === "string" || t2 === "number" || t2 === "boolean" || t2 === null) {
    return true;
  }
  if (t2 !== "object") {
    return false;
  }
  if (Array.isArray(value)) {
    return true;
  }
  if (value.buffer) {
    return false;
  }
  if (value instanceof FormData || value instanceof URLSearchParams) {
    return false;
  }
  return value.constructor && value.constructor.name === "Object" || typeof value.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*.^`~-]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift() || "";
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (contentType === "text/event-stream") {
    return "stream";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
function resolveFetchOptions(request, input, defaults, Headers2) {
  const headers = mergeHeaders(
    input?.headers ?? request?.headers,
    defaults?.headers,
    Headers2
  );
  let query;
  if (defaults?.query || defaults?.params || input?.params || input?.query) {
    query = {
      ...defaults?.params,
      ...defaults?.query,
      ...input?.params,
      ...input?.query
    };
  }
  return {
    ...defaults,
    ...input,
    query,
    params: query,
    headers
  };
}
function mergeHeaders(input, defaults, Headers2) {
  if (!defaults) {
    return new Headers2(input);
  }
  const headers = new Headers2(defaults);
  if (input) {
    for (const [key, value] of Symbol.iterator in input || Array.isArray(input) ? input : new Headers2(input)) {
      headers.set(key, value);
    }
  }
  return headers;
}
async function callHooks(context, hooks) {
  if (hooks) {
    if (Array.isArray(hooks)) {
      for (const hook of hooks) {
        await hook(context);
      }
    } else {
      await hooks(context);
    }
  }
}
const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  // Request Timeout
  409,
  // Conflict
  425,
  // Too Early (Experimental)
  429,
  // Too Many Requests
  500,
  // Internal Server Error
  502,
  // Bad Gateway
  503,
  // Service Unavailable
  504
  // Gateway Timeout
]);
const nullBodyResponses = /* @__PURE__ */ new Set([101, 204, 205, 304]);
function createFetch(globalOptions = {}) {
  const {
    fetch: fetch2 = globalThis.fetch,
    Headers: Headers2 = globalThis.Headers,
    AbortController: AbortController2 = globalThis.AbortController
  } = globalOptions;
  async function onError(context) {
    const isAbort = context.error && context.error.name === "AbortError" && !context.options.timeout || false;
    if (context.options.retry !== false && !isAbort) {
      let retries;
      if (typeof context.options.retry === "number") {
        retries = context.options.retry;
      } else {
        retries = isPayloadMethod(context.options.method) ? 0 : 1;
      }
      const responseCode = context.response && context.response.status || 500;
      if (retries > 0 && (Array.isArray(context.options.retryStatusCodes) ? context.options.retryStatusCodes.includes(responseCode) : retryStatusCodes.has(responseCode))) {
        const retryDelay = typeof context.options.retryDelay === "function" ? context.options.retryDelay(context) : context.options.retryDelay || 0;
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        return $fetchRaw(context.request, {
          ...context.options,
          retry: retries - 1
        });
      }
    }
    const error = createFetchError(context);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, $fetchRaw);
    }
    throw error;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _options = {}) {
    const context = {
      request: _request,
      options: resolveFetchOptions(
        _request,
        _options,
        globalOptions.defaults,
        Headers2
      ),
      response: void 0,
      error: void 0
    };
    if (context.options.method) {
      context.options.method = context.options.method.toUpperCase();
    }
    if (context.options.onRequest) {
      await callHooks(context, context.options.onRequest);
      if (!(context.options.headers instanceof Headers2)) {
        context.options.headers = new Headers2(
          context.options.headers || {}
          /* compat */
        );
      }
    }
    if (typeof context.request === "string") {
      if (context.options.baseURL) {
        context.request = withBase(context.request, context.options.baseURL);
      }
      if (context.options.query) {
        context.request = withQuery(context.request, context.options.query);
        delete context.options.query;
      }
      if ("query" in context.options) {
        delete context.options.query;
      }
      if ("params" in context.options) {
        delete context.options.params;
      }
    }
    if (context.options.body && isPayloadMethod(context.options.method)) {
      if (isJSONSerializable(context.options.body)) {
        const contentType = context.options.headers.get("content-type");
        if (typeof context.options.body !== "string") {
          context.options.body = contentType === "application/x-www-form-urlencoded" ? new URLSearchParams(
            context.options.body
          ).toString() : JSON.stringify(context.options.body);
        }
        if (!contentType) {
          context.options.headers.set("content-type", "application/json");
        }
        if (!context.options.headers.has("accept")) {
          context.options.headers.set("accept", "application/json");
        }
      } else if (
        // ReadableStream Body
        "pipeTo" in context.options.body && typeof context.options.body.pipeTo === "function" || // Node.js Stream Body
        typeof context.options.body.pipe === "function"
      ) {
        if (!("duplex" in context.options)) {
          context.options.duplex = "half";
        }
      }
    }
    let abortTimeout;
    if (!context.options.signal && context.options.timeout) {
      const controller = new AbortController2();
      abortTimeout = setTimeout(() => {
        const error = new Error(
          "[TimeoutError]: The operation was aborted due to timeout"
        );
        error.name = "TimeoutError";
        error.code = 23;
        controller.abort(error);
      }, context.options.timeout);
      context.options.signal = controller.signal;
    }
    try {
      context.response = await fetch2(
        context.request,
        context.options
      );
    } catch (error) {
      context.error = error;
      if (context.options.onRequestError) {
        await callHooks(
          context,
          context.options.onRequestError
        );
      }
      return await onError(context);
    } finally {
      if (abortTimeout) {
        clearTimeout(abortTimeout);
      }
    }
    const hasBody = (context.response.body || // https://github.com/unjs/ofetch/issues/324
    // https://github.com/unjs/ofetch/issues/294
    // https://github.com/JakeChampion/fetch/issues/1454
    context.response._bodyInit) && !nullBodyResponses.has(context.response.status) && context.options.method !== "HEAD";
    if (hasBody) {
      const responseType = (context.options.parseResponse ? "json" : context.options.responseType) || detectResponseType(context.response.headers.get("content-type") || "");
      switch (responseType) {
        case "json": {
          const data = await context.response.text();
          const parseFunction = context.options.parseResponse || destr;
          context.response._data = parseFunction(data);
          break;
        }
        case "stream": {
          context.response._data = context.response.body || context.response._bodyInit;
          break;
        }
        default: {
          context.response._data = await context.response[responseType]();
        }
      }
    }
    if (context.options.onResponse) {
      await callHooks(
        context,
        context.options.onResponse
      );
    }
    if (!context.options.ignoreResponseError && context.response.status >= 400 && context.response.status < 600) {
      if (context.options.onResponseError) {
        await callHooks(
          context,
          context.options.onResponseError
        );
      }
      return await onError(context);
    }
    return context.response;
  };
  const $fetch2 = async function $fetch22(request, options) {
    const r2 = await $fetchRaw(request, options);
    return r2._data;
  };
  $fetch2.raw = $fetchRaw;
  $fetch2.native = (...args) => fetch2(...args);
  $fetch2.create = (defaultOptions = {}, customGlobalOptions = {}) => createFetch({
    ...globalOptions,
    ...customGlobalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...customGlobalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch2;
}
function createNodeFetch() {
  const useKeepAlive = JSON.parse(process.env.FETCH_KEEP_ALIVE || "false");
  if (!useKeepAlive) {
    return r;
  }
  const agentOptions = { keepAlive: true };
  const httpAgent = new Bt.Agent(agentOptions);
  const httpsAgent = new zs.Agent(agentOptions);
  const nodeFetchOptions = {
    agent(parsedURL) {
      return parsedURL.protocol === "http:" ? httpAgent : httpsAgent;
    }
  };
  return function nodeFetchWithKeepAlive(input, init) {
    return r(input, { ...nodeFetchOptions, ...init });
  };
}
const fetch = globalThis.fetch ? (...args) => globalThis.fetch(...args) : createNodeFetch();
const Headers = globalThis.Headers || n;
const AbortController$1 = globalThis.AbortController || T;
const ofetch = createFetch({ fetch, Headers, AbortController: AbortController$1 });
const $fetch = ofetch;
const createClient = (options) => {
  const apiFetch = $fetch.create({
    baseURL: options.baseURL,
    headers: options.sessionToken ? { Authorization: `Bearer ${options.sessionToken}` } : {}
  });
  return {
    auth: {
      pair: (body) => apiFetch("/v1/auth/pair", { method: "POST", body }),
      me: () => apiFetch("/v1/auth/me")
    },
    refine: (body) => apiFetch("/v1/refine", { method: "POST", body }),
    history: {
      list: (query) => apiFetch("/v1/history", { query }),
      delete: (id) => apiFetch(`/v1/history/${id}`, { method: "DELETE" })
    },
    tones: {
      list: () => apiFetch("/v1/tones"),
      create: (body) => apiFetch("/v1/tones", { method: "POST", body }),
      update: (id, body) => apiFetch(`/v1/tones/${id}`, { method: "PUT", body }),
      delete: (id) => apiFetch(`/v1/tones/${id}`, { method: "DELETE" })
    },
    providers: {
      list: () => apiFetch("/v1/providers")
    }
  };
};
class JsonStore {
  path;
  data;
  constructor(filename, defaults) {
    this.path = path.join(electron.app.getPath("userData"), filename);
    let loaded = {};
    try {
      loaded = JSON.parse(fs.readFileSync(this.path, "utf8"));
    } catch {
    }
    this.data = { ...defaults, ...loaded };
  }
  get(key) {
    return this.data[key];
  }
  set(patch) {
    this.data = { ...this.data, ...patch };
    this.flush();
  }
  flush() {
    const tmp = `${this.path}.tmp`;
    fs.mkdirSync(path.dirname(this.path), { recursive: true });
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
    fs.renameSync(tmp, this.path);
  }
}
const DEFAULTS = {
  serverUrl: "",
  deviceName: "",
  toneSlug: "",
  modelId: "",
  shortcut: "CommandOrControl+Shift+R",
  autoApply: false,
  overlayCorner: "bottom-left",
  launchAtLogin: false,
  encryptedSessionToken: "",
  plainSessionToken: ""
};
class AppState {
  store = new JsonStore("settings.json", DEFAULTS);
  listeners = /* @__PURE__ */ new Set();
  tones = [];
  models = [];
  get sessionToken() {
    const encrypted = this.store.get("encryptedSessionToken");
    if (encrypted) {
      try {
        return electron.safeStorage.decryptString(Buffer.from(encrypted, "base64"));
      } catch {
        return "";
      }
    }
    return this.store.get("plainSessionToken");
  }
  get connected() {
    return Boolean(this.store.get("serverUrl") && this.sessionToken);
  }
  get serverUrl() {
    return this.store.get("serverUrl");
  }
  get toneSlug() {
    return this.store.get("toneSlug");
  }
  get modelId() {
    return this.store.get("modelId");
  }
  get shortcut() {
    return this.store.get("shortcut");
  }
  get autoApply() {
    return this.store.get("autoApply");
  }
  get overlayCorner() {
    return this.store.get("overlayCorner");
  }
  snapshot() {
    return {
      connected: this.connected,
      serverUrl: this.store.get("serverUrl"),
      deviceName: this.store.get("deviceName"),
      toneSlug: this.store.get("toneSlug"),
      modelId: this.store.get("modelId"),
      shortcut: this.store.get("shortcut"),
      autoApply: this.store.get("autoApply"),
      overlayCorner: this.store.get("overlayCorner"),
      launchAtLogin: this.store.get("launchAtLogin"),
      tones: this.tones,
      models: this.models
    };
  }
  update(patch) {
    this.store.set(patch);
    this.emit();
  }
  setServerConfig(serverUrl, sessionToken, deviceName) {
    const secure = electron.safeStorage.isEncryptionAvailable();
    this.store.set({
      serverUrl,
      deviceName,
      encryptedSessionToken: secure ? electron.safeStorage.encryptString(sessionToken).toString("base64") : "",
      plainSessionToken: secure ? "" : sessionToken
    });
    this.emit();
  }
  clearServerConfig() {
    this.tones = [];
    this.models = [];
    this.store.set({
      serverUrl: "",
      deviceName: "",
      toneSlug: "",
      modelId: "",
      encryptedSessionToken: "",
      plainSessionToken: ""
    });
    this.emit();
  }
  setCatalog(tones, models) {
    this.tones = tones;
    this.models = models;
    const patch = {};
    if (!tones.some((t2) => t2.slug === this.toneSlug)) {
      patch.toneSlug = tones[0]?.slug ?? "";
    }
    if (!models.some((m) => m.id === this.modelId)) {
      patch.modelId = models[0]?.id ?? "";
    }
    if (Object.keys(patch).length) this.store.set(patch);
    this.emit();
  }
  setTones(tones) {
    this.setCatalog(tones, this.models);
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit() {
    for (const listener of this.listeners) listener();
  }
}
const state = new AppState();
let cached$1 = null;
const getClient = () => {
  const baseURL = state.serverUrl;
  const sessionToken = state.sessionToken;
  if (!baseURL || !sessionToken) return null;
  const key = `${baseURL}|${sessionToken}`;
  if (cached$1?.key !== key) {
    cached$1 = { key, client: createClient({ baseURL, sessionToken }) };
  }
  return cached$1.client;
};
const apiError = (e) => {
  const err = e;
  return err?.data?.message ?? err?.message ?? "Connection failed";
};
const bootstrapCatalog = async () => {
  const client = getClient();
  if (!client) return;
  const [tones, { providers }] = await Promise.all([
    client.tones.list(),
    client.providers.list()
  ]);
  const models = providers.flatMap((p) => p.models).filter((m) => m.enabledByUser !== false);
  state.setCatalog(tones, models);
};
const pairAndBootstrap = async ({
  serverUrl,
  pairingToken,
  deviceName
}) => {
  const url = serverUrl.trim().replace(/\/$/, "");
  const token = pairingToken.trim();
  const name = deviceName.trim() || "My Desktop";
  if (!url) return { ok: false, error: "Server URL is required" };
  if (!token) return { ok: false, error: "Pairing token is required" };
  try {
    const { sessionToken } = await createClient({ baseURL: url }).auth.pair({
      pairingToken: token,
      deviceName: name
    });
    state.setServerConfig(url, sessionToken, name);
    await bootstrapCatalog();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: apiError(e) };
  }
};
const exec = util.promisify(child_process.execFile);
let cached = null;
const hasCommand = (command) => child_process.spawnSync("which", [command], { stdio: "ignore" }).status === 0;
const detectCapability = () => {
  if (cached) return cached;
  if (process.platform === "linux") {
    if (process.env["XDG_SESSION_TYPE"] === "wayland") {
      cached = {
        capability: "manual",
        reason: "Wayland doesn't allow simulating keystrokes. Copy text yourself, press the shortcut, then paste the result."
      };
    } else if (!hasCommand("xdotool")) {
      cached = {
        capability: "manual",
        reason: "xdotool is not installed. Install it for automatic copy/paste (e.g. sudo apt install xdotool)."
      };
    } else {
      cached = { capability: "full" };
    }
    return cached;
  }
  cached = { capability: "full" };
  return cached;
};
const modifier = process.platform === "darwin" ? "cmd" : "ctrl";
const simulate = async (key) => {
  if (detectCapability().capability !== "full") return;
  if (process.platform === "linux") {
    await exec("xdotool", ["key", "--clearmodifiers", `${modifier}+${key}`]);
    return;
  }
  if (process.platform === "darwin") {
    await exec("osascript", [
      "-e",
      `tell application "System Events" to keystroke "${key}" using command down`
    ]);
    return;
  }
  if (process.platform === "win32") {
    await exec("powershell", [
      "-NoProfile",
      "-NonInteractive",
      "-WindowStyle",
      "Hidden",
      "-Command",
      `Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^${key}')`
    ]);
  }
};
const simulateCopy = () => simulate("c");
const simulatePaste = () => simulate("v");
let currentAccelerator = null;
let onTrigger = null;
let paused = false;
const setTrigger = (handler) => {
  onTrigger = handler;
};
const registerShortcut = (accelerator) => {
  electron.globalShortcut.unregisterAll();
  currentAccelerator = accelerator;
  if (paused || !accelerator) return true;
  try {
    electron.globalShortcut.register(accelerator, () => onTrigger?.());
    return electron.globalShortcut.isRegistered(accelerator);
  } catch {
    return false;
  }
};
const setRecording = (recording) => {
  paused = recording;
  if (recording) {
    electron.globalShortcut.unregisterAll();
  } else if (currentAccelerator) {
    registerShortcut(currentAccelerator);
  }
};
const unregisterAll = () => electron.globalShortcut.unregisterAll();
const broadcastState = () => {
  const snapshot = state.snapshot();
  for (const win of electron.BrowserWindow.getAllWindows()) {
    win.webContents.send(EVENTS.stateChanged, snapshot);
  }
};
const requireClient = () => {
  const client = getClient();
  if (!client) throw new Error("Not connected");
  return client;
};
const refreshTones = async () => {
  try {
    state.setTones(await requireClient().tones.list());
  } catch {
  }
};
const registerIpc = () => {
  state.subscribe(broadcastState);
  electron.ipcMain.handle(IPC.settingsGet, () => state.snapshot());
  electron.ipcMain.handle(
    IPC.settingsUpdate,
    (_e, patch) => {
      const shortcutChanged = patch.shortcut !== void 0 && patch.shortcut !== state.shortcut;
      state.update(patch);
      let shortcutOk;
      if (shortcutChanged) shortcutOk = registerShortcut(state.shortcut);
      if (patch.launchAtLogin !== void 0 && process.platform !== "linux") {
        electron.app.setLoginItemSettings({ openAtLogin: patch.launchAtLogin });
      }
      return { snapshot: state.snapshot(), shortcutOk };
    }
  );
  electron.ipcMain.handle(IPC.shortcutSetRecording, (_e, recording) => {
    setRecording(recording);
  });
  electron.ipcMain.handle(IPC.systemCapabilities, () => {
    const { capability, reason } = detectCapability();
    return {
      platform: process.platform,
      keySim: capability,
      keySimReason: reason,
      safeStorage: electron.safeStorage.isEncryptionAvailable(),
      hostname: os.hostname()
    };
  });
  electron.ipcMain.handle(
    IPC.sessionPair,
    (_e, input) => pairAndBootstrap(input)
  );
  electron.ipcMain.handle(IPC.pairConsume, () => consumePendingPair());
  electron.ipcMain.handle(IPC.sessionDisconnect, () => {
    state.clearServerConfig();
  });
  electron.ipcMain.handle(IPC.sessionBootstrap, async () => {
    try {
      await bootstrapCatalog();
    } catch (e) {
      throw new Error(apiError(e));
    }
  });
  electron.ipcMain.handle(IPC.refineRun, async (_e, body) => {
    try {
      return await requireClient().refine(body);
    } catch (e) {
      throw new Error(apiError(e));
    }
  });
  electron.ipcMain.handle(IPC.tonesList, () => requireClient().tones.list());
  electron.ipcMain.handle(IPC.tonesCreate, async (_e, body) => {
    const tone = await requireClient().tones.create(body);
    await refreshTones();
    return tone;
  });
  electron.ipcMain.handle(
    IPC.tonesUpdate,
    async (_e, id, body) => {
      const tone = await requireClient().tones.update(id, body);
      await refreshTones();
      return tone;
    }
  );
  electron.ipcMain.handle(IPC.tonesDelete, async (_e, id) => {
    await requireClient().tones.delete(id);
    await refreshTones();
  });
  electron.ipcMain.handle(IPC.providersList, () => requireClient().providers.list());
  electron.ipcMain.handle(IPC.historyList, async (_e, limit) => {
    const res = await requireClient().history.list({ limit: limit ?? 50 });
    return res.data;
  });
  electron.ipcMain.handle(
    IPC.historyDelete,
    (_e, id) => requireClient().history.delete(id)
  );
};
const WIDTH = 220;
const HEIGHT = 52;
const INSET = 16;
let overlay = null;
let hideTimer = null;
const load = (win) => {
  if (process.env["ELECTRON_RENDERER_URL"]) {
    win.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}#/overlay`);
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"), { hash: "/overlay" });
  }
};
const ensureOverlay = () => {
  if (overlay && !overlay.isDestroyed()) return overlay;
  overlay = new electron.BrowserWindow({
    width: WIDTH,
    height: HEIGHT,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    alwaysOnTop: true,
    show: false,
    webPreferences: { preload: path.join(__dirname, "../preload/index.js") }
  });
  overlay.setAlwaysOnTop(true, "screen-saver");
  overlay.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlay.setIgnoreMouseEvents(true);
  load(overlay);
  return overlay;
};
const positionFor = (corner) => {
  const display = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint());
  const { x, y, width, height } = display.workArea;
  const left = corner.endsWith("left") ? x + INSET : x + width - WIDTH - INSET;
  const top = corner.startsWith("top") ? y + INSET : y + height - HEIGHT - INSET;
  return { x: Math.round(left), y: Math.round(top) };
};
const showOverlay = (payload, autoHideMs) => {
  const win = ensureOverlay();
  const { x, y } = positionFor(state.overlayCorner);
  win.setBounds({ x, y, width: WIDTH, height: HEIGHT });
  const send = () => win.webContents.send(EVENTS.overlayState, payload);
  if (win.webContents.isLoading()) win.webContents.once("did-finish-load", send);
  else send();
  win.showInactive();
  if (hideTimer) clearTimeout(hideTimer);
  if (autoHideMs) hideTimer = setTimeout(() => hideOverlay(), autoHideMs);
};
const hideOverlay = () => {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  if (overlay && !overlay.isDestroyed()) overlay.hide();
};
const createOverlayWindow = () => {
  ensureOverlay();
};
const sleep = (ms) => new Promise((r2) => setTimeout(r2, ms));
let inFlight = false;
let lastRun = 0;
const pollClipboard = async (previous) => {
  for (let i = 0; i < 20; i++) {
    await sleep(50);
    const text = electron.clipboard.readText();
    if (text && text !== previous) return text;
  }
  return "";
};
const runShortcutRefine = async () => {
  const now = Date.now();
  if (inFlight || now - lastRun < 400) return;
  inFlight = true;
  const capability = detectCapability().capability;
  const previousClipboard = electron.clipboard.readText();
  try {
    const { connected, modelId, toneSlug } = state.snapshot();
    if (!connected || !modelId || !toneSlug) {
      showOverlay({ state: "error", message: "Not connected" }, 2500);
      return;
    }
    let text;
    if (capability === "full") {
      electron.clipboard.clear();
      await sleep(150);
      await simulateCopy();
      text = await pollClipboard("");
      if (!text) {
        if (previousClipboard) electron.clipboard.writeText(previousClipboard);
        showOverlay({ state: "error", message: "No text selected" }, 2500);
        return;
      }
    } else {
      text = previousClipboard;
      if (!text) {
        showOverlay({ state: "error", message: "Clipboard is empty" }, 2500);
        return;
      }
    }
    showOverlay({ state: "refining", message: "Refining…" });
    let refined;
    try {
      const client = getClient();
      if (!client) throw new Error("Not connected");
      const res = await client.refine({ text, modelId, toneSlug });
      refined = res.refined;
    } catch (e) {
      if (capability === "full" && previousClipboard) {
        electron.clipboard.writeText(previousClipboard);
      }
      showOverlay({ state: "error", message: apiError(e) }, 2500);
      return;
    }
    electron.clipboard.writeText(refined);
    if (state.autoApply && capability === "full") {
      await sleep(120);
      await simulatePaste();
    }
    showOverlay({ state: "success", message: "Refined" }, 1200);
    const entry = {
      id: `shortcut-${now}`,
      source: text,
      refined,
      modelId,
      toneSlug,
      createdAt: now
    };
    getMainWindow()?.webContents.send(EVENTS.historyPrepend, entry);
  } finally {
    inFlight = false;
    lastRun = Date.now();
  }
};
let tray = null;
const iconPath = (name) => electron.app.isPackaged ? path.join(process.resourcesPath, "tray", name) : path.join(__dirname, "../../resources/tray", name);
const trayImage = () => {
  const name = process.platform === "darwin" ? "trayTemplate.png" : "tray-32.png";
  const image = electron.nativeImage.createFromPath(iconPath(name));
  if (process.platform === "darwin") image.setTemplateImage(true);
  return image;
};
const buildMenu = () => {
  const { tones, models, toneSlug, modelId } = state.snapshot();
  const modelItems = models.length ? models.map((m) => ({
    label: m.label,
    type: "radio",
    checked: m.id === modelId,
    click: () => state.update({ modelId: m.id })
  })) : [{ label: "No models", enabled: false }];
  const toneItems = tones.length ? tones.map((t2) => ({
    label: t2.name,
    type: "radio",
    checked: t2.slug === toneSlug,
    click: () => state.update({ toneSlug: t2.slug })
  })) : [{ label: "No tones", enabled: false }];
  return electron.Menu.buildFromTemplate([
    { label: "Open Refine", click: () => createMainWindow() },
    { type: "separator" },
    { label: "Model", submenu: modelItems },
    { label: "Tone", submenu: toneItems },
    { type: "separator" },
    { label: "Quit", click: () => electron.app.quit() }
  ]);
};
const refreshTray = () => {
  if (!tray) return;
  tray.setContextMenu(buildMenu());
};
const createTray = () => {
  if (tray) return;
  tray = new electron.Tray(trayImage());
  tray.setToolTip("Refine");
  tray.on("click", () => createMainWindow());
  refreshTray();
  state.subscribe(refreshTray);
};
const gotLock = electron.app.requestSingleInstanceLock();
if (!gotLock) {
  electron.app.quit();
} else {
  registerProtocolClient();
  electron.app.on("second-instance", (_e, argv) => {
    const win = getMainWindow() ?? createMainWindow();
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
    const link = findDeepLink(argv);
    if (link) handleDeepLink(link);
  });
  electron.app.on("open-url", (e, url) => {
    e.preventDefault();
    handleDeepLink(url);
  });
  electron.app.whenReady().then(() => {
    registerIpc();
    createMainWindow();
    createOverlayWindow();
    createTray();
    setTrigger(runShortcutRefine);
    registerShortcut(state.shortcut);
    const link = findDeepLink(process.argv);
    if (link) handleDeepLink(link);
    electron.app.on("activate", () => {
      if (electron.BrowserWindow.getAllWindows().length === 0) createMainWindow();
    });
  });
  electron.app.on("before-quit", () => setQuitting(true));
  electron.app.on("will-quit", () => unregisterAll());
}
exports.br = br;
exports.qn = qn;
