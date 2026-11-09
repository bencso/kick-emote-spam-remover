<p align="center">
  <img src="icons/icon128.png" alt="Kick Emote Spam Collapser logó" width="96">
</p>

<h1 align="center">Kick Emote Spam Collapser</h1>

<p align="center">
  Chrome-bővítmény, ami kiszűri a Kick chatről az emote spammeléseket.
</p>

---

## Mit csinál?

Amikor valaki egymás után spameli az emote-ot (pl. tízszer egy KEKW-t), a chat tele lenne ezzel. A bővítmény ilyenkor csak az első üzenetet hagyja meg, a többit kiszűri.

**Előtte:**

```
Bencsoo:  KEKW
Bencsoo:  KEKW
Bencsoo:  KEKW
Bencsoo:  KEKW
kisjakab:  KEKW
kisjakab:  KEKW
kisjakab:  KEKW
```

**Utána:**

```
Bencsoo:  KEKW
kisjakab:  KEKW
```

### Mi számít spamnek?

| Üzenet | Kiszűri? |
| --- | --- |
| Ugyanaz a user egymás után ugyanazt az emote-ot küldi | ✅ igen (az első marad) |
| Ugyanaz az emote többször egy üzenetben (`KEKW KEKW KEKW`) | ✅ igen |
| Emote és mellette szöveg (`KEKW lol`) | ❌ nem |
| Más emote (`LUL` a `KEKW` után) | ❌ nem |
| Ha közben más is ír, a következő KEKW | ❌ nem, új sorként megjelenik |
| Különböző userek ugyanazzal az emote-tal | ❌ nem, userenként egy marad |

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

A Kick chatje egy virtualizált lista, minden üzenet egy előre kiszámolt helyen jelenik meg. Ezért a bővítmény nem a már megjelent üzeneteket rejti el, hanem websocket szintjén szűr, még mielőtt a Kicktől megkapná az üzenetet a kliens.

- **`websocketFilter.js`**: a Kick oldalán fut (`MAIN` world), még az oldal saját kódja előtt. Becsomagolja a `WebSocket` `onmessage` és `addEventListener` metódusát. Minden bejövő üzenetben megkeresi a chatüzeneteket (`content` + `sender.username`), és ha spamet talál, azt kiveszi az üzenetből. Ha egy üzenetben több chatüzenet érkezik, csak a spam sorokat veszi ki, a többit továbbengedi.
- **`content.js`**: a bővítmény be/ki állapotát adja át a `websocketFilter.js`-nek
- **`background.js`**: az ikonra kattintást kezeli, és frissíti a BE/KI jelvényt.

## Fájlok

```
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
- **A Kick bármikor megváltoztathatja a chat formátumát.** A szűrő azt feltételezi, hogy a chatüzenetekben van `content` és `sender.username` mező, és az emote-ok `[emote:ID:NÉV]` formában jönnek. Ha a Kick ezen változtat, a szűrő nem fog működni, amíg nem frissítjük.

## Megjegyzés

Ez egy nem hivatalos, harmadik féltől származó bővítmény, nincs kapcsolatban a Kickkel.
