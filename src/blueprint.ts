// Schema Form Blueprint
// A pure function with no dependencies - receives tosijs toolkit at runtime

import type { XinBlueprint, XinFactory } from 'tosijs'

// JSON Schema types (subset we support)
export interface JSONSchema {
  type?: string | string[]
  properties?: Record<string, JSONSchema>
  items?: JSONSchema
  required?: string[]
  enum?: any[]
  const?: any
  anyOf?: JSONSchema[]
  oneOf?: JSONSchema[]
  
  // Discriminator for union types
  discriminator?: {
    propertyName: string
    mapping?: Record<string, string>
  }
  
  // Constraints
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  minItems?: number
  maxItems?: number
  
  // Metadata
  title?: string
  description?: string
  default?: any
  format?: string
  
  // Additional
  additionalProperties?: boolean | JSONSchema
  [key: string]: any
}

export interface SchemaFormParts {
  form: HTMLFormElement
}

// Helper to generate unique IDs
let idCounter = 0
const uniqueId = (prefix: string) => `${prefix}-${++idCounter}`

// Get a human-readable label from a property name or schema
const getLabel = (key: string, schema: JSONSchema): string => {
  if (schema.title) return schema.title
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, c => c.toUpperCase())
    .trim()
}

// Get union variants from anyOf or oneOf
const getUnionVariants = (schema: JSONSchema): JSONSchema[] | null => {
  return schema.anyOf || schema.oneOf || null
}

// Get a label for a union variant
const getVariantLabel = (variant: JSONSchema, index: number): string => {
  if (variant.title) return variant.title
  if (variant.const !== undefined) return String(variant.const)
  if (variant.type) return Array.isArray(variant.type) ? variant.type[0] : variant.type
  if (variant.properties) {
    const keys = Object.keys(variant.properties)
    const typeKey = keys.find(k => k === 'type' || k === 'kind' || k === '_type')
    if (typeKey && variant.properties[typeKey]?.const) {
      return String(variant.properties[typeKey].const)
    }
  }
  return `Option ${index + 1}`
}

// Detect which variant matches a value
const detectVariant = (value: any, variants: JSONSchema[]): number => {
  if (value === null || value === undefined) return 0
  
  // First pass: check for exact const matches (highest priority)
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    if (variant.const !== undefined && value === variant.const) return i
  }
  
  // Second pass: check type matches
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    
    // Skip const-only variants (already checked above)
    if (variant.const !== undefined && !variant.type) continue
    
    const variantType = Array.isArray(variant.type) ? variant.type[0] : variant.type
    if (variantType) {
      const valueType = typeof value
      if (variantType === 'string' && valueType === 'string') return i
      if (variantType === 'number' && valueType === 'number') return i
      if (variantType === 'integer' && valueType === 'number' && Number.isInteger(value)) return i
      if (variantType === 'boolean' && valueType === 'boolean') return i
      if (variantType === 'array' && Array.isArray(value)) return i
      if (variantType === 'object' && valueType === 'object' && !Array.isArray(value)) {
        if (variant.properties) {
          const variantKeys = Object.keys(variant.properties)
          for (const key of variantKeys) {
            if (variant.properties[key]?.const !== undefined) {
              if (value[key] === variant.properties[key].const) return i
            }
          }
          const matchCount = variantKeys.filter(k => k in value).length
          if (matchCount === variantKeys.length) return i
        } else {
          return i
        }
      }
    }
  }
  
  return 0
}

// Get default value for a schema
const getDefaultValue = (schema: JSONSchema): any => {
  if (schema.default !== undefined) return schema.default
  
  const schemaType = Array.isArray(schema.type) ? schema.type[0] : schema.type
  
  switch (schemaType) {
    case 'string': return ''
    case 'number': 
    case 'integer': return schema.minimum ?? 0
    case 'boolean': return false
    case 'array': return []
    case 'object':
      if (schema.properties) {
        const obj: Record<string, any> = {}
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          obj[key] = getDefaultValue(propSchema)
        }
        return obj
      }
      return {}
    default: return null
  }
}

// Set value by path
const setValueByPath = (obj: any, path: string, value: any): void => {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!
    const nextPart = parts[i + 1]
    const isNextArray = nextPart ? /^\d+$/.test(nextPart) : false
    if (current[part] == null) {
      current[part] = isNextArray ? [] : {}
    }
    current = current[part]
  }
  const lastPart = parts[parts.length - 1]
  if (lastPart) {
    current[lastPart] = value
  }
}

// Collect form data from the DOM
const collectFormData = (form: HTMLFormElement, _schema: JSONSchema): any => {
  const data: any = {}
  
  const inputs = form.querySelectorAll('input[data-path]:not([data-union]), select[data-path]:not([data-union]), textarea[data-path]:not([data-union])')
  inputs.forEach((input: Element) => {
    const el = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    const path = el.dataset.path || ''
    const dataType = el.dataset.type
    
    if (!path) return
    
    let value: any
    
    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      value = el.checked
    } else if (dataType === 'number' || dataType === 'integer') {
      value = el.value === '' ? undefined : Number(el.value)
    } else if (dataType === 'boolean') {
      value = el.value === 'true'
    } else {
      value = el.value
    }
    
    setValueByPath(data, path, value)
  })
  
  return data
}

/**
 * Schema Form Blueprint
 * 
 * A pure function that receives the tosijs toolkit and returns a component spec.
 * Use with makeComponent() or load dynamically via <xin-blueprint>.
 * 
 * @example
 * // Direct usage
 * import { schemaFormBlueprint } from 'schema-form/blueprint'
 * import { makeComponent } from 'tosijs'
 * const schemaForm = makeComponent('schema-form', schemaFormBlueprint)
 * 
 * @example
 * // Dynamic loading via HTML
 * <xin-blueprint src="schema-form/blueprint.js" tag="schema-form"></xin-blueprint>
 */
export const schemaFormBlueprint: XinBlueprint<SchemaFormParts> = (
  _tag: string,
  { Component, elements, vars, varDefault }: XinFactory
) => {
  const { form, div, label, input, select, option, textarea, button, span, fieldset, legend } = elements

  // Render a field based on its schema
  const renderField = (
    key: string,
    schema: JSONSchema,
    value: any,
    path: string,
    required: boolean
  ): HTMLElement => {
    const fieldId = uniqueId(path)
    const fieldLabel = getLabel(key, schema)
    
    // Handle anyOf/oneOf (union types)
    const variants = getUnionVariants(schema)
    if (variants) {
      const allConst = variants.every(s => s.const !== undefined)
      
      if (allConst) {
        const selectEl = select(
          {
            id: fieldId,
            name: path,
            required,
            'data-path': path,
          },
          option({ value: '' }, '-- Select --'),
          ...variants.map(s => 
            option({ value: String(s.const) }, s.title || String(s.const))
          )
        )
        if (value !== undefined && value !== null) {
          selectEl.value = String(value)
        }
        return div(
          { class: 'schema-field' },
          label({ for: fieldId }, fieldLabel, required ? span({ class: 'required' }, ' *') : ''),
          schema.description ? div({ class: 'description' }, schema.description) : '',
          selectEl
        )
      }
      
      const currentVariantIndex = detectVariant(value, variants)
      const currentVariant = variants[currentVariantIndex]
      
      const variantSelector = select(
        {
          id: fieldId,
          class: 'schema-union-selector',
          'data-path': path,
          'data-union': 'true',
        },
        ...variants.map((v, i) => 
          option(
            i === currentVariantIndex ? { value: String(i), selected: true } : { value: String(i) },
            getVariantLabel(v, i)
          )
        )
      )
      
      const variantContent = div({ class: 'schema-union-content', 'data-variant': currentVariantIndex })
      
      if (currentVariant.type === 'object' && currentVariant.properties) {
        const requiredFields = currentVariant.required || []
        Object.entries(currentVariant.properties).forEach(([propKey, propSchema]) => {
          variantContent.append(
            renderField(propKey, propSchema, value?.[propKey], `${path}.${propKey}`, requiredFields.includes(propKey))
          )
        })
      } else {
        variantContent.append(renderField(key, currentVariant, value, path, required))
      }
      
      variantSelector.addEventListener('change', () => {
        const newIndex = parseInt(variantSelector.value, 10)
        const newVariant = variants[newIndex]
        variantContent.textContent = ''
        variantContent.dataset.variant = String(newIndex)
        
        const defaultValue = getDefaultValue(newVariant)
        
        if (newVariant.type === 'object' && newVariant.properties) {
          const requiredFields = newVariant.required || []
          Object.entries(newVariant.properties).forEach(([propKey, propSchema]) => {
            variantContent.append(
              renderField(propKey, propSchema, defaultValue?.[propKey], `${path}.${propKey}`, requiredFields.includes(propKey))
            )
          })
        } else {
          variantContent.append(renderField(key, newVariant, defaultValue, path, required))
        }
      })
      
      return fieldset(
        { class: 'schema-union', 'data-path': path },
        legend(fieldLabel, required ? span({ class: 'required' }, ' *') : ''),
        schema.description ? div({ class: 'description' }, schema.description) : '',
        div({ class: 'schema-union-selector-container' }, variantSelector),
        variantContent
      )
    }
    
    // Handle const (fixed value)
    if (schema.const !== undefined) {
      const constType = typeof schema.const === 'number' 
        ? (Number.isInteger(schema.const) ? 'integer' : 'number')
        : typeof schema.const
      return div(
        { class: 'schema-field schema-field-const' },
        label({ for: fieldId }, fieldLabel, required ? span({ class: 'required' }, ' *') : ''),
        schema.description ? div({ class: 'description' }, schema.description) : '',
        input({
          type: 'hidden',
          id: fieldId,
          name: path,
          value: String(schema.const),
          'data-path': path,
          'data-type': constType,
          'data-const': 'true',
        }),
        span({ class: 'schema-const-value' }, String(schema.const))
      )
    }
    
    // Handle enum
    if (schema.enum) {
      const selectEl = select(
        {
          id: fieldId,
          name: path,
          required,
          'data-path': path,
        },
        option({ value: '' }, '-- Select --'),
        ...schema.enum.map(v => option({ value: String(v) }, String(v)))
      )
      if (value !== undefined && value !== null) {
        selectEl.value = String(value)
      }
      return div(
        { class: 'schema-field' },
        label({ for: fieldId }, fieldLabel, required ? span({ class: 'required' }, ' *') : ''),
        schema.description ? div({ class: 'description' }, schema.description) : '',
        selectEl
      )
    }
    
    const schemaType = Array.isArray(schema.type) ? schema.type[0] : schema.type
    
    switch (schemaType) {
      case 'string':
        return renderStringField(fieldId, fieldLabel, schema, value, path, required)
      
      case 'number':
      case 'integer':
        const hasRange = schema.format === 'range' || 
          (schema.minimum !== undefined && schema.maximum !== undefined)
        
        if (hasRange) {
          const stepVal = schemaType === 'integer' ? 1 : (schema.maximum! - schema.minimum!) / 100
          const currentVal = value ?? schema.default ?? schema.minimum ?? 0
          
          const rangeInput = input({
            type: 'range',
            id: fieldId,
            name: path,
            min: schema.minimum,
            max: schema.maximum,
            step: schemaType === 'integer' ? 1 : stepVal,
            required,
            'data-path': path,
            'data-type': schemaType,
          })
          rangeInput.value = String(currentVal)
          
          const numberInput = input({
            type: 'number',
            id: `${fieldId}-number`,
            min: schema.minimum,
            max: schema.maximum,
            step: schemaType === 'integer' ? 1 : 'any',
            class: 'schema-range-number',
            'aria-label': `${fieldLabel} value`,
          })
          numberInput.value = String(currentVal)
          
          rangeInput.addEventListener('input', () => {
            numberInput.value = rangeInput.value
          })
          
          numberInput.addEventListener('input', () => {
            let val = parseFloat(numberInput.value)
            if (!isNaN(val)) {
              if (schema.minimum !== undefined) val = Math.max(val, schema.minimum)
              if (schema.maximum !== undefined) val = Math.min(val, schema.maximum)
              rangeInput.value = String(val)
            }
          })
          
          return div(
            { class: 'schema-field schema-field-range' },
            label({ for: fieldId }, fieldLabel, required ? span({ class: 'required' }, ' *') : ''),
            schema.description ? div({ class: 'description' }, schema.description) : '',
            div({ class: 'schema-range-container' }, rangeInput, numberInput)
          )
        }
        
        return div(
          { class: 'schema-field' },
          label({ for: fieldId }, fieldLabel, required ? span({ class: 'required' }, ' *') : ''),
          schema.description ? div({ class: 'description' }, schema.description) : '',
          input({
            type: 'number',
            id: fieldId,
            name: path,
            value: value ?? schema.default ?? '',
            min: schema.minimum,
            max: schema.maximum,
            step: schemaType === 'integer' ? 1 : 'any',
            required,
            'data-path': path,
            'data-type': schemaType,
          })
        )
      
      case 'boolean':
        return div(
          { class: 'schema-field schema-field-boolean' },
          label(
            input({
              type: 'checkbox',
              id: fieldId,
              name: path,
              checked: value ?? schema.default ?? false,
              'data-path': path,
              'data-type': 'boolean',
            }),
            ' ',
            fieldLabel,
            required ? span({ class: 'required' }, ' *') : ''
          ),
          schema.description ? div({ class: 'description' }, schema.description) : ''
        )
      
      case 'object':
        return renderObjectField(key, schema, value || {}, path, required)
      
      case 'array':
        return renderArrayField(key, schema, value || [], path, required)
      
      default:
        return div(
          { class: 'schema-field' },
          label({ for: fieldId }, fieldLabel, required ? span({ class: 'required' }, ' *') : ''),
          schema.description ? div({ class: 'description' }, schema.description) : '',
          input({
            type: 'text',
            id: fieldId,
            name: path,
            value: value ?? schema.default ?? '',
            required,
            'data-path': path,
          })
        )
    }
  }

  // Render string field with format support
  const renderStringField = (
    fieldId: string,
    fieldLabel: string,
    schema: JSONSchema,
    value: any,
    path: string,
    required: boolean
  ): HTMLElement => {
    const formatToType: Record<string, string> = {
      email: 'email',
      uri: 'url',
      url: 'url',
      'date-time': 'datetime-local',
      date: 'date',
      time: 'time',
      password: 'password',
    }
    
    const inputType = schema.format ? formatToType[schema.format] || 'text' : 'text'
    const isTextarea = schema.maxLength && schema.maxLength > 200
    
    const inputAttrs: Record<string, any> = {
      id: fieldId,
      name: path,
      value: value ?? schema.default ?? '',
      required,
      'data-path': path,
      'data-type': 'string',
    }
    
    if (schema.minLength) inputAttrs.minLength = schema.minLength
    if (schema.maxLength) inputAttrs.maxLength = schema.maxLength
    if (schema.pattern) inputAttrs.pattern = schema.pattern
    if (schema.format === 'email') inputAttrs.placeholder = 'email@example.com'
    if (schema.format === 'url' || schema.format === 'uri') inputAttrs.placeholder = 'https://'
    
    return div(
      { class: 'schema-field' },
      label({ for: fieldId }, fieldLabel, required ? span({ class: 'required' }, ' *') : ''),
      schema.description ? div({ class: 'description' }, schema.description) : '',
      isTextarea
        ? textarea({ ...inputAttrs, rows: 4 }, value ?? schema.default ?? '')
        : input({ type: inputType, ...inputAttrs })
    )
  }

  // Render nested object
  const renderObjectField = (
    key: string,
    schema: JSONSchema,
    value: Record<string, any>,
    path: string,
    required: boolean
  ): HTMLElement => {
    const fieldLabel = getLabel(key, schema)
    const requiredFields = schema.required || []
    
    if (!schema.properties) {
      return div({ class: 'schema-field' }, `Object without properties: ${key}`)
    }
    
    return fieldset(
      { class: 'schema-object', 'data-path': path },
      legend(fieldLabel, required ? span({ class: 'required' }, ' *') : ''),
      schema.description ? div({ class: 'description' }, schema.description) : '',
      ...Object.entries(schema.properties).map(([propKey, propSchema]) =>
        renderField(propKey, propSchema, value[propKey], `${path}.${propKey}`, requiredFields.includes(propKey))
      )
    )
  }

  // Render array field
  const renderArrayField = (
    key: string,
    schema: JSONSchema,
    value: any[],
    path: string,
    required: boolean
  ): HTMLElement => {
    const fieldLabel = getLabel(key, schema)
    const itemSchema = schema.items || { type: 'string' }
    const itemVariants = getUnionVariants(itemSchema)
    
    const arrayContainer = div({ class: 'schema-array-items', 'data-path': path })
    
    value.forEach((item, index) => {
      if (itemVariants) {
        const variantIndex = detectVariant(item, itemVariants)
        arrayContainer.append(
          renderArrayItem(itemVariants[variantIndex], item, `${path}[${index}]`, index, variantIndex)
        )
      } else {
        arrayContainer.append(renderArrayItem(itemSchema, item, `${path}[${index}]`, index))
      }
    })
    
    let addControls: HTMLElement
    
    if (itemVariants) {
      const variantSelect = select(
        { class: 'schema-array-variant-select' },
        ...itemVariants.map((v, i) => option({ value: String(i) }, getVariantLabel(v, i)))
      )
      
      const addBtn = button(
        {
          type: 'button',
          class: 'schema-array-add',
          onClick: () => {
            const currentCount = arrayContainer.querySelectorAll(':scope > .schema-array-item').length
            if (schema.maxItems !== undefined && currentCount >= schema.maxItems) return
            
            const selectedVariantIndex = parseInt(variantSelect.value, 10)
            const selectedVariant = itemVariants[selectedVariantIndex]
            
            const newItem = renderArrayItem(
              selectedVariant,
              getDefaultValue(selectedVariant),
              `${path}[${currentCount}]`,
              currentCount,
              selectedVariantIndex
            )
            arrayContainer.append(newItem)
            reindexArrayItems(arrayContainer)
            arrayContainer.dispatchEvent(new CustomEvent('schema-change', { bubbles: true }))
          }
        },
        '+ Add'
      )
      
      addControls = div({ class: 'schema-array-add-controls' }, variantSelect, addBtn)
    } else {
      addControls = button(
        {
          type: 'button',
          class: 'schema-array-add',
          'data-path': path,
          onClick: () => {
            const currentCount = arrayContainer.querySelectorAll(':scope > .schema-array-item').length
            if (schema.maxItems !== undefined && currentCount >= schema.maxItems) return
            
            const newItem = renderArrayItem(
              itemSchema,
              getDefaultValue(itemSchema),
              `${path}[${currentCount}]`,
              currentCount
            )
            arrayContainer.append(newItem)
            reindexArrayItems(arrayContainer)
            arrayContainer.dispatchEvent(new CustomEvent('schema-change', { bubbles: true }))
          }
        },
        '+ Add Item'
      )
    }
    
    return fieldset(
      { class: 'schema-array', 'data-path': path },
      legend(fieldLabel, required ? span({ class: 'required' }, ' *') : ''),
      schema.description ? div({ class: 'description' }, schema.description) : '',
      arrayContainer,
      addControls,
      schema.minItems !== undefined || schema.maxItems !== undefined
        ? div(
            { class: 'array-constraints' },
            schema.minItems !== undefined ? `Min: ${schema.minItems}` : '',
            schema.minItems !== undefined && schema.maxItems !== undefined ? ' | ' : '',
            schema.maxItems !== undefined ? `Max: ${schema.maxItems}` : ''
          )
        : ''
    )
  }

  // Render a single array item with remove button
  const renderArrayItem = (
    schema: JSONSchema,
    value: any,
    path: string,
    index: number,
    variantIndex?: number
  ): HTMLElement => {
    const itemLabel = variantIndex !== undefined 
      ? getVariantLabel(schema, variantIndex)
      : `Item ${index + 1}`
    
    const itemContent = renderField(itemLabel, schema, value, path, false)
    
    const removeButton = button(
      {
        type: 'button',
        class: 'schema-array-remove',
        'aria-label': 'Remove item',
        onClick: (event: Event) => {
          const btn = event.target as HTMLElement
          const item = btn.closest('.schema-array-item') as HTMLElement
          const container = item.parentElement as HTMLElement
          item.remove()
          reindexArrayItems(container)
          container.dispatchEvent(new CustomEvent('schema-change', { bubbles: true }))
        }
      },
      '×'
    )
    
    const attrs: Record<string, any> = { class: 'schema-array-item', 'data-index': index }
    if (variantIndex !== undefined) {
      attrs['data-variant'] = variantIndex
    }
    
    return div(attrs, removeButton, itemContent)
  }

  // Reindex array items after add/remove
  const reindexArrayItems = (container: HTMLElement) => {
    const items = container.querySelectorAll(':scope > .schema-array-item')
    
    items.forEach((item, index: number) => {
      item.setAttribute('data-index', String(index))
      
      const pathElements = item.querySelectorAll('[data-path]')
      pathElements.forEach((el: Element) => {
        const currentPath = el.getAttribute('data-path') || ''
        const newPath = currentPath.replace(/\[\d+\]/, `[${index}]`)
        el.setAttribute('data-path', newPath)
        if (el.hasAttribute('name')) {
          el.setAttribute('name', newPath)
        }
      })
    })
  }

  // The component class
  class SchemaForm extends Component<SchemaFormParts> {
    private _schema: JSONSchema = {}
    private _data: any = {}

    get schema(): JSONSchema {
      return this._schema
    }

    set schema(s: JSONSchema) {
      this._schema = s
      this.queueRender()
    }

    get data(): any {
      return this._data
    }

    set data(d: any) {
      this._data = d
      this.queueRender()
    }

    getData(): any {
      const formEl = this.querySelector('form') as HTMLFormElement
      if (!formEl) return this.data
      return collectFormData(formEl, this._schema)
    }

    override render(): void {
      this.textContent = ''
      
      if (!this._schema.type && !this._schema.properties) {
        this.append(div({ class: 'schema-form-empty' }, 'No schema provided'))
        return
      }

      const rootRequired = this._schema.required || []

      const fields = this._schema.properties
        ? Object.entries(this._schema.properties).map(([key, propSchema]) =>
            renderField(key, propSchema, this.data?.[key], key, rootRequired.includes(key))
          )
        : [renderField('data', this._schema, this.data, 'data', false)]

      const formEl = form(
        {
          class: 'schema-form',
          onInput: () => {
            this.dispatchEvent(new CustomEvent('schema-input', {
              bubbles: true,
              detail: { data: this.getData() }
            }))
          },
          onSubmit: (event: Event) => {
            event.preventDefault()
            this.dispatchEvent(new CustomEvent('schema-submit', {
              bubbles: true,
              detail: { data: this.getData() }
            }))
          }
        },
        ...fields
      )
      
      this.append(formEl)
    }
  }

  return {
    type: SchemaForm,
    styleSpec: {
      ':host': {
        _sfSpacing: varDefault.spacing('8px'),
        _sfColor: varDefault.color('#222'),
        _sfBackground: varDefault.background('#fcfcfc'),
        _sfFontSize: varDefault.fontSize('16px'),
        _sfFontFamily: varDefault.fontFamily('system-ui, sans-serif'),
        _sfBrandColor: varDefault.brandColor('#0066cc'),
        _sfErrorColor: varDefault.errorColor('#cc0000'),
        _sfBorderColor: varDefault.borderColor('#ccc'),
        
        display: 'block',
        fontFamily: vars.sfFontFamily,
        fontSize: vars.sfFontSize,
        color: vars.sfColor,
      },
      '.schema-field': {
        marginBottom: vars.sfSpacing,
      },
      '.schema-field label': {
        display: 'block',
        marginBottom: vars.sfSpacing50,
        fontWeight: '500',
      },
      '.schema-field input, .schema-field select, .schema-field textarea': {
        width: '100%',
        padding: `${vars.sfSpacing75} ${vars.sfSpacing}`,
        border: `1px solid ${vars.sfBorderColor}`,
        borderRadius: vars.sfSpacing50,
        fontSize: 'inherit',
        fontFamily: 'inherit',
        color: 'inherit',
        background: vars.sfBackground,
        boxSizing: 'border-box',
      },
      '.schema-field input:focus, .schema-field select:focus, .schema-field textarea:focus': {
        outline: 'none',
        borderColor: vars.sfBrandColor,
        boxShadow: `0 0 0 2px ${vars.sfBrandColor}40`,
      },
      '.schema-field-boolean label': {
        display: 'flex',
        alignItems: 'center',
        gap: vars.sfSpacing50,
      },
      '.schema-field-boolean input[type="checkbox"]': {
        width: 'auto',
      },
      '.schema-range-container': {
        display: 'flex',
        alignItems: 'center',
        gap: vars.sfSpacing,
      },
      '.schema-range-container input[type="range"]': {
        flex: '1',
        minWidth: '0',
        height: vars.sfSpacing,
        cursor: 'pointer',
      },
      '.schema-range-number': {
        width: '5em',
        minWidth: '5em',
        maxWidth: '5em',
        flex: '0 0 5em',
        textAlign: 'center',
      },
      '.description': {
        fontSize: vars.sfFontSize85,
        opacity: '0.7',
        marginBottom: vars.sfSpacing50,
      },
      '.required': {
        color: vars.sfErrorColor,
      },
      '.schema-object, .schema-array': {
        border: `1px solid ${vars.sfBorderColor}`,
        borderRadius: vars.sfSpacing50,
        padding: vars.sfSpacing,
        marginBottom: vars.sfSpacing,
      },
      '.schema-object legend, .schema-array legend': {
        fontWeight: '600',
        padding: `0 ${vars.sfSpacing50}`,
      },
      '.schema-array-items': {
        display: 'flex',
        flexDirection: 'column',
        gap: vars.sfSpacing50,
      },
      '.schema-array-item': {
        position: 'relative',
        paddingRight: vars.sfSpacing250,
        paddingLeft: vars.sfSpacing50,
        borderLeft: `2px solid ${vars.sfBrandColor}`,
      },
      '.schema-array-remove': {
        position: 'absolute',
        top: '0',
        right: '0',
        width: vars.sfSpacing200,
        height: vars.sfSpacing200,
        padding: '0',
        border: 'none',
        background: vars.sfErrorColor,
        color: vars.sfBackground,
        borderRadius: '50%',
        cursor: 'pointer',
        fontSize: vars.sfFontSize,
        lineHeight: '1',
      },
      '.schema-array-remove:hover': {
        opacity: '0.8',
      },
      '.schema-array-add': {
        marginTop: vars.sfSpacing50,
        padding: `${vars.sfSpacing50} ${vars.sfSpacing}`,
        border: `1px dashed ${vars.sfBrandColor}`,
        background: 'transparent',
        color: vars.sfBrandColor,
        borderRadius: vars.sfSpacing50,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 'inherit',
      },
      '.schema-array-add:hover': {
        background: `${vars.sfBrandColor}10`,
      },
      '.schema-array-add-controls': {
        display: 'flex',
        gap: vars.sfSpacing50,
        marginTop: vars.sfSpacing50,
      },
      '.schema-array-variant-select': {
        flex: '1',
        padding: `${vars.sfSpacing50} ${vars.sfSpacing}`,
        border: `1px solid ${vars.sfBorderColor}`,
        borderRadius: vars.sfSpacing50,
        fontSize: 'inherit',
        fontFamily: 'inherit',
        background: vars.sfBackground,
      },
      '.schema-union': {
        border: `1px solid ${vars.sfBrandColor}`,
        borderRadius: vars.sfSpacing50,
        padding: vars.sfSpacing,
        marginBottom: vars.sfSpacing,
      },
      '.schema-union legend': {
        fontWeight: '600',
        padding: `0 ${vars.sfSpacing50}`,
        color: vars.sfBrandColor,
      },
      '.schema-union-selector-container': {
        marginBottom: vars.sfSpacing,
      },
      '.schema-union-selector': {
        width: '100%',
        padding: `${vars.sfSpacing50} ${vars.sfSpacing}`,
        border: `1px solid ${vars.sfBrandColor}`,
        borderRadius: vars.sfSpacing50,
        fontSize: 'inherit',
        fontFamily: 'inherit',
        background: vars.sfBackground,
        color: vars.sfBrandColor,
        fontWeight: '500',
      },
      '.schema-union-content': {
        paddingTop: vars.sfSpacing50,
      },
      '.schema-field-const': {
        display: 'flex',
        flexDirection: 'column',
      },
      '.schema-const-value': {
        padding: `${vars.sfSpacing75} ${vars.sfSpacing}`,
        background: `${vars.sfBrandColor}10`,
        border: `1px solid ${vars.sfBrandColor}40`,
        borderRadius: vars.sfSpacing50,
        color: vars.sfBrandColor,
        fontWeight: '500',
      },
      '.array-constraints': {
        fontSize: vars.sfFontSize85,
        opacity: '0.7',
        marginTop: vars.sfSpacing25,
      },
    },
  }
}

// Default export for <xin-blueprint property="default">
export default schemaFormBlueprint
