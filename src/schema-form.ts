// Schema Form Component
// Pre-built component that uses the blueprint with bundled tosijs

import { makeComponent } from 'tosijs'
import { schemaFormBlueprint, type JSONSchema, type SchemaFormParts } from './blueprint'

// Re-export types for consumers
export type { JSONSchema, SchemaFormParts }

// Re-export blueprint for advanced usage
export { schemaFormBlueprint }

/**
 * Schema Form Component
 * 
 * A web component that generates forms from JSON Schema.
 * 
 * @example
 * import { schemaForm } from 'tosijs-schema-form'
 * 
 * await schemaForm
 * 
 * const form = document.querySelector('schema-form')
 * form.schema = { type: 'object', properties: { name: { type: 'string' } } }
 * form.data = { name: 'Jane' }
 * 
 * const data = form.getData()
 */
export const schemaForm = makeComponent('schema-form', schemaFormBlueprint)
