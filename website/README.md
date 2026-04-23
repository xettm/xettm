# Theme Park Tycoon

A small browser tycoon game. Build rides, shops, and decorations on a grid
and watch your park grow.

## Run it

No build step. Just open `index.html` in a browser.

```
open website/index.html          # macOS
xdg-open website/index.html      # Linux
start website\index.html         # Windows
```

If your browser blocks `file://` script loads, serve the folder with any
static server, for example:

```
cd website
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Accounts

- Click **Sign up** on the login screen to create an account.
- Accounts and saved parks live in the browser's `localStorage`, so each
  browser / profile has its own accounts. Nothing is sent over the network.
- Passwords are salted + SHA-256 hashed, but this is a local toy — don't
  reuse real passwords.

## Saving

- The game autosaves every 10 seconds.
- The **Save** button saves immediately.
- **Reset park** wipes your park but keeps your account.
- **Log out** saves first, then returns to the login screen.

## Adding content

All rides / shops / decorations are defined in
[`content/catalog.js`](content/catalog.js). See
[`content/README.md`](content/README.md) for the schema. Edit the file,
refresh the page, and your new items appear in the sidebar.

## File layout

```
website/
  index.html            # page shell
  styles.css            # all styling
  js/
    auth.js             # signup / login / session (localStorage)
    game.js             # game state, tick loop, save/load
    main.js             # wires the DOM to auth + game
  content/
    catalog.js          # rides, shops, decorations — edit to add content
    README.md           # catalog schema
```
