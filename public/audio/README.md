# Audio del test (opzionale in repo)

**Deploy leggero (Netlify / GitHub):** non committare i 72 MP3. Imposta in `.env` / Netlify:

`VITE_AUDIO_BASE_URL=https://…/cartella-con-i-file`

Gli URL richiesti sono `…/1.mp3` … `…/72.mp3`.

**Sviluppo locale senza CDN:** copia qui `1.mp3` … `72.mp3` e lascia `VITE_AUDIO_BASE_URL` vuoto.
