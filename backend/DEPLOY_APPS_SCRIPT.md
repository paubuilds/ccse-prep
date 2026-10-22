# Activar la lista de espera en Google Sheets (2 minutos, solo Pau)

La hoja **DELE waitlist** ya existe en tu Google Drive, con las cabeceras puestas:
https://docs.google.com/spreadsheets/d/1KAlPK1eZDyqwXZAuflKR-FCsKd6NURudChEHOBrw7h0/edit
(pestaña `waitlist` para las altas y pestaña `events` para resultados del test y respuestas A/B).

Una web estática no puede escribir en la hoja sin un pequeño "puente". Ese puente es un Apps Script que se publica con tu cuenta. El conector no puede publicarlo por ti, así que hazlo tú en estos 3 pasos:

1. **Pegar el código.** Abre la hoja → menú **Extensiones → Apps Script**. Borra lo que haya en `Código.gs`, pega **todo** el contenido de `backend/apps_script.gs` y pulsa **Guardar** (icono del disquete).
2. **Publicar.** Pulsa **Implementar → Nueva implementación** → en el engranaje elige **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.

   Pulsa **Implementar**, autoriza con tu cuenta (Configuración avanzada → Ir a… → Permitir) y **copia la URL** que termina en `/exec`.
3. **Conectar la web.** En `assets/config.js`, pon esa URL en `WAITLIST_ENDPOINT`, entre comillas:
   ```js
   WAITLIST_ENDPOINT: "https://script.google.com/macros/s/XXXX/exec",
   ```
   Sube ese archivo al repo.

**Comprobación:** abre la URL `/exec` en el navegador; debe mostrar `DELE waitlist endpoint OK`. Después haz el test en la web y apúntate con un email de prueba: aparecerá una fila nueva en `waitlist`.

**Notas:**
- Mientras `WAITLIST_ENDPOINT` sea `null`, nada sale del navegador. Los datos se guardan solo en localStorage (`ccse_prep_log`).
- El script solo acepta los eventos `waitlist_signup`, `test_complete` y `ab_choice`. También valida el email y neutraliza fórmulas.
- Si cambias el código más adelante, usa **Implementar → Gestionar implementaciones → Editar → Versión nueva**; así la URL no cambia.
