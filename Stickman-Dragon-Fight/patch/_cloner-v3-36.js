window.PokiFileHostName = window.PokiFileHostName || "qa-files.poki.com";
window.CoolMathHostName = window.CoolMathHostName || "www.coolmath-games.com";
window.ClonerLog = window.ClonerLog || console.log;
window.ClonerTrace = window.ClonerTrace || console.trace;
window.ConsoleClear = window.ConsoleClear || console.clear;
window.OriginalWindowOpen = window.OriginalWindowOpen || window.open;
window.OriginalEval = window.OriginalEval || eval;

(function async () {
  const DATA_PARTS = 4;
  const WASM_PARTS = 4;

  const totalParts = DATA_PARTS + WASM_PARTS;
  const partProgress = new Array(totalParts).fill(0);
  const partSizes = new Array(totalParts).fill(0);

  let externalProgressCallback = null;

  function reportProgress(index, loaded, total) {
    if (total > 0) partSizes[index] = total;
    partProgress[index] = loaded;
    const totalBytes = partSizes.reduce((a, b) => a + b, 0);
    const loadedBytes = partProgress.reduce((a, b) => a + b, 0);
    const ratio = totalBytes > 0 ? loadedBytes / totalBytes : 0;
    if (externalProgressCallback) externalProgressCallback(ratio);
  }

  async function fetchParts(baseUrl, count, startIndex, label) {
    const buffers = await Promise.all(
      Array.from({ length: count }, (_, i) => {
        const url = `${baseUrl}.part${i + 1}`;
        const idx = startIndex + i;
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", url, true);
          xhr.responseType = "arraybuffer";
          xhr.onprogress = (e) => {
            if (e.lengthComputable) reportProgress(idx, e.loaded, e.total);
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              reportProgress(
                idx,
                xhr.response.byteLength,
                xhr.response.byteLength,
              );
              resolve(xhr.response);
            } else {
              reject(
                new Error(
                  `Failed to fetch ${label} part ${i + 1}: ${xhr.status}`,
                ),
              );
            }
          };
          xhr.onerror = () =>
            reject(new Error(`Network error fetching ${label} part ${i + 1}`));
          xhr.send();
        });
      }),
    );

    const totalSize = buffers.reduce((a, b) => a + b.byteLength, 0);
    const merged = new Uint8Array(totalSize);
    let offset = 0;
    for (const buf of buffers) {
      merged.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }
    return merged.buffer;
  }

  const originalFetch = window.fetch;

  window.fetch = async function (input, init) {
    const url =
      typeof input === "string"
        ? input
        : input instanceof Request
          ? input.url
          : String(input);

    const dataMatch = url.match(/^(.*BuildWeb\.data)(\?.*)?$/);
    if (dataMatch && DATA_PARTS > 0) {
      const base = dataMatch[1];
      const buffer = await fetchParts(base, DATA_PARTS, 0, "data");
      return new Response(buffer, {
        status: 200,
        headers: { "Content-Type": "application/octet-stream" },
      });
    }

    const wasmMatch = url.match(/^(.*BuildWeb\.wasm)(\?.*)?$/);
    if (wasmMatch && WASM_PARTS > 0) {
      const base = wasmMatch[1];
      const buffer = await fetchParts(base, WASM_PARTS, DATA_PARTS, "wasm");
      return new Response(buffer, {
        status: 200,
        headers: { "Content-Type": "application/wasm" },
      });
    }

    return originalFetch.apply(this, arguments);
  };

  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._interceptUrl = url;
    return originalXHROpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    const url = this._interceptUrl || "";
    const dataMatch = url.match(/^(.*BuildWeb\.data)(\?.*)?$/);
    const wasmMatch = url.match(/^(.*BuildWeb\.wasm)(\?.*)?$/);

    if ((dataMatch && DATA_PARTS > 0) || (wasmMatch && WASM_PARTS > 0)) {
      const isData = !!dataMatch;
      const base = isData ? dataMatch[1] : wasmMatch[1];
      const count = isData ? DATA_PARTS : WASM_PARTS;
      const startIdx = isData ? 0 : DATA_PARTS;
      const label = isData ? "data" : "wasm";
      const self = this;

      fetchParts(base, count, startIdx, label)
        .then((buffer) => {
          Object.defineProperty(self, "response", {
            value: buffer,
            writable: true,
          });
          Object.defineProperty(self, "responseType", {
            get: () => "arraybuffer",
          });
          Object.defineProperty(self, "status", {
            value: 200,
            writable: true,
          });
          Object.defineProperty(self, "readyState", {
            value: 4,
            writable: true,
          });

          const loadEvent = new ProgressEvent("load", {
            lengthComputable: true,
            loaded: buffer.byteLength,
            total: buffer.byteLength,
          });
          if (typeof self.onload === "function") self.onload(loadEvent);
          self.dispatchEvent(loadEvent);

          const readyEvent = new Event("readystatechange");
          if (typeof self.onreadystatechange === "function")
            self.onreadystatechange(readyEvent);
          self.dispatchEvent(readyEvent);
        })
        .catch((err) => {
          const errEvent = new ProgressEvent("error");
          if (typeof self.onerror === "function") self.onerror(errEvent);
          self.dispatchEvent(errEvent);
          console.error(err);
        });

      return;
    }

    return originalXHRSend.apply(this, args);
  };

  window.__setPartLoaderProgressCallback = function (cb) {
    externalProgressCallback = cb;
  };
})();

var d0cum3nt = new Proxy(document, {
  get: function (target, property, receiver) {
    ClonerLog(`d0cum3nt.get.property--${property}--`);
    let targetObj = target[property];
    if (typeof targetObj == "function") {
      return (...args) => target[property].apply(target, args);
    } else {
      if (property == "URL" || property == "location") {
        return "http://localhost:8080/";
      }
      if (property == "URLPoki") {
        return "https://poki.com/";
      }
      if (property == "URLFreezeNova") {
        return "https://freezenova.com/";
      }
      if (property == "URLCrazyGames") {
        return "https://www.crazygames.com/";
      }
      return targetObj;
    }
  },
  set: function (target, property, receiver) {
    ClonerLog(`d0cum3nt.set.property--${property}--${receiver}--`);
    return true;
  },
});

(function () {
  const originalFetch = window.fetch;
  const originalInstantiateStreaming = WebAssembly.instantiateStreaming;

  async function decompressResponse(response) {
    const ds = new DecompressionStream("gzip");
    const decompressed = response.body.pipeThrough(ds);
    // Must set Content-Type to application/wasm for instantiateStreaming to accept it
    const headers = new Headers(response.headers);
    headers.delete("Content-Encoding");
    headers.set("Content-Type", "application/wasm");
    return new Response(decompressed, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  function isUnityweb(url) {
    return typeof url === "string" && url.endsWith(".unityweb");
  }

  window.fetch = async function (input, init) {
    const url = input instanceof Request ? input.url : String(input);
    const response = await originalFetch(input, init);
    if (!response.ok || !isUnityweb(url)) return response;
    return decompressResponse(response);
  };

  WebAssembly.instantiateStreaming = async function (source, imports) {
    let response = await (source instanceof Promise
      ? source
      : Promise.resolve(source));
    if (isUnityweb(response.url)) {
      response = await decompressResponse(response);
    }
    return originalInstantiateStreaming(response, imports);
  };
})();
