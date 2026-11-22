# Sportelli bancari e depositi delle famiglie – Radar QN

Grafici statici (SVG, tema chiaro) pubblicati su GitHub Pages e incorporati nel CMS di QN con un iframe.

- **Quota di residenti in comuni senza sportello, per regione**: https://cosimofire.github.io/sportelli-bancari/cartogramma/
- **Le 10 province con più depositi delle famiglie per abitante**: https://cosimofire.github.io/sportelli-bancari/depositi-top10/
- **Le 10 province con meno depositi delle famiglie per abitante**: https://cosimofire.github.io/sportelli-bancari/depositi-ultime10/
- **Calo degli sportelli per classe di popolazione del comune**: https://cosimofire.github.io/sportelli-bancari/calo-classi-comune/
- **Depositi delle famiglie per provincia: euro per abitante e variazione sul 2024**: https://cosimofire.github.io/sportelli-bancari/depositi-mappa/

Fonti: Banca d'Italia (TDB10195, TDB20207, TDB20290); Istat, popolazione residente.
Gli SVG si rigenerano con gli script `build_*.py` del progetto di lavoro; poi si rilancia `build_pages.py`.
Per ogni dataviz c'è un file `snippet-<nome>.html` con iframe e script da incollare nel CMS.
