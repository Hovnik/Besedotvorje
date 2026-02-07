## Featuers

- skladenjska podstava pod besedotvorno podstavo
- ai izracuna confidence score za vsako besedo, ki ga lahko uporabimo za filtriranje rezultatov
- vsaka beseda bo bodisi potrjena ali nepotrjena od administratorja

## Into Fine-Tuning

- z zivino pomocjo naredi JSON format, ki ga more vrniti ai za vsako bsedeo, npr:

{
"beseda": "križišče",
"tvorjenka": true,
"vrsta tvorjenke": "izpeljanka",
"podstava": "križ",
"obrazilo": "išče",
"postopek": "izpeljava",
"slovnicno": {
"končnica": "e",
"besedna_vrsta": "samostalnik",
"spol": "srednji"
},
"confidence": 1.00
}

{
"beseda": "predpostavka",
"tvorjenka": true,
"postopek": "izpeljava",
"osnova": "postav",
"predpone": ["pred"],
"pripone": ["ka"]
}

{
"beseda": "avtocesta",
"tvorjenka": true,
"postopek": "zlaganje",
"osnove": ["avto", "cesta"]
}

{
"beseda": "miza",
"tvorjenka": false
}

postopki: krnitev, izpeljava, zlaganje, sklaplanje, mešana tvorba
