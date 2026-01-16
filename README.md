# tosijs-schema-form

A [tosijs](https://tosijs.net) web component that generates forms from JSON Schema.

## Installation

```bash
bun add tosijs-schema-form tosijs
```

## Usage

```typescript
import { schemaForm } from 'tosijs-schema-form'

// Wait for component to register
await schemaForm

// Use in HTML
// <schema-form id="myForm"></schema-form>

const form = document.getElementById('myForm')

// Set a JSON Schema
form.schema = {
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: { type: 'string', title: 'Name' },
    email: { type: 'string', format: 'email', title: 'Email' },
    age: { type: 'integer', minimum: 0 }
  }
}

// Optionally set initial data
form.data = { name: 'Jane', email: 'jane@example.com' }

// Get current form data
const data = form.getData()

// Listen for changes
form.addEventListener('schema-input', (e) => {
  console.log('Form changed:', e.detail.data)
})

form.addEventListener('schema-submit', (e) => {
  console.log('Form submitted:', e.detail.data)
})
```

## Features

- Renders forms from any JSON Schema
- **Primitives**: string, number, integer, boolean
- **String formats**: email, url, date, datetime-local, time, password
- **Enums**: rendered as dropdowns
- **anyOf**: const values rendered as dropdowns
- **Nested objects**: rendered as fieldsets
- **Arrays**: add/remove items with min/max constraints
- Required field markers and descriptions
- Reactive: setting `schema` or `data` triggers re-render

## Schema Support

| Feature | Support |
|---------|---------|
| `type: string` | Text input (or textarea for maxLength > 200) |
| `type: number` | Number input |
| `type: integer` | Number input with step=1 |
| `type: boolean` | Checkbox |
| `type: object` | Nested fieldset |
| `type: array` | List with add/remove buttons |
| `enum` | Select dropdown |
| `anyOf` (const) | Select dropdown |
| `format: email` | Email input |
| `format: url/uri` | URL input |
| `format: date` | Date picker |
| `format: date-time` | Datetime picker |
| `format: time` | Time picker |
| `format: password` | Password input |
| `title` | Field label |
| `description` | Help text |
| `required` | Required marker (*) |
| `minimum/maximum` | Number constraints |
| `minLength/maxLength` | String constraints |
| `pattern` | Regex validation |
| `minItems/maxItems` | Array constraints |
| `default` | Default values |

## Styling

The component uses light DOM (no shadow DOM) with scoped CSS. Override styles using the `schema-form` tag selector:

```css
schema-form .schema-field {
  margin-bottom: 2rem;
}

schema-form input {
  border-color: blue;
}
```

## Development

```bash
# Run demo
bun run demo

# Build library
bun run build
```

## License

MIT
