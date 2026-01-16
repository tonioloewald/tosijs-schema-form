# schema-form

A [tosijs](https://github.com/tonioloewald/xinjs) web component that generates forms from JSON Schema.

## Features

- **JSON Schema support**: Generates forms from standard JSON Schema definitions
- **Nested structures**: Objects, arrays, arrays of objects with nested arrays
- **Union types**: `anyOf`/`oneOf` with variant picker for polymorphic arrays
- **Range sliders**: Numbers with both `minimum` and `maximum` get slider + number input
- **Native validation**: Uses HTML5 validation attributes (required, min, max, pattern, etc.)
- **Theming**: CSS custom properties with fallbacks via `varDefault`
- **Data round-trip**: Form data accurately reflects schema structure

## Installation

```bash
npm install tosijs-schema-form
```

## Basic Usage

```html
<schema-form id="myForm"></schema-form>

<script type="module">
import { schemaForm } from 'tosijs-schema-form'

await schemaForm // wait for component registration

const form = document.getElementById('myForm')

// Set schema
form.schema = {
  type: 'object',
  properties: {
    name: { type: 'string', title: 'Name' },
    email: { type: 'string', format: 'email', title: 'Email' },
    age: { type: 'integer', minimum: 0, maximum: 120, title: 'Age' }
  },
  required: ['name', 'email']
}

// Optionally set initial data
form.data = { name: 'Jane', email: 'jane@example.com', age: 30 }

// Get current form data
const data = form.getData()
</script>
```

## Schema Support

### Basic Types

```javascript
// String
{ type: 'string', title: 'Name', minLength: 1, maxLength: 100 }

// Number with range slider (has both min and max)
{ type: 'number', title: 'Score', minimum: 0, maximum: 100 }

// Integer
{ type: 'integer', title: 'Count' }

// Boolean (renders as checkbox)
{ type: 'boolean', title: 'Subscribe' }

// Enum (renders as select)
{ type: 'string', enum: ['draft', 'published', 'archived'], title: 'Status' }
```

### Objects

```javascript
{
  type: 'object',
  title: 'Author',
  properties: {
    name: { type: 'string' },
    bio: { type: 'string' }
  },
  required: ['name']
}
```

### Arrays

```javascript
// Array of strings
{
  type: 'array',
  title: 'Tags',
  items: { type: 'string' }
}

// Array of objects
{
  type: 'array',
  title: 'Items',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      quantity: { type: 'integer' }
    }
  }
}
```

### Union Types (anyOf/oneOf)

```javascript
// Simple union (renders as select)
{
  title: 'Priority',
  anyOf: [
    { const: 'low', title: 'Low' },
    { const: 'medium', title: 'Medium' },
    { const: 'high', title: 'High' }
  ]
}

// Complex union (renders variant selector + fields)
{
  title: 'Header Style',
  oneOf: [
    {
      type: 'object',
      title: 'Simple',
      properties: { text: { type: 'string' } }
    },
    {
      type: 'object',
      title: 'Hero',
      properties: {
        text: { type: 'string' },
        backgroundImage: { type: 'string' }
      }
    }
  ]
}

// Array with union items (variant picker dropdown)
{
  type: 'array',
  title: 'Content Blocks',
  items: {
    anyOf: [
      { type: 'object', title: 'Text Block', properties: { content: { type: 'string' } } },
      { type: 'object', title: 'Image Block', properties: { url: { type: 'string' } } }
    ]
  }
}
```

## Validation

The component uses native HTML5 validation. To trigger validation:

```javascript
const formEl = document.querySelector('schema-form form')

// Check validity
if (formEl.checkValidity()) {
  const data = form.getData()
  // submit data
} else {
  formEl.reportValidity() // shows browser validation UI
}
```

Supported validation attributes:
- `required` (from schema's `required` array)
- `minLength` / `maxLength` (strings)
- `min` / `max` (numbers)
- `pattern` (strings with `pattern` property)
- `type="email"` (strings with `format: 'email'`)
- `type="url"` (strings with `format: 'uri'`)

## Events

```javascript
// Fires on any input change
form.addEventListener('schema-input', (e) => {
  console.log('Current data:', e.detail.data)
})

// Fires on form submit
form.addEventListener('schema-submit', (e) => {
  console.log('Submitted:', e.detail.data)
})
```

## Theming

The component uses CSS custom properties with fallbacks. Override globally or per-instance:

```css
/* Global theming */
:root {
  --spacing: 12px;
  --color: #333;
  --background: #fff;
  --brand-color: #0066cc;
  --border-color: #ccc;
  --focus-color: #0066cc;
}

/* Per-instance */
schema-form {
  --sf-spacing: 16px;
  --sf-brand-color: #ff6600;
}
```

## Blueprint Usage

For advanced use cases, you can import the blueprint directly and use it with your own tosijs instance:

```javascript
import { schemaFormBlueprint } from 'tosijs-schema-form/blueprint'
import { makeComponent } from 'tosijs'

const schemaForm = makeComponent('schema-form', schemaFormBlueprint)
```

This avoids bundling tosijs twice and ensures version compatibility.

## License

MIT
