const fs = require('fs');
const path = require('path');

function parseCSV(text) {
  const lines = [];
  let currentLine = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentLine.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentLine.push(currentVal);
      lines.push(currentLine);
      currentLine = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentLine.length) {
    currentLine.push(currentVal);
    lines.push(currentLine);
  }
  return lines;
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const originalPath = path.join(__dirname, '..', 'products_export.csv');
const originalContent = fs.readFileSync(originalPath, 'utf8');
const originalRows = parseCSV(originalContent);
const headers = originalRows[0];
const row1 = originalRows[1];

const variants = [
  // Repujado - Liso (6)
  {
    tecnica: 'Repujado',
    cuero: 'Liso',
    color: 'Negro',
    price: '407000.00',
    compare: '437000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-liso-negro-repujado.png?v=1785770737'
  },
  {
    tecnica: 'Repujado',
    cuero: 'Liso',
    color: 'Tabaco',
    price: '407000.00',
    compare: '437000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-liso-tabaco-repujado.png?v=1785770737'
  },
  {
    tecnica: 'Repujado',
    cuero: 'Liso',
    color: 'Miel',
    price: '407000.00',
    compare: '437000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-liso-miel-repujado.png?v=1785770737'
  },
  {
    tecnica: 'Repujado',
    cuero: 'Liso',
    color: 'Azul Navy',
    price: '407000.00',
    compare: '437000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-liso-azul-navy-repujado.png?v=1785770737'
  },
  {
    tecnica: 'Repujado',
    cuero: 'Liso',
    color: 'Verde Oliva',
    price: '407000.00',
    compare: '437000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-liso-verde-oliva-repujado.png?v=1785770739'
  },
  {
    tecnica: 'Repujado',
    cuero: 'Liso',
    color: 'Naranja',
    price: '407000.00',
    compare: '437000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-liso-naranja-repujado.png?v=1785770739'
  },

  // Bordado - Liso (6)
  {
    tecnica: 'Bordado',
    cuero: 'Liso',
    color: 'Negro',
    price: '437000.00',
    compare: '467000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-liso-negro-bordado-hilo-amarillo-pastel.png?v=1785770738'
  },
  {
    tecnica: 'Bordado',
    cuero: 'Liso',
    color: 'Tabaco',
    price: '437000.00',
    compare: '467000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-liso-tabaco-bordado-hilo-amarillo-pastel.png?v=1785770737'
  },
  {
    tecnica: 'Bordado',
    cuero: 'Liso',
    color: 'Miel',
    price: '437000.00',
    compare: '467000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-liso-miel-bordado-hilo-amarillo-pastel.png?v=1785770737'
  },
  {
    tecnica: 'Bordado',
    cuero: 'Liso',
    color: 'Azul Navy',
    price: '437000.00',
    compare: '467000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-liso-azul-navy-bordado-hilo-amarillo-pastel.png?v=1785770739'
  },
  {
    tecnica: 'Bordado',
    cuero: 'Liso',
    color: 'Verde Oliva',
    price: '437000.00',
    compare: '467000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-liso-verde-oliva-bordado-hilo-amarillo-pastel.png?v=1785770737'
  },
  {
    tecnica: 'Bordado',
    cuero: 'Liso',
    color: 'Naranja',
    price: '437000.00',
    compare: '467000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-liso-naranja-bordado-hilo-amarillo-pastel.png?v=1785770737'
  },

  // Bordado - Texturizado Iguana (5)
  {
    tecnica: 'Bordado',
    cuero: 'Texturizado Iguana',
    color: 'Negro',
    price: '437000.00',
    compare: '467000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-texturizado-iguana-negro-bordado-hilo-amarillo-pastel.png?v=1785770739'
  },
  {
    tecnica: 'Bordado',
    cuero: 'Texturizado Iguana',
    color: 'Café Oscuro',
    price: '437000.00',
    compare: '467000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-texturizado-iguana-cafe-oscuro-bordado-hilo-amarillo-pastel.png?v=1785770739'
  },
  {
    tecnica: 'Bordado',
    cuero: 'Texturizado Iguana',
    color: 'Azul',
    price: '437000.00',
    compare: '467000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-texturizado-iguana-azul-bordado-hilo-amarillo-pastel.png?v=1785770738'
  },
  {
    tecnica: 'Bordado',
    cuero: 'Texturizado Iguana',
    color: 'Café Mocca',
    price: '437000.00',
    compare: '467000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-texturizado-iguana-cafe-mocca-bordado-hilo-amarillo-pastel.png?v=1785770738'
  },
  {
    tecnica: 'Bordado',
    cuero: 'Texturizado Iguana',
    color: 'Taupe',
    price: '437000.00',
    compare: '467000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-texturizado-iguana-taupe-bordado-hilo-amarillo-pastel.png?v=1785770737'
  },

  // Bordado - Texturizado Pitón (3)
  {
    tecnica: 'Bordado',
    cuero: 'Texturizado Pitón',
    color: 'Negro',
    price: '437000.00',
    compare: '467000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-texturizado-piton-negro-bordado-hilo-amarillo-pastel.png?v=1785770737'
  },
  {
    tecnica: 'Bordado',
    cuero: 'Texturizado Pitón',
    color: 'Miel',
    price: '437000.00',
    compare: '467000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-texturizado-piton-miel-bordado-hilo-amarillo-pastel.png?v=1785770737'
  },
  {
    tecnica: 'Bordado',
    cuero: 'Texturizado Pitón',
    color: 'Rojo',
    price: '437000.00',
    compare: '467000.00',
    img: 'https://cdn.shopify.com/s/files/1/0779/6932/6308/files/funda-cuero-texturizado-piton-rojo-bordado-hilo-amarillo-pastel.png?v=1786041359'
  }
];

const outputRows = [];
outputRows.push(headers);

variants.forEach((v, idx) => {
  const row = new Array(headers.length).fill('');
  
  // Base fields
  row[0] = 'funda-cuero-genuino'; // Handle
  
  if (idx === 0) {
    row[1] = row1[1]; // Title
    row[2] = row1[2]; // Body (HTML)
    row[3] = row1[3]; // Vendor
    row[4] = row1[4]; // Product Category
    row[5] = row1[5]; // Type
    row[6] = row1[6]; // Tags
    row[7] = row1[7]; // Published
    row[8] = 'Técnica'; // Option1 Name
    row[11] = 'Tipo de cuero'; // Option2 Name
    row[14] = 'Color'; // Option3 Name
    row[35] = row1[35]; // Gift Card
    row[36] = row1[36]; // SEO Title
    row[37] = row1[37]; // SEO Description
    row[41] = row1[41]; // Material metafield
    row[50] = row1[50]; // Status
  }
  
  // Option values
  row[9] = v.tecnica; // Option1 Value
  row[12] = v.cuero;   // Option2 Value
  row[15] = v.color;   // Option3 Value
  
  // Variant inventory & pricing
  row[18] = '0.0';     // Variant Grams
  row[19] = 'shopify'; // Variant Inventory Tracker
  row[20] = '300';     // Variant Inventory Qty
  row[21] = 'deny';    // Variant Inventory Policy
  row[22] = 'manual';  // Variant Fulfillment Service
  row[23] = v.price;   // Variant Price
  row[24] = v.compare; // Variant Compare At Price
  row[25] = 'true';    // Variant Requires Shipping
  row[26] = 'false';   // Variant Taxable
  
  // Images
  row[32] = v.img;           // Image Src
  row[33] = String(idx + 1); // Image Position
  row[46] = v.img;           // Variant Image
  row[47] = 'kg';            // Variant Weight Unit
  
  outputRows.push(row);
});

const csvOutput = outputRows.map(row => row.map(escapeCSV).join(',')).join('\r\n');

// Write to funda_actualizada.csv and also update funda-variantes.csv
const outPath = path.join(__dirname, '..', 'funda_actualizada.csv');
fs.writeFileSync(outPath, '\uFEFF' + csvOutput, 'utf8');

console.log('Successfully generated', outPath);
console.log('Total output rows (including header):', outputRows.length);
