/* Classifica a barre orizzontali delle province per depositi delle famiglie per abitante, stile Radar – QN.
   RadarClassifica({ host: "#barre", verso: "top" | "bottom", n: 10 })
   Stessa scala (0-32.000 euro) per le due classifiche, così si possono affiancare. */
(function () {
  var R = Radar, fmt = R.fmt, DMAX = 32000;
  var eur = function (v) { return fmt(Math.round(v / 100) * 100, 0); };

  window.RadarClassifica = function (o) {
    var host = document.querySelector(o.host);
    R.loadCSV("../data/depositi-province.csv").then(function (rows) {
      var it = null, prov = [];
      rows.forEach(function (r) {
        var d = { sig: r["Sigla"], nome: r["Provincia"].split("/")[0].replace("Valle d'Aosta", "Aosta"),
                  pc: R.num(r["Depositi pro capite 2025 (euro)"]), v: R.num(r["Variazione % pro capite 2024-2025"]) };
        if (d.sig === "IT") it = d; else prov.push(d);
      });
      prov.sort(function (a, b) { return b.pc - a.pc; });
      var sel = o.verso === "top" ? prov.slice(0, o.n) : prov.slice(-o.n).reverse();   // ultime: dalla più bassa
      if (o.onData) o.onData(sel, it);
      var evid = sel[0];
      var tip = R.tooltip(host), bars, vals;
      R.dismissOutside(host, function () { tip.hide(); if (bars) { bars.classed("is-dimmed", false); vals.classed("is-dimmed", false); } });

      R.responsive(host, function (W, phase) {
        var narrow = R.isNarrow(W);
        var labW = narrow ? 104 : 168, ROW = narrow ? 32 : 36, BH = narrow ? 18 : 20, top = 26;
        var x = d3.scaleLinear().domain([0, DMAX]).range([labW, W - (narrow ? 54 : 70)]);
        var H = top + ROW * sel.length + 34;
        d3.select(host).select("svg").remove();
        var svg = d3.select(host).insert("svg", ".r-tip").attr("width", W).attr("height", H).attr("role", "img")
          .attr("aria-label", "Grafico a barre: " + sel.map(function (d) { return d.nome + " " + eur(d.pc) + " euro"; }).join(", ") +
            ". Media italiana " + eur(it.pc) + " euro per abitante.");
        svg.append("title").text(document.title);
        var g = svg.append("g");
        var ticks = narrow ? [0, 15000, 30000] : [0, 10000, 20000, 30000];
        ticks.forEach(function (t) {
          g.append("line").attr("class", t ? "grid-line" : "baseline").attr("x1", x(t)).attr("x2", x(t)).attr("y1", top - 6).attr("y2", top + ROW * sel.length)
            .style("stroke", t ? "var(--rule)" : "var(--grey-light)");
          g.append("text").attr("class", "tick-label").attr("x", x(t)).attr("y", top - 12).attr("text-anchor", "middle").text(fmt(t, 0));
        });
        var yb = top + ROW * sel.length;
        g.append("line").attr("x1", x(it.pc)).attr("x2", x(it.pc)).attr("y1", top - 4).attr("y2", yb + 6)
          .style("stroke", "var(--ink)").attr("stroke-dasharray", "3 3");
        g.append("text").attr("class", "tick-label").attr("x", x(it.pc)).attr("y", yb + 22).attr("text-anchor", "middle")
          .style("fill", "var(--ink)").text("Italia " + eur(it.pc));
        var yy = function (i) { return top + i * ROW + (ROW - BH) / 2; };
        g.selectAll("text.nome").data(sel).join("text").attr("class", "tick-label nome")
          .attr("x", 0).attr("y", function (d, i) { return yy(i) + BH / 2; }).attr("dy", "0.35em")
          .style("fill", "var(--ink)").style("font-size", narrow ? "12px" : "13px").style("font-weight", function (d) { return d === evid ? 600 : 400; })
          .text(function (d) { return d.nome; });
        bars = g.selectAll("path.bar").data(sel).join("path").attr("class", "bar mark")
          .style("fill", function (d) { return d === evid ? "var(--red)" : "var(--blue)"; });
        R.enter(bars, phase,
          function (s) { s.attr("d", function (d, i) { return R.barPathH(x(0), yy(i), 0, BH, 2); }); },
          function (s) { s.attrTween("d", function (d) { var i = sel.indexOf(d); return function (t) { return R.barPathH(x(0), yy(i), (x(d.pc) - x(0)) * t, BH, 2); }; }); });
        vals = g.selectAll("text.val").data(sel).join("text").attr("class", "val-label val mark")
          .attr("x", function (d) { return x(d.pc) + 7; }).attr("y", function (d, i) { return yy(i) + BH / 2; }).attr("dy", "0.35em")
          .style("paint-order", "stroke").style("stroke", "var(--bg)").style("stroke-width", "4px");
        vals.each(function (d) { R.countUp(d3.select(this), d.pc, eur, phase); });
        g.selectAll("rect.hit").data(sel).join("rect").attr("class", "hit").attr("x", 0).attr("width", W)
          .attr("y", function (d, i) { return top + i * ROW; }).attr("height", ROW)
          .on("pointerenter pointerdown", function (ev, d) {
            bars.classed("is-dimmed", function (q) { return q !== d; }); vals.classed("is-dimmed", function (q) { return q !== d; });
            tip.show(R.tipHTML({ title: d.nome + " (" + d.sig + ")", value: eur(d.pc), unit: "euro per abitante",
              rows: [["Variazione sul 2024", (d.v > 0 ? "+" : "") + fmt(d.v, 1) + "%"], ["Italia", eur(it.pc) + " euro"]] }),
              Math.min(x(d.pc), W - 30), yy(sel.indexOf(d)));
          })
          .on("pointerleave", function (ev) { if (ev.pointerType === "mouse") { tip.hide(); bars.classed("is-dimmed", false); vals.classed("is-dimmed", false); } });
      });
    }).catch(function (e) { R.fail(o.host, e); });
  };
})();
