import { schemaForm } from './schema-form'
import {
  contactSchema, blogPostSchema, orderSchema,
  contactSampleData, blogPostSampleData, orderSampleData
} from './example-schemas'

// Wait for component to be ready
await schemaForm

const schemas = {
  contact: { schema: contactSchema, sample: contactSampleData, title: 'Contact Form', desc: 'Basic form with primitive types and validation' },
  blogPost: { schema: blogPostSchema, sample: blogPostSampleData, title: 'Blog Post', desc: 'Nested objects with author info and tag arrays' },
  order: { schema: orderSchema, sample: orderSampleData, title: 'E-Commerce Order', desc: 'Deeply nested structure with products, variants, shipping, and payment' }
}

let currentSchema: keyof typeof schemas = 'contact'

const form = document.getElementById('schemaForm') as any
const output = document.getElementById('output')!
const schemaOutput = document.getElementById('schemaOutput')!
const formTitle = document.getElementById('formTitle')!
const formDescription = document.getElementById('formDescription')!

function loadSchema(name: keyof typeof schemas) {
  const { schema, title, desc } = schemas[name]
  currentSchema = name
  form.schema = schema
  form.data = {}
  formTitle.textContent = title
  formDescription.textContent = desc
  schemaOutput.textContent = JSON.stringify(schema, null, 2)
  output.textContent = 'Click "Get Form Data" to see current values'

  // Update button states
  document.querySelectorAll('.schema-selector button').forEach(btn => {
    const el = btn as HTMLElement
    btn.classList.toggle('active', el.dataset.schema === name)
  })
}

// Schema selector buttons
document.querySelectorAll('.schema-selector button').forEach(btn => {
  btn.addEventListener('click', () => {
    const el = btn as HTMLElement
    loadSchema(el.dataset.schema as keyof typeof schemas)
  })
})

// Tab switching
document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    const el = btn as HTMLElement
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'))
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'))
    btn.classList.add('active')
    document.getElementById(el.dataset.tab + 'Tab')?.classList.add('active')
  })
})

// Action buttons
document.getElementById('getData')!.addEventListener('click', () => {
  output.textContent = JSON.stringify(form.getData(), null, 2)
})

document.getElementById('setData')!.addEventListener('click', () => {
  form.data = schemas[currentSchema].sample
})

document.getElementById('clearData')!.addEventListener('click', () => {
  form.data = {}
})

// Form events
form.addEventListener('schema-submit', (e: CustomEvent) => {
  output.textContent = JSON.stringify(e.detail.data, null, 2)
})

// Initial load
loadSchema('contact')
