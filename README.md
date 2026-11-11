<p align="center">
  <img src="icons/icon128.png" alt="Kick Emote Spam Collapser logó" width="96">
</p>

<h1 align="center">Kick Emote Spam Collapser</h1>

<p align="center">
  Chrome-bővítmény, ami kiszűri a Kick chatről az emote- és XD-spammeléseket.
</p>

---

## Mit csinál?

Amikor valaki spameli az emote-ot (pl. tízszer egy KEKW-t) vagy az XD-t, a chat tele lenne ezzel, akkor is, ha közben mások is írnak. A bővítmény ilyenkor userenként csak az első üzenetet hagyja meg, a többit kiszűri.

**Előtte:**

```
Bencsoo:   KEKW
Bencsoo:   KEKW
Bencsoo:   KEKW
kisjakab:  XD
kisjakab:  XDDD
kisjakab:  DXDXDXD
kisjakab:  xd
```

**Utána:**

```
Bencsoo:   KEKW
kisjakab:  XD
```

### Mi számít spamnek?

#### Emote spam

Egy csak emote-ból álló üzenet akkor esik ki, ha **ugyanaz a user ugyanazt az emote-ot már elküldte az előző 10 üzenetben**. A 10-be mindenki üzenete beleszámít, a kiszűrteké is.

| Üzenet | Kiszűri? |
| --- | --- |
| Ugyanaz a user egymás után ugyanazt az emote-ot küldi | ✅ igen (az első marad) |
| Többen felváltva spamelik (`A: KEKW`, `B: KEKW`, `A: KEKW`…) | ✅ igen, userenként az első marad |
| Ugyanaz az emote többször egy üzenetben (`KEKW KEKW KEKW`) | ✅ igen, ha a user előtte is KEKW-t küldött (egy sima `KEKW`-nek számít, az első ilyen üzenet változatlanul megmarad) |
| Közben más userek írnak, de 10 üzeneten belül jön az ismétlés (legfeljebb 9 másik üzenet közte) | ✅ igen |
| Az előző KEKW óta legalább 10 másik üzenet jött | ❌ nem, új sorként megjelenik |
| A user közben mást ír (szöveget vagy másik emote-ot) | ❌ nem, a következő KEKW-je újra megjelenik |
| Emote és mellette szöveg (`KEKW lol`) | ❌ nem |
| Más emote (`LUL` a `KEKW` után) | ❌ nem |

#### XD spam

Egy üzenet XD-üzenetnek számít, ha **legalább 2 betűből áll, és a betűinek több mint 80%-a X vagy D** (kis- és nagybetű mindegy). Ilyen például az `XD`, `DX`, `XDDD`, `DXDXDXD`, `XD XD XD` vagy az `xdxdd`. Az XD-üzenet ugyanúgy viselkedik, mint az emote spam: ha **ugyanaz a user az előző 10 üzenetben már küldött XD-üzenetet**, a mostani kiesik.

Az XD-féleségek egy kategóriába tartoznak, tehát az `XD` után küldött `XDDD` vagy `DX` is spamnek számít.

| Üzenet | Kiszűri? |
| --- | --- |
| Ugyanaz a user egymás után XD-zik (`XD`, `XDDD`, `DXDX`…) | ✅ igen (az első marad) |
| Többen felváltva XD-znek | ✅ igen, userenként az első marad |
| Közben más userek írnak, de 10 üzeneten belül jön az újabb XD | ✅ igen |
| Az előző XD óta legalább 10 másik üzenet jött | ❌ nem, új sorként megjelenik |
| A user közben mást ír (szöveget vagy emote-ot) | ❌ nem, a következő XD-je újra megjelenik |
| XD és mellette rendes szöveg (`ez nagyon jó volt XD`) | ❌ nem, a betűk többsége nem X/D |
| Szavak, amikben van X vagy D (`eddig`, `addig`, `mondd`) | ❌ nem |

A 10 üzenetes határ a `websocketFilter.js` elején, a `spamWindowSize` értékkel állítható. Az XD-arány (80%) és a minimum betűszám az `isXdSpam` függvényben módosítható.

## Telepítés

A bővítmény nincs fent a Chrome Web Store-ban, ezért kézzel kell betölteni.

1. Töltsd le a repót (**Code → Download ZIP**), és csomagold ki egy mappába.
2. Nyisd meg a `chrome://extensions` oldalt.
3. Kapcsold be jobb fent a **Fejlesztői módot**.
4. Kattints a **Kicsomagolt bővítmény betöltése** gombra, és válaszd ki a mappát.
5. Töltsd újra a Kick oldalt.

Működik Chrome-ban, Edge-ben, Brave-ben és más Chromium-alapú böngészőkben. **Chrome 111 vagy újabb** kell hozzá.

## Használat

Az eszköztáron a bővítmény ikonjára kattintva lehet ki- és bekapcsolni:

- **BE**: a szűrő működik
- **KI**: minden üzenet szűretlenül átjön

A változás azonnal érvényes, nem kell újratölteni az oldalt.

## Hogyan működik?

A Kick chatje egy virtualizált lista, minden üzenet egy előre kiszámolt helyen jelenik meg. Ezért a bővítmény nem a már megjelent üzeneteket rejti el, hanem websocket szintjén szűr: a spam üzenetet még azelőtt kiveszi, hogy a Kick oldalának kódja feldolgozná, így az be sem kerül a listába.

- **`websocketFilter.js`**: a Kick oldalán fut (`MAIN` world), még az oldal saját kódja előtt. Becsomagolja a `WebSocket` `onmessage` és `addEventListener` metódusát. Minden bejövő üzenetben megkeresi a chatüzeneteket (`content` + `sender.username`), és ha emote- vagy XD-spamet talál, azt kiveszi az üzenetből. Ha egy websocket-keret több sorban több chatüzenetet tartalmaz, soronként dönt: csak a spam sorokat veszi ki, a többit továbbengedi.
- **`content.js`**: a bővítmény be/ki állapotát adja át a `websocketFilter.js`-nek
- **`background.js`**: az ikonra kattintást kezeli, és frissíti a BE/KI jelvényt.

## Fájlok

```
├── LICENSE
├── manifest.json
├── background.js
├── content.js
├── websocketFilter.js
└── icons/
    ├── logo.svg
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## Korlátok

- **Csak az élőben érkező üzeneteket szűri.** Ami a bővítmény bekapcsolása előtt már a chatben volt, az ott marad, és a betöltéskor lekért előzményekhez sem nyúl.
- **Kikapcsoláskor a kiszűrt üzenetek nem jönnek vissza.** Kikapcsolás után csak az új üzenetek érkeznek szűretlenül.
- **Az XD-felismerés arány alapú.** Nagyon rövid, szinte csak X-ből és D-ből álló üzeneteket (pl. `dd`) is XD-nek vehet, de ezek az első alkalommal mindig megjelennek, csak az ismétlésük esik ki.
- **A Kick bármikor megváltoztathatja a chat formátumát.** A szűrő azt feltételezi, hogy a chatüzenetekben van `content` és `sender.username` mező, és az emote-ok `[emote:ID:NÉV]` formában jönnek. Ha a Kick ezen változtat, a szűrő nem fog működni, amíg nem frissítjük.

## Adatvédelem

A bővítmény kizárólag a saját böngésződben fut, és csak azt változtatja meg, mi jelenik meg **neked** a chatben.

- Nem küld semmit a Kicknek, és nem hív semmilyen Kick API-t.
- Nem gyűjt és nem továbbít adatot, külső szerverhez nem csatlakozik.
- Más nézők chatjét és a stream működését nem befolyásolja.
- Egyetlen tárolt adat a be/ki állapot (`chrome.storage.local`). A spam felismeréséhez az utolsó 10 üzenet küldőit, emote-jait és azt, hogy XD-üzenet volt-e, csak a memóriában tartja, a régebbieket folyamatosan törli, az oldal bezárásakor pedig minden törlődik.

## Felelősségkizárás

Ez egy nem hivatalos, harmadik féltől származó bővítmény. Nincs kapcsolatban a Kickkel, és a Kick nem hagyta jóvá. A „Kick” név és védjegy a jogtulajdonosáé.

A bővítményt mindenki a saját felelősségére használja. A szoftver „ahogy van” (as is) állapotban, mindenféle garancia nélkül érhető el. A használat előtt érdemes átnézni a Kick [felhasználási feltételeit](https://kick.com/terms-of-service).