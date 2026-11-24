# Sportelli bancari e depositi delle famiglie – Radar QN

Dataviz D3 in stile Radar (tema chiaro e scuro, sfondo preso dalla pagina ospite) pubblicate su GitHub Pages e incorporate nel CMS di QN con un iframe.

- **Quota di residenti in comuni senza sportello, per regione**: https://cosimofire.github.io/sportelli-bancari/cartogramma/
- **Calo degli sportelli per classe di popolazione del comune**: https://cosimofire.github.io/sportelli-bancari/calo-classi-comune/
- **Quota di imprese in comuni senza sportello, per regione**: https://cosimofire.github.io/sportelli-bancari/cartogramma-imprese/
- **Depositi delle famiglie per provincia: euro per abitante e variazione sul 2024**: https://cosimofire.github.io/sportelli-bancari/depositi-mappa/
- **Le 10 province con più depositi delle famiglie per abitante**: https://cosimofire.github.io/sportelli-bancari/depositi-top10/
- **Le 10 province con meno depositi delle famiglie per abitante**: https://cosimofire.github.io/sportelli-bancari/depositi-ultime10/

Fonti: Banca d'Italia (TDB10195, TDB20207, TDB20290); Istat, popolazione residente e registro ASIA.
I dati sono nella cartella `data/`: aggiornando i CSV si aggiornano i grafici. `build_pages.py` rigenera snippet e indice.
Per ogni dataviz c'è un file `snippet-<nome>.html` con iframe e script da incollare nel CMS.
