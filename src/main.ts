import { schemaForm } from './schema-form'
import {
  contactSchema, blogPostSchema, orderSchema, contentBuilderSchema,
  contactSampleData, blogPostSampleData, orderSampleData, contentBuilderSampleData
} from './example-schemas'

// Wait for component to be ready
await schemaForm

const schemas = {
  contact: { schema: contactSchema, sample: contactSampleData, title: 'Contact Form', desc: 'Basic form with primitive types and validation' },
  blogPost: { schema: blogPostSchema, sample: blogPostSampleData, title: 'Blog Post', desc: 'Nested objects with author info and tag arrays' },
  order: { schema: orderSchema, sample: orderSampleData, title: 'E-Commerce Order', desc: 'Deeply nested structure with products, variants, shipping, and payment' },
  contentBuilder: { schema: contentBuilderSchema, sample: contentBuilderSampleData, title: 'Content Builder', desc: 'Union types with variant picker for mixed content blocks' }
}

let currentSchema: keyof typeof schemas = 'contact'

const form = document.getElementById('schemaForm') as any
const output = document.getElementById('output')!
const schemaOutput = document.getElementById('schemaOutput')!
const formTitle = document.getElementById('formTitle')!
const formDescription = document.getElementById('formDescription')!
const validationMessage = document.getElementById('validationMessage')!

function showValidationMessage(isValid: boolean, message: string) {
  validationMessage.textContent = message
  validationMessage.className = 'validation-message show ' + (isValid ? 'success' : 'error')
}

function hideValidationMessage() {
  validationMessage.className = 'validation-message'
}

function validateForm(): boolean {
  const formEl = form.querySelector('form') as HTMLFormElement
  if (!formEl) return false
  
  // Trigger native validation UI
  const isValid = formEl.checkValidity()
  
  if (!isValid) {
    // reportValidity shows the browser's validation UI
    formEl.reportValidity()
    
    // Collect invalid fields for our message
    const invalidFields: string[] = []
    formEl.querySelectorAll(':invalid').forEach((el: Element) => {
      const input = el as HTMLInputElement
      const label = input.labels?.[0]?.textContent || input.name || 'Unknown field'
      invalidFields.push(label.replace(' *', ''))
    })
    
    showValidationMessage(false, `Validation failed. Invalid fields: ${invalidFields.join(', ')}`)
    return false
  }
  
  return true
}

function loadSchema(name: keyof typeof schemas) {
  const { schema, title, desc } = schemas[name]
  currentSchema = name
  form.schema = schema
  form.data = {}
  formTitle.textContent = title
  formDescription.textContent = desc
  schemaOutput.textContent = JSON.stringify(schema, null, 2)
  output.textContent = 'Click "Submit" to validate and see form data'
  hideValidationMessage()

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
document.getElementById('submitForm')!.addEventListener('click', () => {
  if (validateForm()) {
    const data = form.getData()
    output.textContent = JSON.stringify(data, null, 2)
    showValidationMessage(true, 'Form submitted successfully!')
  }
})

document.getElementById('validateForm')!.addEventListener('click', () => {
  if (validateForm()) {
    showValidationMessage(true, 'All fields are valid!')
  }
})

document.getElementById('getData')!.addEventListener('click', () => {
  hideValidationMessage()
  output.textContent = JSON.stringify(form.getData(), null, 2)
})

document.getElementById('setData')!.addEventListener('click', () => {
  hideValidationMessage()
  form.data = schemas[currentSchema].sample
})

document.getElementById('clearData')!.addEventListener('click', () => {
  hideValidationMessage()
  form.data = {}
})

// Form events
form.addEventListener('schema-submit', (e: CustomEvent) => {
  output.textContent = JSON.stringify(e.detail.data, null, 2)
})

// Initial load
loadSchema('contact')
