# Migración LETTERS → Heritage v4.3.0 — documentación técnica

Este tema es **Heritage 4.3.0 (Shopify)** con las customizaciones de la marca **LETTERS Colombia** portadas desde el fork de Prestige (`letterscolombia-main`). La línea base prístina de Heritage es el primer commit de este repositorio (`chore: Heritage 4.3.0 (Shopify) pristino como linea base`); **todo lo LETTERS es el diff contra ese commit**.

---

## 1. Qué se portó y dónde vive ahora

| Pieza LETTERS | Implementación en Heritage | Archivos |
|---|---|---|
| Paleta #000000 + #F8E0B5 | `color_palette` nativo (background `#000000`, foreground `#F8E0B5`, color1 `#d4a020` oferta, color2 `#111111`, color3 `#1a1a1a`) — alimenta botones, badges, inputs, drawers y variant pickers por referencia | `config/settings_data.json` |
| Tipografía | body/subheading `lato_n4`, heading `libre_baskerville_n4`, accent `cormorant_garamond_i4` (display/hero); headings h1-h6 en mayúsculas | `config/settings_data.json` |
| Botón flotante WhatsApp | Snippet nuevo con SVG + pulse (`prefers-reduced-motion`), formato canónico `api.whatsapp.com/send/?phone=...&text=...`, colores desde `var(--color-foreground)`/`var(--color-background)` | `snippets/whatsapp-float.liquid`, render en `layout/theme.liquid` |
| CTA WhatsApp PDP | Bloque nuevo (texto + botón con mensaje pre-rellenado, phone configurable). Solo en `templates/product.json` (plantilla base = perfumes y demás); las plantillas `funda`/`iniciales` NO lo llevan — equivalente al flag `hide_color_help_whatsapp` del tema origen | `blocks/letters-whatsapp-cta.liquid` |
| Redes sociales | Bloque nativo `social-links` del footer con Facebook/Instagram/TikTok | `sections/footer-group.json` |
| Copy legal colombiano | 4 plantillas `page.<handle>.json` con el copy corregido (typo del email, canal de retracto, enlaces WhatsApp) viajando en un bloque `text` (rich text) — versionado en repo | `templates/page.{envios-y-entregas,faq,politica-de-tratamiento,terminos-del-servicio}.json` |
| Badges `__label:<texto>` | Variante nueva en el sistema `product-badges` nativo que lee los tags del producto | `blocks/_product-card-gallery.liquid`, `snippets/product-badges-styles.liquid`, `snippets/theme-styles-variables.liquid` (esquema `color-custom-badge-label`) |
| Reseñas | Bloque `review` nativo, parcheado para aceptar el metafield `reviews.rating` en ambos formatos (Rating de Shopify `value.rating` o número plano `value`) | `blocks/review.liquid`, bloques `review` en los templates de producto |
| **Módulo fundas** (vista dinámica + personalización) | Ver §2 | `blocks/letters-thread-color.liquid`, `assets/letters-fundas.js`, `snippets/letters-fundas-styles.liquid`, `assets/thread-colors.js`, `assets/funda-*-mask.png` (14) |
| Locales | Claves nuevas en `es.json` + `en.default.json` (idiomas activos) + fallback inglés en los 32 idiomas no activos de Heritage | `locales/*.json` |

### Decisiones de diseño respecto al tema origen
1. **Fotos por variante (sin sync por nombre de archivo)**: Heritage reordena la galería por variante, así que la sincronía formulario↔galería del fork de Prestige se sustituye por **asociar cada foto a su variante en el admin**. `templates/product.funda.json` lleva `hide_variants: true` para que solo se muestren las fotos de la variante seleccionada.
2. **Personalización como line-item properties nativas**: los campos usan `name="properties[...]"` **con los mismos nombres que el tema origen** (`Color del Hilo`, `Datos del dispositivo`, `Iniciales personalizadas`) → los pedidos históricos y nuevos se leen igual.
3. **Sin sync de variantes ocultas**: las restricciones de selección (repujado → solo liso; colores permitidos por cuero) las aplica `assets/letters-fundas.js` sobre el `variant-picker` nativo (oculta/deshabilita y autocorrige), combinadas con la disponibilidad real de variantes.
4. **Validación sin parchear JS de Heritage**: un listener `submit` propio en fase de captura sobre `window` + `stopPropagation()` bloquea el handler delegado del tema sin tocar `product-form.js` → el tema sigue siendo actualizable.
5. **Sin FAB de Shopify Inbox** (decisión del merchant: solo WhatsApp). El snippet `snippets/chat-drawer.liquid` se conserva sin renderizar — para reactivarlo, restaurar `{% render 'chat-drawer' %}` en `layout/theme.liquid` (genera un warning `OrphanedSnippet` mientras esté desactivado, es esperado).

---

## 2. Módulo fundas en detalle

**Plantillas por sufijo** (patrón OS 2.0, como los sufijos `coming-soon`/`pre-order` del tema origen):

| Sufijo | Plantilla | Contenido | Productos |
|---|---|---|---|
| `funda` | `templates/product.funda.json` | Selector de variantes + bloque **Color del hilo** + **Datos del dispositivo** (required) + **Iniciales** | `funda-cuero-genuino` |
| `iniciales` | `templates/product.iniciales.json` | Selector de variantes + **Iniciales** | `funda-nomada-cuero-genuino`, `collar-cuero-genuino`, `tarjetero-cuero-genuino`, `portavasos-cuero-genuino` |
| (base) | `templates/product.json` | Sin personalización + CTA WhatsApp | perfumes y demás |

**`assets/letters-fundas.js`** (se carga global desde `snippets/scripts.liquid`; activación por presencia de `[data-letters-thread-color]`):
1. **Restricciones**: `ALLOWED_LEATHERS` (repujado → solo liso) y `ALLOWED_COLORS` por cuero (liso: negro, verde oliva, tabaco, miel, naranja, azul navy · iguana: negro, cafe oscuro, azul, cafe mocca, taupe · pitón: negro, rojo, miel). Oculta/deshabilita valores no permitidos y autocorrige la selección. Se re-aplica tras cada morph (`shopify:product:select` → `event.promise`).
2. **Overlay de bordado**: inyecta `.letters-thread-overlay` sobre cada `.product-media` con `mask-image` (máscara universal `funda-cuero-liso-negro-bordado-hilo-amarillo-pastel-mask.png`, configurable por bloque) + `--thread-color` desde `window.lettersThreadColors`. Visible solo con Técnica = Bordado.
3. **Validación**: exige color de hilo con técnica Bordado (mensaje `products.product.thread_required_error`); bloquea el submit mostrando el error en el bloque. Los datos de dispositivo se validan con `required` nativo del bloque `product-custom-property`.
4. **Iniciales**: endurece el input nativo (`maxlength=3`, pattern de 3 letras, mayúsculas automáticas).
5. **Muestras de hilo**: pinta los círculos con el color real de cada hilo (`window.lettersThreadColors`, con `window.lettersThreadNameToHandle` para nombres en español).

**Limitaciones heredadas/conocidas:**
- Máscara universal (1 de los 14 PNG en uso; los otros 13 quedan reservados para máscaras por cuero).
- Si se muestra la funda en un contexto sin el bloque de hilo (p. ej. quick-add), la validación de hilo no aplica (igual que en el tema origen con `featured-product`).
- Los botones de pago dinámico no transportan `properties[...]` (limitación de Shopify): para la funda, considerar desactivar `show_payment_button` en el bloque buy-buttons.
- Las tablas de negocio de restricciones están en `assets/letters-fundas.js` (constantes `ALLOWED_*`), no en settings.

---

## 3. Pasos manuales en el admin (imprescindibles antes de publicar)

1. **Backup**: Online Store → Themes → Actions → Duplicate (del tema live actual).
2. **Checkout branding** (no vive en el tema): Configuración → Checkout → Marca → negro `#000000` + oro `#F8E0B5`.
3. **Páginas legales** (las plantillas aportan el contenido, la página aporta la URL):
   - `envios-y-entregas`, `faq`, `politica-de-tratamiento`, `terminos-del-servicio` (crear páginas con esos handles exactos; el contenido de las3 legales sale de la plantilla, la FAQ se escribe en la página).
4. **Plantillas de producto** (Products → producto → Theme template):
   - `funda-cuero-genuino` → **funda**
   - `funda-nomada-cuero-genuino`, `collar-cuero-genuino`, `tarjetero-cuero-genuino`, `portavasos-cuero-genuino` → **iniciales**
   - perfumes y demás → **Default product**
5. **Fotos por variante** en la funda: asociar cada foto a su combinación Técnica × Cuero × Color (sustituye al sync por nombre de archivo).
6. **Reseñas**: verificar que el metafield `reviews.rating` existe con valor (el bloque acepta número o Rating).
7. **Idiomas**: Configuración → Idiomas → activar Español (predeterminado) + Inglés; los demás idiomas de Heritage quedan desactivados (sus claves LETTERS están con fallback en inglés).

---

## 4. QA antes de publicar

```powershell
git checkout -b feature/letters-migration   # ya creado
shopify theme check                          # 2 errores pre-existentes de Heritage (UnknownFilter applicable_disclosures) + 1 warning esperado (chat-drawer sin renderizar)
shopify theme push --unpublished             # sube como tema NO publicado
```

Checklist visual en preview (desktop + móvil):
- [ ] Paleta negra/oro en home, PDP, colección, carrito drawer y footer.
- [ ] Tipografías: Libre Baskerville en headings (mayúsculas), Cormorant Italic en display, Lato en body.
- [ ] Botón flotante WhatsApp: abre chat con mensaje pre-rellenado; sin FAB de Inbox.
- [ ] PDP `funda`: selector Técnica/Cuero/Color con restricciones (repujado → solo liso; colores por cuero), grilla de32 hilos con colores reales, overlay de bordado al seleccionar Bordado + cambiar de hilo tiñe el logo.
- [ ] PDP `funda`: validación — sin hilo + bordado → error y no añade; con repujado → el bloque de hilo desaparece y añade sin hilo; dispositivo vacío → bloqueo nativo.
- [ ] Carrito: las 3 properties (Color del Hilo, Datos del dispositivo, Iniciales personalizadas) visibles en la línea de pedido.
- [ ] Cards: badge `__label:` visible con tags `__label:Texto`; sold-out/sale siguen funcionando.
- [ ] 4 páginas legales con contenido y enlaces WhatsApp correctos.
- [ ] CTA WhatsApp en la PDP de la plantilla base.
- [ ] Reseñas visibles si hay metafield.
- [ ] Checkout con la paleta (config del admin).

---

## 5. Cómo mantenerlo tras actualizaciones de Heritage

- El diff contra el commit base son **37 archivos** (ver `git diff <base>..HEAD --stat`). Tras un update de Heritage, reaplicar:
  1. `config/settings_data.json` (paleta + fuentes) — o rehacer desde el editor.
  2. `snippets/whatsapp-float.liquid` (nuevo, no se pisa) + su render en `layout/theme.liquid` (1 línea).
  3. Bloques nuevos (`letters-thread-color`, `letters-whatsapp-cta`) + `assets/letters-fundas.js`, `assets/thread-colors.js`, `snippets/letters-fundas-styles.liquid` (nuevos).
  4. Parches sobre archivos de Heritage (los únicos que pueden entrar en conflicto): `blocks/_product-card-gallery.liquid` (badges `__label:`), `blocks/review.liquid` (fallback de metafield), `snippets/product-badges-styles.liquid` (flex en badges), `snippets/theme-styles-variables.liquid` (esquema `badge-label`), `snippets/scripts.liquid` (carga de `letters-fundas.js`), `templates/product.json` (bloques review/CTA), `sections/footer-group.json` (redes), `locales/*` (2 claves).
  5. Templates propios (`product.funda`, `product.iniciales`, `page.*`) y assets de máscaras.
- No renombrar `properties[...]` ni los `data-attributes` de `letters-thread-color`/`letters-fundas.js`.
