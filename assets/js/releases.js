// Fetches the latest GitHub release for the repo declared on the host section
// (data-release-repo="<owner>/<repo>") and renders its title, date, body, and
// download link. The body is GitHub-flavored markdown; we render a safe subset
// (headings, lists, inline emphasis/code, http(s) links) by escaping all HTML
// first and then applying a small set of pattern transforms — no external libs.

(function () {
  "use strict";

  var section = document.querySelector("[data-release-repo]");
  if (!section) return;

  var repo = section.getAttribute("data-release-repo");
  if (!repo) return;

  var titleEl    = section.querySelector("[data-release-title]");
  var eyebrowEl  = section.querySelector("[data-release-eyebrow]");
  var metaEl     = section.querySelector("[data-release-meta]");
  var notesEl    = section.querySelector("[data-release-notes]");
  var fallbackUrl   = section.getAttribute("data-release-fallback-url") || "";
  var fallbackLabel = section.getAttribute("data-release-fallback-label") || "the community";

  fetch("https://api.github.com/repos/" + repo + "/releases/latest", {
    headers: { Accept: "application/vnd.github+json" }
  })
    .then(function (r) {
      if (!r.ok) throw new Error("GitHub releases API returned " + r.status);
      return r.json();
    })
    .then(function (release) {
      var version = release.tag_name || "";
      var name    = release.name || release.tag_name || "Latest release";
      var date    = release.published_at ? new Date(release.published_at) : null;

      if (eyebrowEl) {
        eyebrowEl.textContent = version
          ? "Latest release · " + version
          : "Latest release";
      }
      if (titleEl) titleEl.textContent = name;

      if (metaEl && date) {
        metaEl.hidden = false;
        metaEl.textContent =
          "Released " +
          date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
          });
      }

      if (notesEl) {
        notesEl.innerHTML = renderMarkdown(release.body || "");
      }
    })
    .catch(function (err) {
      console.warn("Could not load latest release:", err);
      if (notesEl) {
        notesEl.innerHTML =
          '<p class="release-notes__error">' +
          "Couldn't load the latest release notes. " +
          (fallbackUrl
            ? 'Join us on <a href="' +
              escapeAttr(fallbackUrl) +
              '" rel="noopener" target="_blank">' +
              escapeHTML(fallbackLabel) +
              "</a> for the latest news on builds."
            : "Try again later.") +
          "</p>";
      }
    });

  // ---- Tiny markdown renderer (safe-by-construction) -----------------------
  function escapeHTML(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function escapeAttr(s) { return escapeHTML(String(s)); }

  function renderMarkdown(text) {
    if (!text) return "";

    // 1) Escape everything first. From here on we only inject our own tags via
    //    controlled patterns — input HTML cannot reach the DOM.
    var src = escapeHTML(text);

    // 2) Strip carriage returns from CRLF release bodies.
    src = src.replace(/\r\n/g, "\n");

    var lines = src.split("\n");
    var out = [];
    var paragraph = [];
    var inList = false;

    function flushParagraph() {
      if (paragraph.length) {
        out.push("<p>" + applyInline(paragraph.join(" ")) + "</p>");
        paragraph = [];
      }
    }
    function closeList() {
      if (inList) { out.push("</ul>"); inList = false; }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      var heading = line.match(/^(#{1,4})\s+(.*)$/);
      if (heading) {
        flushParagraph(); closeList();
        // Demote h1/h2 in release bodies to h3/h4 so they don't out-rank the
        // page's own h2 ("What's in the build").
        var level = Math.min(6, heading[1].length + 2);
        out.push(
          "<h" + level + ">" + applyInline(heading[2]) + "</h" + level + ">"
        );
        continue;
      }

      var bullet = line.match(/^\s*[-*+]\s+(.*)$/);
      if (bullet) {
        flushParagraph();
        if (!inList) { out.push("<ul>"); inList = true; }
        out.push("<li>" + applyInline(bullet[1]) + "</li>");
        continue;
      }

      if (/^\s*$/.test(line)) {
        flushParagraph(); closeList();
        continue;
      }

      // Continuation line — accumulate until a blank line or new block.
      closeList();
      paragraph.push(line.trim());
    }
    flushParagraph(); closeList();

    return out.join("\n");
  }

  function applyInline(s) {
    // Inline code first so backticks aren't consumed by emphasis.
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    // Bold (run before italic so ** isn't eaten by single-* rule).
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    // Italic — only when the * isn't part of **.
    s = s.replace(/(^|[\s(])\*([^*]+)\*(?=[\s).,!?;:]|$)/g, "$1<em>$2</em>");
    s = s.replace(/(^|[\s(])_([^_]+)_(?=[\s).,!?;:]|$)/g, "$1<em>$2</em>");
    // Links — only http(s) URLs allowed (input is already HTML-escaped, so
    // the URL we capture cannot contain raw quotes/angle brackets).
    s = s.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      '<a href="$2" rel="noopener" target="_blank">$1</a>'
    );
    return s;
  }
})();
