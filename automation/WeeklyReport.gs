/**
 * ===========================================================================
 * brendaong.com — weekly report
 * ===========================================================================
 * Emails a Monday morning digest combining:
 *   1. GA4 traffic for brendaong.com (last 7 days vs the 7 before)
 *   2. New CV download requests from the "CV Downloads" response sheet
 *
 * Runs on Google's servers, so your Mac does not need to be on.
 *
 * ---- SETUP (once) --------------------------------------------------------
 *   1. Fill in GA4_PROPERTY_ID below (Admin -> Property Settings -> Property ID,
 *      a number like 123456789 — NOT the G-XXXX measurement ID).
 *   2. Editor sidebar -> Services (+) -> "Google Analytics Data API" -> Add.
 *      The identifier must be AnalyticsData.
 *   3. Run testRun() once and grant permissions when prompted.
 *   4. Run createWeeklyTrigger() once to schedule it.
 * ------------------------------------------------------------------------- */

// ---- CONFIGURE ME ---------------------------------------------------------
var GA4_PROPERTY_ID = '551466218';           // brendaong.com
var EMAIL_TO        = 'bihuiong@outlook.com';
var SITE            = 'brendaong.com';
var SEND_WHEN_QUIET = true;   // false = skip the email in a week with no traffic
// ---------------------------------------------------------------------------


/* =========================== ENTRY POINTS ================================ */

/** The scheduled job. */
function sendWeeklyReport() {
  var ga = GA4_PROPERTY_ID ? fetchGa4() : null;
  var cvs = fetchNewCvRequests();

  if (!SEND_WHEN_QUIET && cvs.length === 0 && (!ga || ga.totals.users === 0)) {
    Logger.log('Quiet week — no email sent.');
    return;
  }

  var subject = buildSubject(ga, cvs);
  MailApp.sendEmail({
    to: EMAIL_TO,
    subject: subject,
    htmlBody: buildHtml(ga, cvs),
    name: SITE
  });
  Logger.log('Sent: ' + subject);
}

/** Run this manually first to check everything works and grant permissions. */
function testRun() {
  sendWeeklyReport();
}

/** Run once to schedule Mondays at 08:00 in your timezone. */
function createWeeklyTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'sendWeeklyReport') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('sendWeeklyReport')
    .timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();
  Logger.log('Scheduled: Mondays around 08:00.');
}


/* ============================== GA4 ====================================== */

function runReport(body) {
  return AnalyticsData.Properties.runReport(body, 'properties/' + GA4_PROPERTY_ID);
}

function rowsOf(resp) {
  if (!resp || !resp.rows) return [];
  return resp.rows.map(function (r) {
    return {
      dims: (r.dimensionValues || []).map(function (d) { return d.value; }),
      vals: (r.metricValues || []).map(function (m) { return Number(m.value || 0); })
    };
  });
}

function fetchGa4() {
  var THIS_WEEK = [{ startDate: '7daysAgo', endDate: 'yesterday' }];
  var PRIOR     = [{ startDate: '14daysAgo', endDate: '8daysAgo' }];
  var CORE = [
    { name: 'totalUsers' }, { name: 'sessions' },
    { name: 'screenPageViews' }, { name: 'averageSessionDuration' }
  ];

  function totals(ranges) {
    var r = rowsOf(runReport({ dateRanges: ranges, metrics: CORE }));
    var v = r.length ? r[0].vals : [0, 0, 0, 0];
    return { users: v[0], sessions: v[1], views: v[2], avgSec: Math.round(v[3]) };
  }

  var now = totals(THIS_WEEK), before = totals(PRIOR);

  var pages = rowsOf(runReport({
    dateRanges: THIS_WEEK,
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 8
  }));

  var sources = rowsOf(runReport({
    dateRanges: THIS_WEEK,
    dimensions: [{ name: 'sessionSourceMedium' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 6
  }));

  var countries = rowsOf(runReport({
    dateRanges: THIS_WEEK,
    dimensions: [{ name: 'country' }],
    metrics: [{ name: 'totalUsers' }],
    orderBys: [{ metric: { metricName: 'totalUsers' }, desc: true }],
    limit: 6
  }));

  var events = rowsOf(runReport({
    dateRanges: THIS_WEEK,
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 25
  })).filter(function (e) {
    return ['cv_download_intent', 'cv_gate_completed', 'outbound_click', 'scroll_depth'].indexOf(e.dims[0]) > -1;
  });

  var repos = rowsOf(runReport({
    dateRanges: THIS_WEEK,
    dimensions: [{ name: 'linkDomain' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      filter: { fieldName: 'eventName', stringFilter: { value: 'outbound_click' } }
    },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 5
  }));

  // Daily visitors for the trend chart. GA4 omits zero days, so map onto a
  // full 30-day sequence rather than trusting the row order or count.
  var raw = rowsOf(runReport({
    dateRanges: [{ startDate: '30daysAgo', endDate: 'yesterday' }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'totalUsers' }],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
    limit: 40
  }));
  var byDate = {};
  raw.forEach(function (r) { byDate[r.dims[0]] = r.vals[0]; });

  var daily = [];
  for (var d = 30; d >= 1; d--) {
    var day = new Date(Date.now() - d * 864e5);
    var key = Utilities.formatDate(day, Session.getScriptTimeZone(), 'yyyyMMdd');
    daily.push({ date: day, users: byDate[key] || 0 });
  }

  return { totals: now, prior: before, pages: pages, sources: sources,
           countries: countries, events: events, repos: repos, daily: daily };
}


/* ========================== CV REQUESTS =================================== */

function fetchNewCvRequests() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var head = data[0].map(function (h) { return String(h).trim().toLowerCase(); });
  function col() {
    for (var a = 0; a < arguments.length; a++) {
      var i = head.indexOf(String(arguments[a]).toLowerCase());
      if (i > -1) return i;
    }
    return -1;
  }
  var cTime = col('timestamp'),
      cName = col('name'),
      cMail = col('email', 'email address'),
      cComp = col('company'),
      cRole = col('role'),
      cCv   = col('cv');

  var cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  var out = [];

  for (var i = 1; i < data.length; i++) {
    var r = data[i];
    var when = cTime > -1 ? new Date(r[cTime]) : null;
    if (when && when < cutoff) continue;
    if (!r.join('').trim()) continue;
    out.push({
      when: when,
      name: cName > -1 ? r[cName] : '',
      email: cMail > -1 ? r[cMail] : '',
      company: cComp > -1 ? r[cComp] : '',
      role: cRole > -1 ? r[cRole] : '',
      cv: cCv > -1 ? String(r[cCv]).replace('Brenda-Ong-CV-', '').replace('.pdf', '').replace(/-/g, ' ') : ''
    });
  }
  out.total = data.length - 1;
  return out;
}


/* ============================ EMAIL ====================================== */

function buildSubject(ga, cvs) {
  var bits = [];
  if (ga) bits.push(ga.totals.users + (ga.totals.users === 1 ? ' visitor' : ' visitors'));
  bits.push(cvs.length + ' CV ' + (cvs.length === 1 ? 'request' : 'requests'));
  return SITE + ' — ' + bits.join(', ') + ' this week';
}

function delta(now, before) {
  if (!before) return now ? '<span style="color:#2E7D32">new</span>' : '—';
  var pct = Math.round(((now - before) / before) * 100);
  if (pct === 0) return '<span style="color:#756E65">level</span>';
  var up = pct > 0;
  return '<span style="color:' + (up ? '#2E7D32' : '#A6321F') + '">' +
         (up ? '&#9650; ' : '&#9660; ') + Math.abs(pct) + '%</span>';
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildHtml(ga, cvs) {
  var A = '#B26136', INK = '#17140F', MUTED = '#756E65', LINE = '#E4DED5';
  var F = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
  var h = [];

  h.push('<div style="font-family:' + F + ';max-width:640px;margin:0 auto;color:' + INK + ';background:#FBF9F6;padding:28px 24px">');
  h.push('<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:' + A + ';margin-bottom:6px">Weekly report</div>');
  h.push('<h1 style="font-size:24px;letter-spacing:-.02em;margin:0 0 4px">' + SITE + '</h1>');
  h.push('<div style="color:' + MUTED + ';font-size:13px;margin-bottom:26px">' +
         Utilities.formatDate(new Date(Date.now() - 7 * 864e5), Session.getScriptTimeZone(), 'd MMM') + ' – ' +
         Utilities.formatDate(new Date(Date.now() - 864e5), Session.getScriptTimeZone(), 'd MMM yyyy') + '</div>');

  /* ---- CV requests first: the thing that actually matters ---- */
  h.push('<div style="background:' + INK + ';border-radius:4px;padding:20px 22px;margin-bottom:26px">');
  h.push('<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:' + A + ';margin-bottom:10px">CV requests</div>');
  if (cvs.length === 0) {
    h.push('<div style="color:rgba(251,249,246,.75);font-size:14px">No new requests this week.' +
           (cvs.total ? ' <span style="color:rgba(251,249,246,.45)">(' + cvs.total + ' all time)</span>' : '') + '</div>');
  } else {
    h.push('<div style="font-size:30px;font-weight:600;color:#FBF9F6;line-height:1;margin-bottom:14px">' + cvs.length +
           '<span style="font-size:13px;font-weight:400;color:rgba(251,249,246,.5)"> new' +
           (cvs.total ? ' &middot; ' + cvs.total + ' all time' : '') + '</span></div>');
    cvs.forEach(function (c) {
      h.push('<div style="border-top:1px solid rgba(251,249,246,.16);padding:11px 0">');
      h.push('<div style="color:#FBF9F6;font-size:14px;font-weight:600">' + esc(c.name) +
             (c.company ? ' <span style="font-weight:400;color:rgba(251,249,246,.6)">&middot; ' + esc(c.company) + '</span>' : '') + '</div>');
      h.push('<div style="font-size:13px;margin-top:2px"><a href="mailto:' + esc(c.email) +
             '" style="color:' + A + ';text-decoration:none">' + esc(c.email) + '</a></div>');
      var meta = [];
      if (c.role) meta.push(esc(c.role));
      if (c.cv) meta.push('wanted the ' + esc(c.cv) + ' CV');
      if (c.when) meta.push(Utilities.formatDate(c.when, Session.getScriptTimeZone(), 'EEE d MMM'));
      if (meta.length) h.push('<div style="font-size:12px;color:rgba(251,249,246,.55);margin-top:3px">' + meta.join(' &middot; ') + '</div>');
      h.push('</div>');
    });
  }
  h.push('</div>');

  /* ---- Traffic ---- */
  if (!ga) {
    h.push('<div style="border:1px solid ' + LINE + ';border-radius:4px;padding:16px;font-size:13px;color:' + MUTED + '">' +
           'GA4 not configured — set GA4_PROPERTY_ID in the script to include traffic.</div>');
  } else {
    var t = ga.totals, p = ga.prior;
    h.push('<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:' + MUTED + ';border-bottom:1px solid ' + LINE + ';padding-bottom:8px;margin-bottom:16px">Traffic</div>');
    h.push('<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px"><tr>');
    [['Visitors', t.users, p.users], ['Sessions', t.sessions, p.sessions],
     ['Page views', t.views, p.views]].forEach(function (m) {
      h.push('<td style="padding-right:14px;vertical-align:top">' +
             '<div style="font-size:26px;font-weight:600;letter-spacing:-.03em;line-height:1">' + m[1] + '</div>' +
             '<div style="font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:' + MUTED + ';margin:4px 0 2px">' + m[0] + '</div>' +
             '<div style="font-size:12px">' + delta(m[1], m[2]) + ' vs prior week</div></td>');
    });
    h.push('</tr></table>');

    h.push(trendChart(ga.daily, A, LINE, MUTED));

    h.push(table('Most-read pages', ga.pages, function (r) {
      return [r.dims[0] === '/' ? 'Home' : r.dims[0].replace('/work/', '').replace('.html', ''), r.vals[0]];
    }, LINE, MUTED));

    h.push(table('Where they came from', ga.sources, function (r) {
      return [r.dims[0], r.vals[0]];
    }, LINE, MUTED));

    h.push(table('Countries', ga.countries, function (r) {
      return [r.dims[0], r.vals[0]];
    }, LINE, MUTED));

    if (ga.repos.length) {
      h.push(table('Outbound clicks', ga.repos, function (r) {
        return [r.dims[0], r.vals[0]];
      }, LINE, MUTED));
    }

    if (ga.events.length) {
      h.push(table('Engagement events', ga.events, function (r) {
        return [r.dims[0].replace(/_/g, ' '), r.vals[0]];
      }, LINE, MUTED));
    }
  }

  h.push('<div style="border-top:1px solid ' + LINE + ';margin-top:26px;padding-top:14px;font-size:12px;color:' + MUTED + '">');
  h.push('<a href="https://analytics.google.com" style="color:' + A + ';text-decoration:none">Open GA4</a> &nbsp;&middot;&nbsp; ');
  h.push('<a href="https://brendaong.com" style="color:' + A + ';text-decoration:none">View site</a>');
  h.push('<div style="margin-top:8px;color:#A39B90">Counts exclude visitors who declined cookies or use tracking blockers, so treat these as a floor.</div>');
  h.push('</div></div>');

  return h.join('');
}

/**
 * 30-day visitor trend as a bar chart.
 * Built from table cells with inline styles, not SVG or an image: Gmail strips
 * SVG and <style> blocks, and most clients block remote images by default.
 * The last 7 bars — the week this email reports on — are in the accent colour.
 */
function trendChart(daily, A, LINE, MUTED) {
  if (!daily || !daily.length) return '';

  var H = 84;                                     // tallest bar, px
  var max = 0;
  daily.forEach(function (d) { if (d.users > max) max = d.users; });

  var head = '<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:' + MUTED +
             ';border-bottom:1px solid ' + LINE + ';padding-bottom:8px;margin-bottom:14px">' +
             'Visitors, past 30 days' +
             (max ? '<span style="float:right;letter-spacing:0;text-transform:none">peak ' + max + '</span>' : '') +
             '</div>';

  if (!max) {
    return head + '<div style="font-size:13px;color:' + MUTED + ';margin-bottom:24px">' +
           'No visitors recorded yet.</div>';
  }

  var full = function (d) { return Utilities.formatDate(d, Session.getScriptTimeZone(), 'EEE d MMM'); };
  var fmt  = function (d) { return Utilities.formatDate(d, Session.getScriptTimeZone(), 'd MMM'); };

  // Row of counts sitting above the bars. Printed for the reported week only —
  // thirty numbers in a row is unreadable, and those seven are the ones in
  // question. `title` gives a hover tooltip in clients that honour it.
  // Labels and bars MUST share one table, or the empty label cells collapse and
  // the numbers bunch up at the left instead of sitting over their own bars.
  var tip = function (d) {
    return full(d.date) + ' — ' + d.users + (d.users === 1 ? ' visitor' : ' visitors');
  };

  var labels = daily.map(function (d, i) {
    var recent = i >= daily.length - 7;
    return '<td align="center" width="19" title="' + tip(d) + '"' +
           ' style="width:19px;font-size:10px;line-height:13px;color:' + A +
           ';font-weight:600;padding:0 1px">' + (recent ? d.users : '&nbsp;') + '</td>';
  }).join('');

  var bars = daily.map(function (d, i) {
    var h = Math.max(2, Math.round((d.users / max) * H));   // keep zero days visible
    var recent = i >= daily.length - 7;
    return '<td valign="bottom" align="center" width="19" height="' + H + '"' +
           ' title="' + tip(d) + '"' +
           ' style="width:19px;height:' + H + 'px;padding:0 1px;font-size:0;line-height:0;vertical-align:bottom">' +
           '<div style="width:17px;height:' + h + 'px;background:' +
           (recent ? A : '#DDD4C8') + ';border-radius:1px;font-size:0;line-height:0">&nbsp;</div></td>';
  }).join('');

  // Week-by-week totals, always visible. Hover is unreliable across mail
  // clients, so the numbers have to be readable without it.
  var weeks = [];
  for (var w = daily.length; w > 0; w -= 7) {
    var slice = daily.slice(Math.max(0, w - 7), w);
    if (!slice.length) continue;
    var sum = 0;
    slice.forEach(function (d) { sum += d.users; });
    weeks.unshift({ from: slice[0].date, to: slice[slice.length - 1].date,
                    users: sum, current: w === daily.length });
  }

  var weekRows = weeks.map(function (wk) {
    return '<tr><td style="padding:5px 0;border-bottom:1px solid ' + LINE + ';font-size:13px;color:' +
           (wk.current ? A : MUTED) + '">' + fmt(wk.from) + ' – ' + fmt(wk.to) +
           (wk.current ? ' <span style="font-size:11px">(this report)</span>' : '') + '</td>' +
           '<td align="right" style="padding:5px 0;border-bottom:1px solid ' + LINE +
           ';font-size:13px;font-weight:600;color:' + (wk.current ? A : 'inherit') + '">' + wk.users + '</td></tr>';
  }).join('');

  return head +
    '<table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">' +
    '<tr>' + labels + '</tr>' +
    '<tr>' + bars + '</tr>' +
    '</table>' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:7px 0 10px">' +
    '<tr><td style="font-size:11px;color:' + MUTED + '">' + fmt(daily[0].date) + '</td>' +
    '<td align="right" style="font-size:11px;color:' + MUTED + '">' + fmt(daily[daily.length - 1].date) + '</td>' +
    '</tr></table>' +
    '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px">' +
    weekRows + '</table>' +
    '<div style="font-size:11px;color:' + MUTED + ';margin-bottom:24px">' +
    'Numbers above the bars are the reported week. Hover any bar for its date and count ' +
    '(works in Outlook.com and Apple Mail; Gmail strips tooltips).</div>';
}

function table(title, rows, fn, LINE, MUTED) {
  if (!rows || !rows.length) return '';
  var h = ['<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:' + MUTED +
           ';border-bottom:1px solid ' + LINE + ';padding-bottom:8px;margin-bottom:10px">' + title + '</div>',
           '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;font-size:14px">'];
  rows.forEach(function (r) {
    var c = fn(r);
    h.push('<tr><td style="padding:6px 0;border-bottom:1px solid ' + LINE + '">' + esc(c[0]) + '</td>' +
           '<td align="right" style="padding:6px 0;border-bottom:1px solid ' + LINE + ';font-weight:600">' + c[1] + '</td></tr>');
  });
  h.push('</table>');
  return h.join('');
}
