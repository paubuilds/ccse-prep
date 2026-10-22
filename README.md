# CCSE Prep — test de demanda (1 semana)

Web estática (HTML/CSS/JS, sin dependencias ni build obligatorio) para validar la demanda entre candidatos a la nacionalidad española por residencia (Marruecos, Pakistán, India, África subsahariana…).

- **Gancho gratis:** un test CCSE con preguntas oficiales en español y explicación en el idioma del candidato (ar / ur / en / fr).
- **Oferta de pago (solo lista de reserva, sin cobro):** un **pack DELE A2** con práctica de expresión oral, escritura cronometrada y modelos de examen explicados en **árabe (con darija marroquí cuando ayuda) y urdu**. Inglés y francés son secundarios.
- **Precio fundador:** **24 €**, pago único.

Estado: **no está publicada.** Pau aprobó publicarla en `paubuilds/ccse-prep`, pero el conector de GitHub no permite crear repos ni subir archivos, así que la subida la hace Pau (ver «Publicar»).

## Qué hay
| Ruta | Qué es |
|---|---|
| `index.html` | Landing + test + A/B + lista de espera. SEO en español (generado) |
| `en/index.html` | La misma app con título y meta en inglés (generado) |
| `assets/questions.js` | Las 25 preguntas oficiales, con texto literal. **No editar a mano** |
| `assets/explanations.js` | Explicaciones y vocabulario **propios** en es/en/fr/ar/ur |
| `assets/i18n.js` | Textos de la interfaz en 5 idiomas (ar y ur con `dir=rtl`) |
| `assets/app.js` | Lógica del test, puntuación, registro del A/B, formulario y analítica |
| `assets/config.js` | `WAITLIST_ENDPOINT` (URL del Apps Script), `GOATCOUNTER_CODE`, `FOUNDING_PRICE_EUR: 24` |
| `assets/style.css` | Mobile-first; usa propiedades lógicas para que funcione en RTL |
| `privacidad.html` | Borrador de política de privacidad (faltan responsable y email) |
| `backend/apps_script.gs` | Apps Script que escribe en la hoja «DELE waitlist» (lo despliega Pau) |
| `backend/DEPLOY_APPS_SCRIPT.md` | Los 3 pasos para desplegarlo |
| `build/` | `node build/build.js` regenera `index.html`, `en/index.html`, `sitemap.xml` y `robots.txt` desde `template.html` (`SITE_BASE=` para otro dominio) |
| `tests/headless_check.py` | Prueba headless con Playwright y Chrome |
| `data/` | Material de verificación de las preguntas (ver «Fuente») |
| `chatgpt_design_prompt.md` | Prompt para rediseñar la UI con ChatGPT |

## Formato del test (igual que el examen real)
- 25 preguntas repartidas por tareas: T1 10, T2 3 (verdadero/falso), T3 2, T4 3 y T5 7.
- Se aprueba con 15. La pregunta y las opciones van en español.
- Al responder se muestra la respuesta correcta y una explicación en el idioma elegido. Si el idioma no es español, también aparece el vocabulario clave.
- Al final se muestra la nota, una lista de los fallos, la pregunta A/B y un bloque destacado (`#deleCta`) que lleva al formulario del pack DELE A2.
- Las preguntas elegidas son: 1001, 1009, 1011, 1016, 1027, 1046, 1077, 1085, 1105, 1112 · 2003, 2019, 2021 · 3003, 3021 · 4011, 4022, 4029 · 5001, 5002, 5016, 5026, 5052, 5059, 5069.
- He evitado preguntas cuya respuesta cambia con el tiempo, como la población o los cargos.

## Fuente de las preguntas CCSE (¡leer!)
**Instituto Cervantes, *Manual de preparación de la Prueba de Conocimientos Constitucionales y Socioculturales de España (CCSE) 2026*.** © Instituto Cervantes 2025, NIPO 110-25-054-X. Es válido para todas las convocatorias de 2026 y lo publicaron el 23/12/2025.
URL oficial: https://examenes.cervantes.es/sites/default/files/manual-ccse-2026-def.pdf

**Cómo se ha verificado:** el 22/10/2026, hacia las 19:20 (hora de Madrid), examenes.cervantes.es estaba **en mantenimiento** y no pude descargar el PDF oficial. La Wayback Machine estaba saturada y un espejo tenía captcha. Hice esto:
1. Crucé el banco completo de 300 preguntas de tres transcripciones independientes del PDF de 2026 publicadas en GitHub:
   - `jonajonap/ccse-2026-anki`
   - `acastellana/CCSE-2026-tutor`
   - `Tur71/ccse-testgen-2026`
2. En **269 de 300** preguntas el texto, las opciones y la respuesta coinciden exactamente en las tres (`data/sources/agree.json`).
3. Las 25 elegidas salen de ese grupo de 269 (`data/sources/selected25.json`).
4. Además, un fragmento indexado del manual oficial 2026 (espejo en legalteam.es) confirma literalmente las preguntas 1001–1003. No sorteé el captcha de ese espejo.

**TODO antes de lanzar:** cuando vuelva la web del Cervantes, ejecutar `python3 data/verify_against_official_pdf.py manual-ccse-2026-def.pdf` y revisar la tabla de soluciones.

**Derechos:** el manual es © Instituto Cervantes. Reproducirlo literalmente con fines de preparación es habitual (lo hacen academias y apps), pero **no hay una licencia explícita**. Antes de cobrar, conviene revisarlo con un abogado o pedir permiso. Las explicaciones son nuestras y la web indica que no tiene relación con el Instituto Cervantes.

Los ficheros de terceros que hay en `data/sources/` están en `.gitignore` y no se publican.

## Qué se registra (A/B y lista de espera)
Cada evento se guarda en el `localStorage` del visitante (clave `ccse_prep_log`; para verlo, ejecutar `ccsePrepLog()` en la consola).
Los eventos `test_complete`, `ab_choice` y `waitlist_signup` también se envían por POST a `WAITLIST_ENDPOINT`, si está configurado.

- **A/B:** al terminar se pregunta «¿Explicaciones en mi idioma o solo en español?». Se guarda `choice`, el orden de los botones (es aleatorio, para evitar sesgo de posición) y la nota.
- **Lista de espera del pack DELE A2:** se piden email, idioma (incluye darija), país de origen, fecha prevista del DELE A2 (`dele_date`), si reservaría por 24 € (`preorder_intent`) y consentimiento. También se guarda `source` (`result_cta` si llegó desde el resultado del test). Lleva un campo trampa (honeypot) contra bots. **No hay pago real.**
- **Hoja de Google:** «DELE waitlist» → https://docs.google.com/spreadsheets/d/1KAlPK1eZDyqwXZAuflKR-FCsKd6NURudChEHOBrw7h0/edit . Las altas van a la pestaña `waitlist` y los eventos `test_complete`/`ab_choice` a `events`.

## PLACEHOLDERS — necesitan aprobación de Pau
1. **`WAITLIST_ENDPOINT` (en `assets/config.js`) está en `null`** hasta que Pau despliegue el Apps Script (`backend/DEPLOY_APPS_SCRIPT.md`, unos 2 minutos). Mientras tanto, los datos solo quedan en el localStorage del visitante.
2. **`GOATCOUNTER_CODE` está en `null`.** Hace falta una cuenta gratuita en goatcounter.com. Al rellenarlo se cargan automáticamente el contador y los eventos (`event/ab_choice/native`, etc.).
3. **`privacidad.html`:** faltan el responsable y el email de contacto.
4. **Revisión nativa** de los textos en árabe y urdu (UI y explicaciones). También conviene revisar el francés.
5. **Dominio:** las URLs canónicas apuntan a `https://paubuilds.github.io/ccse-prep/`. Si cambia, ejecutar `SITE_BASE=https://dominio/ node build/build.js`.

## Publicar en GitHub Pages (manual, lo hace Pau)
Repo nuevo **público** `paubuilds/ccse-prep`. Sube a la **raíz** del repo:

- `index.html`
- `privacidad.html`
- `sitemap.xml`
- `robots.txt`
- `README.md`
- `.gitignore`
- `en/index.html`
- `assets/` (6 ficheros: `app.js`, `config.js`, `explanations.js`, `i18n.js`, `questions.js`, `style.css`)
- Opcional: `backend/`, `build/`, `tests/headless_check.py`, `chatgpt_design_prompt.md`
- **No subir** `data/sources/` ni `tests/screens/`.

Todas las rutas internas son relativas (`./assets/…`, `../assets/…`), así que funciona en `https://paubuilds.github.io/ccse-prep/`. Las únicas URLs absolutas son las canónicas y `hreflang`.

```bash
cd /workspace/dele && git init && git add . && git commit -m "CCSE prep demand test"
gh repo create paubuilds/ccse-prep --public --source=. --push
gh api -X POST repos/paubuilds/ccse-prep/pages -f "source[branch]=main" -f "source[path]=/"
```
O desde GitHub: Settings → Pages → Deploy from branch `main` / root.

## Probar en local
```bash
python3 -m http.server 8000      # http://localhost:8000
python3 tests/headless_check.py  # checks: RTL ar/ur, 25 preguntas, nota 16/25, A/B, lista de espera
```
