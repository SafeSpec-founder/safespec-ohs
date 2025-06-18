if (!self.define) {
  let e,
    s = {};
  const i = (i, n) => (
    (i = new URL(i + ".js", n).href),
    s[i] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = i), (e.onload = s), document.head.appendChild(e);
        } else (e = i), importScripts(i), s();
      }).then(() => {
        let e = s[i];
        if (!e) throw new Error(`Module ${i} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, r) => {
    const t =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[t]) return;
    let l = {};
    const o = (e) => i(e, t),
      u = { module: { uri: t }, exports: l, require: o };
    s[t] = Promise.all(n.map((e) => u[e] || o(e))).then((e) => (r(...e), l));
  };
}
define(["./workbox-5ffe50d4"], function (e) {
  "use strict";
  self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: "assets/html2canvas.esm-CBrSDip1.js", revision: null },
        { url: "assets/index-D-qwPT7M.js", revision: null },
        { url: "assets/index-vasRhAHe.css", revision: null },
        { url: "assets/index.es-4lLbDOn9.js", revision: null },
        { url: "assets/purify.es-CQJ0hv7W.js", revision: null },
        { url: "index.html", revision: "6308826bfe9f85f7782bb778a21cefd0" },
        { url: "registerSW.js", revision: "1872c500de691dce40960bb85481de07" },
        {
          url: "manifest.webmanifest",
          revision: "a791c1f704355e7fa170a9663e884c04",
        },
      ],
      {},
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      new e.NavigationRoute(e.createHandlerBoundToURL("index.html")),
    );
});
//# sourceMappingURL=sw.js.map
