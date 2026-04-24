## TODO:
### IR08 (Autentizace)
- Implementovat uložení identity uživatele a práci s tokenem
- Připravit inicializaci autentizačního stavu při startu aplikace

## DONE
### Doména Order (Byznys entita)
- Implementovat přechodové funkce mezi stavy (např. odeslání objednávky)
- Validace invariantů (kontrola, zda není košík prázdný, validní údaje, nezáporná cena)
- Vytvořit logiku pro výpočet odvozených hodnot (celková cena, počet kusů)
### IR04 (Router)
- Vytvořit systém pro mapování URL na akce
- Zajistit synchronizaci adresního řádku prohlížeče se stavem aplikace
### IR01 (State Management)
- Navrhnout strukturu globálního stavu aplikace
- Definovat řízené mutace stavu
### IR02 (Dispatcher)
- Sestavit funkci createDispatcher pro centrální zpracování akcí
- Naprogramovat interpretaci action.type a volání příslušných byznys funkcí
- Propojit asynchronní operace se změnami stavu