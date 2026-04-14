(function () {
  function measureHeight(frame) {
    try {
      var doc = frame.contentDocument || (frame.contentWindow && frame.contentWindow.document);
      if (!doc) {
        return;
      }

      var body = doc.body;
      var html = doc.documentElement;
      var minHeight = parseInt(frame.getAttribute("data-min-height") || "0", 10) || 0;
      var height = Math.max(
        minHeight,
        body ? body.scrollHeight : 0,
        body ? body.offsetHeight : 0,
        html ? html.scrollHeight : 0,
        html ? html.offsetHeight : 0,
        html ? html.clientHeight : 0
      );

      if (height > 0) {
        frame.style.height = height + "px";
      }
    } catch (error) {
      // Ignore frames that cannot be measured.
    }
  }

  function bindFrame(frame) {
    frame.setAttribute("scrolling", "no");
    frame.style.overflow = "hidden";

    frame.addEventListener("load", function () {
      measureHeight(frame);
      var checks = 0;
      var timer = setInterval(function () {
        checks += 1;
        measureHeight(frame);
        if (checks >= 24) {
          clearInterval(timer);
        }
      }, 250);
    });

    if (frame.contentDocument && frame.contentDocument.readyState === "complete") {
      measureHeight(frame);
    }
  }

  function init() {
    var frames = document.querySelectorAll("iframe.embed-frame");
    frames.forEach(bindFrame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
