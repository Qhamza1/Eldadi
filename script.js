(function () {
  "use strict";

  /* ===== إعدادات سهلة التعديل ===== */
  var CONFIG = {
    logo: "logo.png",          // مسار اللوجو (الانترو + الفوتر)
    introText: "KG schedules", // الكلام تحت اللوجو في الانترو
    introDuration: 2500        // مدة الانترو بالملي ثانية
  };

  /* ===== اللوجو + نص الانترو ===== */
  Array.prototype.forEach.call(document.querySelectorAll("img[data-logo]"), function (img) {
    img.src = CONFIG.logo;
  });
  var introText = document.getElementById("introText");
  if (introText) introText.textContent = CONFIG.introText;

  /* ===== رسائل وأرقام التواصل (عدّل هنا بس) ===== */
  var CONTACT = {
    nurseryPhone: "201013839155", // رقم واتساب الحضانة (بصيغة دولية بدون + وبدون صفر)
    devPhone: "",                 // رقم واتساب المطور (سيبه فاضي لو عايز رقمه يفضل من الـ HTML)

    // كل سطر جوه [ ] هو سطر في رسالة الواتساب. "" معناها سطر فاضي.
    messages: {
      booking: [                       // كارت: حجز طالب جديد
        "السلام عليكم 👋",
        "أنا ولي أمر وعايز أحجز لطفلي في الحضانة.",
        "",
        "اسم الطفل:",
        "السن:",
        "المرحلة (KG / تأسيس):",
        "رقم التواصل:"
      ],
      problem: [                       // كارت: مشكلة أو شكوى
        "السلام عليكم 👋",
        "عندي مشكلة وعايز أبلغ بيها.",
        "",
        "اسم الطفل:",
        "الفصل:",
        "تفاصيل المشكلة:"
      ],
      inquiry: [                       // كارت: استفسار عام
        "السلام عليكم 👋",
        "عندي استفسار عن الحضانة:",
        ""
      ],
      suggestion: [                    // كارت: اقتراح
        "السلام عليكم 👋",
        "عندي اقتراح معين لو:",
        ""
      ],
      general: [                       // زرار "تواصل عبر واتساب" الأخضر
        "السلام عليكم 👋",
        "عايز أتواصل معاكم بخصوص الحضانة."
      ]
    }
  };
  // ترتيب الكروت الأربعة في الصفحة (من اليمين لليسار)
  var REASON_KEYS = ["booking", "problem", "inquiry", "suggestion"];

  function waLink(phone, lines) {
    var url = "https://wa.me/" + phone;
    if (lines && lines.length) url += "?text=" + encodeURIComponent(lines.join("\n"));
    return url;
  }

  Array.prototype.forEach.call(document.querySelectorAll(".contact-reasons .reason"), function (a, i) {
    var key = REASON_KEYS[i];
    if (key) a.href = waLink(CONTACT.nurseryPhone, CONTACT.messages[key]);
  });
  var mainWa = document.querySelector(".btn-wa");
  if (mainWa) mainWa.href = waLink(CONTACT.nurseryPhone, CONTACT.messages.general);
  var callBtn = document.querySelector(".btn-call");
  if (callBtn) callBtn.href = "tel:+" + CONTACT.nurseryPhone;
  var devWa = document.querySelector(".icon-btn.wa");
  if (devWa && CONTACT.devPhone) devWa.href = waLink(CONTACT.devPhone);

  /* ===== الانترو ===== */
  var intro = document.getElementById("intro");
  function closeIntro() {
    if (!intro || intro.classList.contains("hide")) return;
    intro.classList.add("hide");
    document.body.classList.remove("intro-open");
    setTimeout(function () { if (intro) intro.remove(); }, 700);
  }
  if (intro) {
    setTimeout(closeIntro, CONFIG.introDuration);
    intro.addEventListener("click", closeIntro); // اضغط لتخطي الانترو
  }

  /* ===== التنقل بين الرئيسية والجداول ===== */
  var title = document.querySelector("main > header h1");
  var sections = Array.prototype.slice.call(document.querySelectorAll("main > section"));

  function route() {
    var name = location.hash.replace("#", "");
    var target = document.getElementById(!name || name === "home" ? "home" : "view-" + name) || sections[0];
    sections.forEach(function (sec) { sec.hidden = sec !== target; });
    var t = target.getAttribute("data-title");
    if (title && t) title.textContent = t;
    if (t) document.title = t;
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();

  /* ===== تجهيز كل جدول (زراير + تلوين + اليوم) ===== */
  var tints = [
    ["فسحة", "cell-break"],
    ["إفطار", "cell-meal"],
    ["فقرة رياضية", "cell-sport"],
    ["انتظار باص", "cell-bus"]
  ];
  var subjects = ["فسحة", "قرآن", "إفطار", "حساب", "عربي", "انجليزي"];
  var dayToRow = { 6: 0, 0: 1, 1: 2, 2: 3, 3: 4, 4: 5 }; // السبت=0 ... الخميس=5

  function setupView(view) {
    var table = view.querySelector("table");
    if (!table) return;

    var headers = Array.prototype.map.call(
      table.querySelectorAll("thead th"),
      function (th) { return th.textContent.trim(); }
    );
    var rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr"));
    var cells = Array.prototype.slice.call(table.querySelectorAll("tbody td"));

    rows.forEach(function (row) {
      Array.prototype.forEach.call(row.querySelectorAll("td"), function (td, i) {
        td.setAttribute("data-label", headers[i + 1] || "");
        tints.forEach(function (t) {
          if (td.textContent.indexOf(t[0]) !== -1) td.classList.add(t[1]);
        });
      });
    });

    var toolbar = document.createElement("div");
    toolbar.className = "toolbar";

    var label = document.createElement("span");
    label.className = "label";
    label.textContent = "🔎 إبراز:";
    toolbar.appendChild(label);

    var active = null;
    var subjectButtons = [];
    function applyFilter(subject) {
      active = subject;
      table.classList.toggle("has-filter", !!subject);
      cells.forEach(function (td) {
        td.classList.toggle("is-match", !!subject && td.textContent.indexOf(subject) !== -1);
      });
      subjectButtons.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.subject === subject));
      });
    }
    subjects.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = s;
      b.dataset.subject = s;
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () { applyFilter(active === s ? null : s); });
      subjectButtons.push(b);
      toolbar.appendChild(b);
    });

    var todayRow = rows[dayToRow[new Date().getDay()]] || null;
    var todayBtn = document.createElement("button");
    todayBtn.type = "button";
    todayBtn.textContent = "⭐ يوم اليوم";
    function setToday(on) {
      if (todayRow) todayRow.classList.toggle("is-today", on);
      todayBtn.setAttribute("aria-pressed", String(on));
    }
    setToday(true);
    todayBtn.addEventListener("click", function () {
      setToday(todayBtn.getAttribute("aria-pressed") !== "true");
    });
    if (!todayRow) todayBtn.disabled = true; // الجمعة: مفيش يوم
    toolbar.appendChild(todayBtn);

    var printBtn = document.createElement("button");
    printBtn.type = "button";
    printBtn.className = "print-btn";
    printBtn.textContent = "🖨️ طباعة";
    printBtn.addEventListener("click", function () { window.print(); });
    toolbar.appendChild(printBtn);

    table.parentNode.insertBefore(toolbar, table);
  }

  Array.prototype.forEach.call(document.querySelectorAll(".schedule-view"), setupView);
})();
