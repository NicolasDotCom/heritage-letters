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
| **Barra sticky de compra** | Chips de variante en una sola línea (el título de variante de Shopify se partía en 3 líneas y aplastaba el título del producto), precio limpio en móvil (sin tachado ni badge de descuento) y barra compacta (miniatura/botón 44px) | `sections/product-information.liquid` (parche Heritage) |
| **Botón WhatsApp vs barra sticky** | El FAB se desplaza sobre la barra de compra en móvil (clase `is-raised` + var `--wa-sticky-offset`, sincronizado con `data-stuck` vía Mutation/ResizeObserver); `z-index` en el sistema de capas del tema para que los drawers lo tapen | `snippets/whatsapp-float.liquid` |
| **Copy de PDP en español** | Se sustituyó el copy placeholder de Heritage (Materials/Care/Details, badges "Made with care…", "Styled With", "You may also like") en las 3 plantillas de producto | `templates/product{,.funda,.iniciales}.json` |

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
  4. Parches sobre archivos de Heritage (los únicos que pueden entrar en conflicto): `blocks/_product-card-gallery.liquid` (badges `__label:`), `blocks/review.liquid` (fallback de metafield), `blocks/product-custom-property.liquid` (range `max_length` con mínimo 3), `snippets/product-badges-styles.liquid` (flex en badges), `snippets/theme-styles-variables.liquid` (esquema `badge-label`), `snippets/scripts.liquid` (carga de `letters-fundas.js`), `sections/product-information.liquid` (chips de variante + estilos de la barra sticky + precio compacto en móvil), `templates/product.json` (bloques review/CTA), `sections/footer-group.json` (redes), `locales/*` (2 claves).
  5. Templates propios (`product.funda`, `product.iniciales`, `page.*`) y assets de máscaras.
- No renombrar `properties[...]` ni los `data-attributes` de `letters-thread-color`/`letters-fundas.js`.

---

## 6. Pulido visual de la PDP (post-migración)

**Barra sticky de compra** (`sections/product-information.liquid`):
- Los chips de variante se generan en Liquid (`current_variant.title | split: ' / '`) → el morph que hace el JS de Heritage (`sticky-add-to-cart.js`, `morph(..., { childrenOnly: true })`) los actualiza solo al cambiar de variante. Único caso degradado: cuando la variante no está disponible el JS escribe texto plano en `.sticky-add-to-cart__variant` (sin chips).
- Móvil: barra compacta (miniatura y botón 44px) y solo precio actual (se ocultan tachado y badge de descuento dentro de la barra, `.sticky-add-to-cart__price .compare-at-price / .price__discount-badge`).

**Botón flotante WhatsApp** (`snippets/whatsapp-float.liquid`):
- Se desplaza sobre la barra cuando `data-stuck="true"` (clase `is-raised` + `--wa-sticky-offset` medido con `ResizeObserver`, sincronizado con `MutationObserver`). Nunca tapa el "Agregar al carrito".
- En pantallas ≥1000px la barra es un pill centrado de 600px y el botón conserva su posición (sin saltos).
- `z-index: var(--layer-sticky)` → los drawers del tema (carrito/búsqueda) sí lo tapan.

**Campo de iniciales** (`blocks/product-custom-property.liquid` + `templates/product.{funda,iniciales}.json`):
- El contador "X de Y caracteres utilizados" se genera desde el setting `max_length` del bloque, cuyo range tenía `min: 25` (Heritage) mientras `letters-fundas.js` endurece el input a 3 letras → se veía "0 de 25".
- Fix: range del schema en `min: 3, max: 250, step: 13, default: 94` + `max_length: 3` en el bloque `Iniciales personalizadas` de las plantillas `funda`/`iniciales`. El campo de "Datos del dispositivo" conserva 250.
- Restricciones de Shopify para settings `range` (aprendidas al validar el schema): máximo **101 pasos**, el `step` debe **dividir `max - min` de forma equitativa** y el `default` debe caer en la **rejilla** (`min + k*step`). Con `min: 3` y `max: 250` la diferencia es 247 (= 13 × 19), así que los únicos pasos válidos son 13, 19 o 247 (de ahí `step: 13` y `default: 94`).
- Resultado: contador correcto desde el primer render ("0 de 3 caracteres utilizados") y `maxlength="3"` nativo (funciona sin JS); `letters-fundas.js` sigue aplicando mayúsculas automáticas y el pattern de 3 letras.

**Footer en español neutro** (`sections/footer-group.json`): "About us" → "Nosotros", "Shop" → "Tienda", "Support" → "Ayuda", "Our story" → "Nuestra historia", la descripción del bloque Nosotros lleva el manifiesto de marca ("LETTERS nace como una resistencia silenciosa ante el ruido…") y `show_powered_by: false` elimina el "Tecnología de Shopify" del copyright.

**Fase 1 — Conversión** (optimización de la tienda):
- **Social sharing**: nuevo setting `social_share_image` (Theme settings → Logo y favicon) + fallback de `og:image` en `snippets/meta-tags.liquid` (antes solo usaba `page_image`, vacío en home/colecciones). `og:description` ya no cae a `shop.name`: usa la tagline `content.brand_tagline` (presente en los 34 idiomas: es/en con copy propio, resto con fallback inglés).
- **CTA WhatsApp en PDP**: bloque `letters-whatsapp-cta` añadido a `templates/product.{funda,iniciales}.json` (mensaje pre-rellenado distinto para funda y para personalización).
- **FAQ en PDP**: el bloque `disclosures` de las plantillas `funda`/`iniciales` lleva 6 (funda) y 5 (iniciales) filas `_accordion-row` con dudas reales: tiempos, medidas del dispositivo, personalización, cuidado del cuero, envíos/contra entrega y garantía.
- **Credenciales en home**: sección `custom-liquid` (`section_trust_letters`) que renderiza `snippets/letters-trust-badges` justo después del hero.
- **404 traducido** ("Página no encontrada", "Nuestros más vendidos").

**Copy en español**: las 3 plantillas de producto (`product`, `product.funda`, `product.iniciales`) sustituyen el copy placeholder de Heritage (Materiales / Cuidados / Detalles, badges "Hecho a mano…", "Combínalo con", "También te puede gustar"). La home (`templates/index.json`) lleva el titular del hero **"Tu historia, escrita en cuero"** + subtítulo + CTA **"Personaliza el tuyo"** (→ `/products/funda-cuero-genuino`), y los textos de secciones traducidos ("Destacado", "Nuestro producto insignia", "Nuestros más vendidos", "Nuevo lanzamiento"). Es copy provisional: se ajusta desde el editor y queda versionado en el repo.

**Pendientes fuera del tema**:
- Formato de moneda COP con decimales (`$407.000,00 COP`) → Configuración → Moneda de la tienda.
- `templates/404.json` aún tiene 1 línea de copy placeholder de Heritage en inglés.
