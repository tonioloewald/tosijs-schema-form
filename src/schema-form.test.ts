import { describe, test, expect, beforeAll } from 'bun:test'
import { schemaForm } from './schema-form'

// Wait for queueRender to flush
const nextTick = () => new Promise(resolve => setTimeout(resolve, 0))

describe('schema-form', () => {
  beforeAll(async () => {
    await schemaForm
  })

  test('renders empty state without schema', async () => {
    const form = document.createElement('schema-form') as any
    document.body.appendChild(form)
    await nextTick()
    
    expect(form.innerHTML).toContain('No schema provided')
    
    form.remove()
  })

  test('renders fields from simple schema', async () => {
    const form = document.createElement('schema-form') as any
    document.body.appendChild(form)
    
    form.schema = {
      type: 'object',
      properties: {
        name: { type: 'string', title: 'Name' },
        age: { type: 'integer', title: 'Age' }
      }
    }
    await nextTick()
    
    const nameInput = form.querySelector('input[name="name"]')
    const ageInput = form.querySelector('input[name="age"]')
    
    expect(nameInput).not.toBeNull()
    expect(ageInput).not.toBeNull()
    expect(ageInput.type).toBe('number')
    
    form.remove()
  })

  test('data in = data out for simple schema', async () => {
    const form = document.createElement('schema-form') as any
    document.body.appendChild(form)
    
    form.schema = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        age: { type: 'integer' }
      }
    }
    
    const testData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      age: 30
    }
    
    form.data = testData
    await nextTick()
    
    // Check inputs have values
    expect(form.querySelector('input[name="name"]').value).toBe('Jane Doe')
    expect(form.querySelector('input[name="email"]').value).toBe('jane@example.com')
    expect(form.querySelector('input[name="age"]').value).toBe('30')
    
    // Check getData returns same structure
    const output = form.getData()
    expect(output.name).toBe('Jane Doe')
    expect(output.email).toBe('jane@example.com')
    expect(output.age).toBe(30)
    
    form.remove()
  })

  test('handles boolean fields', async () => {
    const form = document.createElement('schema-form') as any
    document.body.appendChild(form)
    
    form.schema = {
      type: 'object',
      properties: {
        subscribe: { type: 'boolean', title: 'Subscribe' }
      }
    }
    
    form.data = { subscribe: true }
    await nextTick()
    
    const checkbox = form.querySelector('input[type="checkbox"]')
    expect(checkbox).not.toBeNull()
    expect(checkbox.checked).toBe(true)
    
    // Toggle it
    checkbox.checked = false
    
    const output = form.getData()
    expect(output.subscribe).toBe(false)
    
    form.remove()
  })

  test('handles enum fields as select', async () => {
    const form = document.createElement('schema-form') as any
    document.body.appendChild(form)
    
    form.schema = {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['draft', 'published', 'archived'] 
        }
      }
    }
    
    form.data = { status: 'published' }
    await nextTick()
    
    const select = form.querySelector('select[name="status"]')
    expect(select).not.toBeNull()
    expect(select.value).toBe('published')
    
    // Change it
    select.value = 'archived'
    
    const output = form.getData()
    expect(output.status).toBe('archived')
    
    form.remove()
  })

  test('handles nested objects', async () => {
    const form = document.createElement('schema-form') as any
    document.body.appendChild(form)
    
    form.schema = {
      type: 'object',
      properties: {
        author: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' }
          }
        }
      }
    }
    
    form.data = {
      author: {
        name: 'Alice',
        email: 'alice@example.com'
      }
    }
    await nextTick()
    
    expect(form.querySelector('input[name="author.name"]').value).toBe('Alice')
    expect(form.querySelector('input[name="author.email"]').value).toBe('alice@example.com')
    
    const output = form.getData()
    expect(output.author.name).toBe('Alice')
    expect(output.author.email).toBe('alice@example.com')
    
    form.remove()
  })

  test('handles arrays', async () => {
    const form = document.createElement('schema-form') as any
    document.body.appendChild(form)
    
    form.schema = {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
    
    form.data = {
      tags: ['javascript', 'typescript']
    }
    await nextTick()
    
    const tagInputs = form.querySelectorAll('.schema-array-item input')
    expect(tagInputs.length).toBe(2)
    expect(tagInputs[0].value).toBe('javascript')
    expect(tagInputs[1].value).toBe('typescript')
    
    const output = form.getData()
    expect(output.tags).toEqual(['javascript', 'typescript'])
    
    form.remove()
  })

  test('handles nested objects in arrays', async () => {
    const form = document.createElement('schema-form') as any
    document.body.appendChild(form)
    
    form.schema = {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              quantity: { type: 'integer' }
            }
          }
        }
      }
    }
    
    form.data = {
      items: [
        { name: 'Widget', quantity: 5 },
        { name: 'Gadget', quantity: 3 }
      ]
    }
    await nextTick()
    
    expect(form.querySelector('input[name="items[0].name"]').value).toBe('Widget')
    expect(form.querySelector('input[name="items[0].quantity"]').value).toBe('5')
    expect(form.querySelector('input[name="items[1].name"]').value).toBe('Gadget')
    expect(form.querySelector('input[name="items[1].quantity"]').value).toBe('3')
    
    const output = form.getData()
    expect(output.items[0].name).toBe('Widget')
    expect(output.items[0].quantity).toBe(5)
    expect(output.items[1].name).toBe('Gadget')
    expect(output.items[1].quantity).toBe(3)
    
    form.remove()
  })

  test('add button adds array items', async () => {
    const form = document.createElement('schema-form') as any
    document.body.appendChild(form)
    
    form.schema = {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
    
    form.data = { tags: ['one'] }
    await nextTick()
    
    expect(form.querySelectorAll('.schema-array-item').length).toBe(1)
    
    const addButton = form.querySelector('.schema-array-add')
    addButton.click()
    
    expect(form.querySelectorAll('.schema-array-item').length).toBe(2)
    
    form.remove()
  })

  test('remove button removes array items', async () => {
    const form = document.createElement('schema-form') as any
    document.body.appendChild(form)
    
    form.schema = {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
    
    form.data = { tags: ['one', 'two', 'three'] }
    await nextTick()
    
    expect(form.querySelectorAll('.schema-array-item').length).toBe(3)
    
    const removeButtons = form.querySelectorAll('.schema-array-remove')
    removeButtons[1].click() // Remove middle item
    
    expect(form.querySelectorAll('.schema-array-item').length).toBe(2)
    
    const output = form.getData()
    expect(output.tags).toEqual(['one', 'three'])
    
    form.remove()
  })

  test('respects required fields', async () => {
    const form = document.createElement('schema-form') as any
    document.body.appendChild(form)
    
    form.schema = {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string' },
        optional: { type: 'string' }
      }
    }
    await nextTick()
    
    const nameInput = form.querySelector('input[name="name"]')
    const optionalInput = form.querySelector('input[name="optional"]')
    
    expect(nameInput.required).toBe(true)
    expect(optionalInput.required).toBe(false)
    
    form.remove()
  })

  test('shows description text', async () => {
    const form = document.createElement('schema-form') as any
    document.body.appendChild(form)
    
    form.schema = {
      type: 'object',
      properties: {
        email: { 
          type: 'string', 
          description: 'Your email address' 
        }
      }
    }
    await nextTick()
    
    expect(form.innerHTML).toContain('Your email address')
    
    form.remove()
  })

  // Native validation tests
  describe('native validation', () => {
    test('applies minLength and maxLength constraints', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          username: { type: 'string', minLength: 3, maxLength: 20 }
        }
      }
      await nextTick()
      
      const input = form.querySelector('input[name="username"]')
      expect(input.minLength).toBe(3)
      expect(input.maxLength).toBe(20)
      
      form.remove()
    })

    test('applies min and max constraints for numbers (renders as range slider)', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          age: { type: 'integer', minimum: 0, maximum: 120 },
          price: { type: 'number', minimum: 0.01, maximum: 9999.99 }
        }
      }
      await nextTick()
      
      // When min and max are both defined, we render a range slider
      const ageInput = form.querySelector('input[name="age"]')
      const priceInput = form.querySelector('input[name="price"]')
      
      expect(ageInput.type).toBe('range')
      expect(ageInput.min).toBe('0')
      expect(ageInput.max).toBe('120')
      expect(ageInput.step).toBe('1')
      
      expect(priceInput.type).toBe('range')
      expect(priceInput.min).toBe('0.01')
      expect(priceInput.max).toBe('9999.99')
      
      // Companion number inputs exist for direct entry
      const ageNumberInput = form.querySelector('.schema-range-number')
      expect(ageNumberInput).not.toBeNull()
      
      form.remove()
    })

    test('unbounded numbers render as number input', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          count: { type: 'integer' },
          amount: { type: 'number', minimum: 0 } // only min, no max
        }
      }
      await nextTick()
      
      const countInput = form.querySelector('input[name="count"]')
      const amountInput = form.querySelector('input[name="amount"]')
      
      expect(countInput.type).toBe('number')
      expect(countInput.step).toBe('1')
      
      expect(amountInput.type).toBe('number')
      expect(amountInput.min).toBe('0')
      expect(amountInput.step).toBe('any')
      
      form.remove()
    })

    test('applies pattern constraint', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          zipCode: { type: 'string', pattern: '^[0-9]{5}$' }
        }
      }
      await nextTick()
      
      const input = form.querySelector('input[name="zipCode"]')
      expect(input.pattern).toBe('^[0-9]{5}$')
      
      form.remove()
    })

    test('uses correct input types for formats', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          website: { type: 'string', format: 'uri' },
          birthDate: { type: 'string', format: 'date' },
          meetingTime: { type: 'string', format: 'time' },
          secret: { type: 'string', format: 'password' }
        }
      }
      await nextTick()
      
      expect(form.querySelector('input[name="email"]').type).toBe('email')
      expect(form.querySelector('input[name="website"]').type).toBe('url')
      expect(form.querySelector('input[name="birthDate"]').type).toBe('date')
      expect(form.querySelector('input[name="meetingTime"]').type).toBe('time')
      expect(form.querySelector('input[name="secret"]').type).toBe('password')
      
      form.remove()
    })

    test('checkValidity returns false for invalid required field', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string' }
        }
      }
      await nextTick()
      
      const formEl = form.querySelector('form')
      const nameInput = form.querySelector('input[name="name"]')
      
      // Empty required field should be invalid
      expect(nameInput.validity.valueMissing).toBe(true)
      expect(formEl.checkValidity()).toBe(false)
      
      // Fill it in
      nameInput.value = 'John'
      expect(formEl.checkValidity()).toBe(true)
      
      form.remove()
    })
  })

  // Complex data round-trip tests
  describe('complex data round-trip', () => {
    test('deeply nested objects preserve structure', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          company: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              address: {
                type: 'object',
                properties: {
                  street: { type: 'string' },
                  city: { type: 'string' },
                  country: { type: 'string' }
                }
              }
            }
          }
        }
      }
      
      const testData = {
        company: {
          name: 'Acme Corp',
          address: {
            street: '123 Main St',
            city: 'Springfield',
            country: 'USA'
          }
        }
      }
      
      form.data = testData
      await nextTick()
      
      const output = form.getData()
      expect(output).toEqual(testData)
      
      form.remove()
    })

    test('arrays of objects with nested arrays', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          orders: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                total: { type: 'number' },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      sku: { type: 'string' },
                      qty: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      const testData = {
        orders: [
          {
            id: 'ORD-001',
            total: 99.99,
            items: [
              { sku: 'WIDGET-A', qty: 2 },
              { sku: 'GADGET-B', qty: 1 }
            ]
          }
        ]
      }
      
      form.data = testData
      await nextTick()
      
      const output = form.getData()
      expect(output).toEqual(testData)
      
      form.remove()
    })

    test('mixed types preserve correct type coercion', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' },
          score: { type: 'number' },
          active: { type: 'boolean' },
          status: { type: 'string', enum: ['pending', 'approved', 'rejected'] }
        }
      }
      
      const testData = {
        name: 'Test User',
        age: 25,
        score: 95.5,
        active: true,
        status: 'approved'
      }
      
      form.data = testData
      await nextTick()
      
      const output = form.getData()
      
      // Verify types are preserved
      expect(typeof output.name).toBe('string')
      expect(typeof output.age).toBe('number')
      expect(Number.isInteger(output.age)).toBe(true)
      expect(typeof output.score).toBe('number')
      expect(typeof output.active).toBe('boolean')
      expect(typeof output.status).toBe('string')
      
      expect(output).toEqual(testData)
      
      form.remove()
    })
  })

  // UI modification tests
  describe('UI modifications flow through', () => {
    test('text input changes are reflected in getData', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      }
      form.data = { name: 'Original' }
      await nextTick()
      
      const input = form.querySelector('input[name="name"]')
      input.value = 'Modified'
      
      expect(form.getData().name).toBe('Modified')
      
      form.remove()
    })

    test('number input changes preserve numeric type', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          quantity: { type: 'integer' },
          price: { type: 'number' }
        }
      }
      form.data = { quantity: 1, price: 10.00 }
      await nextTick()
      
      form.querySelector('input[name="quantity"]').value = '42'
      form.querySelector('input[name="price"]').value = '19.99'
      
      const output = form.getData()
      expect(output.quantity).toBe(42)
      expect(typeof output.quantity).toBe('number')
      expect(output.price).toBe(19.99)
      expect(typeof output.price).toBe('number')
      
      form.remove()
    })

    test('checkbox toggle changes boolean value', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' }
        }
      }
      form.data = { enabled: false }
      await nextTick()
      
      const checkbox = form.querySelector('input[type="checkbox"]')
      expect(form.getData().enabled).toBe(false)
      
      checkbox.checked = true
      expect(form.getData().enabled).toBe(true)
      
      checkbox.checked = false
      expect(form.getData().enabled).toBe(false)
      
      form.remove()
    })

    test('select change updates enum value', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] }
        }
      }
      form.data = { priority: 'low' }
      await nextTick()
      
      const select = form.querySelector('select[name="priority"]')
      
      select.value = 'high'
      expect(form.getData().priority).toBe('high')
      
      select.value = 'critical'
      expect(form.getData().priority).toBe('critical')
      
      form.remove()
    })

    test('nested object field modifications', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          profile: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              settings: {
                type: 'object',
                properties: {
                  theme: { type: 'string', enum: ['light', 'dark'] },
                  notifications: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
      
      form.data = {
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          settings: {
            theme: 'light',
            notifications: true
          }
        }
      }
      await nextTick()
      
      // Modify nested fields
      form.querySelector('input[name="profile.firstName"]').value = 'Jane'
      form.querySelector('select[name="profile.settings.theme"]').value = 'dark'
      form.querySelector('input[name="profile.settings.notifications"]').checked = false
      
      const output = form.getData()
      expect(output.profile.firstName).toBe('Jane')
      expect(output.profile.lastName).toBe('Doe') // unchanged
      expect(output.profile.settings.theme).toBe('dark')
      expect(output.profile.settings.notifications).toBe(false)
      
      form.remove()
    })

    test('array item modifications', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
      form.data = { tags: ['alpha', 'beta', 'gamma'] }
      await nextTick()
      
      // Modify middle item
      form.querySelector('input[name="tags[1]"]').value = 'MODIFIED'
      
      const output = form.getData()
      expect(output.tags).toEqual(['alpha', 'MODIFIED', 'gamma'])
      
      form.remove()
    })

    test('array of objects modifications', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          people: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'integer' }
              }
            }
          }
        }
      }
      form.data = {
        people: [
          { name: 'Alice', age: 30 },
          { name: 'Bob', age: 25 }
        ]
      }
      await nextTick()
      
      // Modify Bob's age
      form.querySelector('input[name="people[1].age"]').value = '26'
      // Modify Alice's name
      form.querySelector('input[name="people[0].name"]').value = 'Alicia'
      
      const output = form.getData()
      expect(output.people[0].name).toBe('Alicia')
      expect(output.people[0].age).toBe(30)
      expect(output.people[1].name).toBe('Bob')
      expect(output.people[1].age).toBe(26)
      
      form.remove()
    })

    test('adding array items and modifying them', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                quantity: { type: 'integer' }
              }
            }
          }
        }
      }
      form.data = { items: [] }
      await nextTick()
      
      // Add first item
      form.querySelector('.schema-array-add').click()
      await nextTick()
      
      // Fill in the new item
      form.querySelector('input[name="items[0].name"]').value = 'New Item'
      form.querySelector('input[name="items[0].quantity"]').value = '5'
      
      let output = form.getData()
      expect(output.items.length).toBe(1)
      expect(output.items[0].name).toBe('New Item')
      expect(output.items[0].quantity).toBe(5)
      
      // Add second item
      form.querySelector('.schema-array-add').click()
      await nextTick()
      
      form.querySelector('input[name="items[1].name"]').value = 'Second Item'
      form.querySelector('input[name="items[1].quantity"]').value = '10'
      
      output = form.getData()
      expect(output.items.length).toBe(2)
      expect(output.items[1].name).toBe('Second Item')
      expect(output.items[1].quantity).toBe(10)
      
      form.remove()
    })

    test('removing array items reindexes correctly', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          list: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
      form.data = { list: ['A', 'B', 'C', 'D'] }
      await nextTick()
      
      // Remove item at index 1 (B)
      form.querySelectorAll('.schema-array-remove')[1].click()
      await nextTick()
      
      let output = form.getData()
      expect(output.list).toEqual(['A', 'C', 'D'])
      
      // Now modify what was C (now at index 1)
      form.querySelector('input[name="list[1]"]').value = 'MODIFIED-C'
      
      output = form.getData()
      expect(output.list).toEqual(['A', 'MODIFIED-C', 'D'])
      
      form.remove()
    })
  })

  // Union type tests
  describe('union types (anyOf/oneOf)', () => {
    test('const-only anyOf renders as select', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          status: {
            anyOf: [
              { const: 'active', title: 'Active' },
              { const: 'inactive', title: 'Inactive' },
              { const: 'pending', title: 'Pending' }
            ]
          }
        }
      }
      form.data = { status: 'inactive' }
      await nextTick()
      
      const select = form.querySelector('select[name="status"]')
      expect(select).not.toBeNull()
      expect(select.value).toBe('inactive')
      
      // Change via UI
      select.value = 'active'
      expect(form.getData().status).toBe('active')
      
      form.remove()
    })

    test('complex anyOf renders variant selector', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          contact: {
            anyOf: [
              {
                type: 'object',
                title: 'Email',
                properties: {
                  email: { type: 'string', format: 'email' }
                }
              },
              {
                type: 'object',
                title: 'Phone',
                properties: {
                  phone: { type: 'string' },
                  extension: { type: 'string' }
                }
              }
            ]
          }
        }
      }
      form.data = { contact: { email: 'test@example.com' } }
      await nextTick()
      
      // Should have a union selector
      const unionSelector = form.querySelector('.schema-union-selector')
      expect(unionSelector).not.toBeNull()
      
      // Should detect email variant and render email field
      const emailInput = form.querySelector('input[name="contact.email"]')
      expect(emailInput).not.toBeNull()
      expect(emailInput.value).toBe('test@example.com')
      
      form.remove()
    })

    test('oneOf works the same as anyOf', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          value: {
            oneOf: [
              { type: 'string', title: 'Text' },
              { type: 'number', title: 'Number' }
            ]
          }
        }
      }
      form.data = { value: 'hello' }
      await nextTick()
      
      const unionSelector = form.querySelector('.schema-union-selector')
      expect(unionSelector).not.toBeNull()
      expect(unionSelector.value).toBe('0') // First variant (string)
      
      form.remove()
    })

    test('array with union items shows variant picker', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          blocks: {
            type: 'array',
            items: {
              anyOf: [
                {
                  type: 'object',
                  title: 'Text Block',
                  properties: {
                    kind: { type: 'string', const: 'text' },
                    content: { type: 'string' }
                  }
                },
                {
                  type: 'object',
                  title: 'Image Block',
                  properties: {
                    kind: { type: 'string', const: 'image' },
                    url: { type: 'string', format: 'uri' }
                  }
                }
              ]
            }
          }
        }
      }
      form.data = {
        blocks: [
          { kind: 'text', content: 'Hello world' }
        ]
      }
      await nextTick()
      
      // Should have variant selector for adding new items
      const variantSelect = form.querySelector('.schema-array-variant-select')
      expect(variantSelect).not.toBeNull()
      
      // Should have both options
      const options = variantSelect.querySelectorAll('option')
      expect(options.length).toBe(2)
      
      // Existing item should render correctly
      const contentInput = form.querySelector('input[name="blocks[0].content"]')
      expect(contentInput).not.toBeNull()
      expect(contentInput.value).toBe('Hello world')
      
      form.remove()
    })

    test('variant detection works with discriminator properties', async () => {
      const form = document.createElement('schema-form') as any
      document.body.appendChild(form)
      
      form.schema = {
        type: 'object',
        properties: {
          item: {
            anyOf: [
              {
                type: 'object',
                title: 'Product',
                properties: {
                  type: { type: 'string', const: 'product' },
                  name: { type: 'string' },
                  price: { type: 'number' }
                }
              },
              {
                type: 'object',
                title: 'Service',
                properties: {
                  type: { type: 'string', const: 'service' },
                  name: { type: 'string' },
                  hourlyRate: { type: 'number' }
                }
              }
            ]
          }
        }
      }
      form.data = {
        item: { type: 'service', name: 'Consulting', hourlyRate: 150 }
      }
      await nextTick()
      
      // Should detect service variant (index 1)
      const unionSelector = form.querySelector('.schema-union-selector')
      expect(unionSelector.value).toBe('1')
      
      // Should render service fields
      const hourlyRateInput = form.querySelector('input[name="item.hourlyRate"]')
      expect(hourlyRateInput).not.toBeNull()
      
      form.remove()
    })
  })
})
