/* Cartogramma a quadrati delle regioni, stile Radar – QN.
   Un quadrato uguale per regione; unica codifica il colore, su scala continua di blu
   (variabili --blue-5 … --blue-1, che nel tema scuro si rovesciano da sole).
   Uso: RadarCartogramma({ host: "#mappa", csv: "...", dmax: 20, ticks: [0,5,10,15,20],
                           unita: "dei residenti", nota: "..." }) */
(function () {
  var R = Radar, fmt = R.fmt;
  // (colonna, riga, sigla): la penisola scende in diagonale verso sud-est, come sulla carta
  var GRID = {
    "Valle d'Aosta": [0, 0, "VdA"], "Trentino-Alto Adige": [2, 0, "TAA"],
    "Piemonte": [0, 1, "Pie"], "Lombardia": [1, 1, "Lom"], "Veneto": [2, 1, "Ven"], "Friuli-Venezia Giulia": [3, 1, "FVG"],
    "Liguria": [1, 2, "Lig"], "Emilia-Romagna": [2, 2, "ER"],
    "Toscana": [2, 3, "Tos"], "Umbria": [3, 3, "Umb"], "Marche": [4, 3, "Mar"],
    "Lazio": [3, 4, "Laz"], "Abruzzo": [4, 4, "Abr"], "Molise": [5, 4, "Mol"], "Puglia": [6, 4, "Pug"],
    "Sardegna": [1, 5, "Sar"], "Campania": [4, 5, "Cam"], "Basilicata": [5, 5, "Bas"],
    "Calabria": [5, 6, "Cal"],
    "Sicilia": [4, 7, "Sic"]
  };
  var NC = 7, NR = 8;

  function css(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }
  function chiaro(col) { var c = d3.rgb(col); return (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255 > 0.55; }
  function p1(v) { return fmt(v, 1) + "%"; }

  window.RadarCartogramma = function (o) {
    var host = document.querySelector(o.host);
    R.loadCSV(o.csv).then(function (rows) {
      var it = null, data = [];
      rows.forEach(function (r) {
        var d = { nome: r["Regione"], reale: R.num(r["Quota % reale"]), q: R.num(r["Quota % pesata"]) };
        if (d.nome === "Italia") it = d; else if (GRID[d.nome]) { d.g = GRID[d.nome]; data.push(d); }
      });
      if (o.onData) o.onData(data, it);
      var tip = R.tooltip(host), tiles = null;
      R.dismissOutside(host, function () { tip.hide(); if (tiles) tiles.classed("is-dimmed", false); });
      var srt = data.slice().sort(function (a, b) { return b.q - a.q; });

      var lastW = 0;
      function draw(W, phase) {
        lastW = W;
        var narrow = R.isNarrow(W);
        // scala costruita a ogni disegno, così segue il tema (le variabili cambiano nel tema scuro)
        var col = d3.piecewise(d3.interpolateRgb, ["--blue-5", "--blue-4", "--blue-3", "--blue-2", "--blue-1"].map(css));
        var c = function (v) { return col(Math.max(0, Math.min(1, v / o.dmax))); };
        var G = narrow ? 4 : 5;
        var T = Math.min(74, Math.floor((W - G * (NC - 1)) / NC));
        var gw = NC * T + (NC - 1) * G, gx = Math.round((W - gw) / 2);
        var LEG = 62, H = LEG + NR * (T + G);
        d3.select(host).select("svg").remove();
        var svg = d3.select(host).insert("svg", ".r-tip").attr("width", W).attr("height", H).attr("role", "img")
          .attr("aria-label", "Cartogramma a quadrati delle regioni, quota " + o.unita + " in comuni senza sportello a parità di dimensione dei comuni: " +
            srt.map(function (d) { return d.nome + " " + p1(d.q); }).join(", ") + ". Italia " + p1(it.q) + ".");
        svg.append("title").text(o.titolo);

        // legenda continua con la media italiana
        var lw = Math.min(300, W - 4), lx = 0, ly = 22;
        var gid = "scala-" + o.host.replace(/\W/g, "");
        var gr = svg.append("defs").append("linearGradient").attr("id", gid);
        d3.range(0, 1.0001, 0.1).forEach(function (t) { gr.append("stop").attr("offset", t).attr("stop-color", c(t * o.dmax)); });
        svg.append("rect").attr("x", lx).attr("y", ly).attr("width", lw).attr("height", 10).attr("rx", 2).attr("fill", "url(#" + gid + ")");
        o.ticks.forEach(function (t, i) {
          var x = lx + t / o.dmax * lw;
          svg.append("line").attr("x1", x).attr("x2", x).attr("y1", ly + 10).attr("y2", ly + 14).style("stroke", "var(--ink-2)").attr("stroke-width", 0.75);
          svg.append("text").attr("class", "tick-label").attr("x", x).attr("y", ly + 27)
            .attr("text-anchor", i === 0 ? "start" : i === o.ticks.length - 1 ? "end" : "middle").text(t + "%");
        });
        var ix = lx + it.q / o.dmax * lw;
        svg.append("path").attr("d", "M" + ix + "," + (ly - 2) + "L" + (ix - 4) + "," + (ly - 9) + "H" + (ix + 4) + "Z").style("fill", "var(--ink)");
        svg.append("text").attr("class", "series-label").attr("x", ix + 7).attr("y", ly - 3).style("font-size", "12px").text("Italia " + p1(it.q));

        // quadrati
        tiles = svg.append("g").attr("transform", "translate(" + gx + "," + LEG + ")")
          .selectAll("g").data(data).join("g").attr("class", "mark")
          .attr("transform", function (d) { return "translate(" + d.g[0] * (T + G) + "," + d.g[1] * (T + G) + ")"; });
        var rects = tiles.append("rect").attr("width", T).attr("height", T).attr("rx", 2);
        R.enter(rects, phase,
          function (s) { s.style("fill", "var(--grey-5)"); },
          function (s) { s.style("fill", function (d) { return c(d.q); }); });
        var fs = T >= 64 ? [13, 16] : T >= 48 ? [11, 13] : [10, 11];
        tiles.append("text").attr("x", T >= 48 ? 8 : 5).attr("y", fs[0] + 5).style("font-size", fs[0] + "px").style("font-weight", 600)
          .style("fill", function (d) { return chiaro(c(d.q)) ? "var(--on-light)" : "var(--on-dark)"; }).text(function (d) { return d.g[2]; });
        var vals = tiles.append("text").attr("x", T >= 48 ? 8 : 5).attr("y", T - (T >= 48 ? 10 : 7)).style("font-size", fs[1] + "px").style("font-weight", 700)
          .style("fill", function (d) { return chiaro(c(d.q)) ? "var(--on-light)" : "var(--on-dark)"; });
        vals.each(function (d) { R.countUp(d3.select(this), d.q, p1, phase); });

        tiles.on("pointerenter pointerdown", function (ev, d) {
          tiles.classed("is-dimmed", function (q) { return q !== d; });
          tip.show(R.tipHTML({
            title: d.nome, value: p1(d.q), unit: "a parità di dimensione dei comuni",
            rows: [["Quota reale", p1(d.reale)], ["Italia", p1(it.q)]]
          }), gx + d.g[0] * (T + G) + T / 2, LEG + d.g[1] * (T + G) + T / 2);
        }).on("pointerleave", function (ev) {
          if (ev.pointerType === "mouse") { tip.hide(); tiles.classed("is-dimmed", false); }
        });
      }
      R.responsive(host, draw);
      // i colori della scala si calcolano dalle variabili del tema: se il tema cambia, si ridisegna
      new MutationObserver(function () { if (lastW) draw(lastW, "static"); })
        .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-bg"] });
    }).catch(function (e) { R.fail(o.host, e); });
  };
})();
