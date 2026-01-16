import type { JSONSchema } from './schema-form'

// Simple: Contact form
export const contactSchema: JSONSchema = {
  type: 'object',
  title: 'Contact Form',
  required: ['name', 'email', 'message'],
  properties: {
    name: {
      type: 'string',
      title: 'Your Name',
      minLength: 1,
      maxLength: 100
    },
    email: {
      type: 'string',
      title: 'Email Address',
      format: 'email'
    },
    phone: {
      type: 'string',
      title: 'Phone Number',
      description: 'Optional contact number'
    },
    subject: {
      type: 'string',
      title: 'Subject',
      enum: ['General Inquiry', 'Support', 'Sales', 'Feedback']
    },
    message: {
      type: 'string',
      title: 'Message',
      description: 'Tell us what you need',
      minLength: 10,
      maxLength: 2000
    },
    subscribe: {
      type: 'boolean',
      title: 'Subscribe to newsletter',
      default: false
    }
  }
}

// Moderate: Blog post with author and tags
export const blogPostSchema: JSONSchema = {
  type: 'object',
  title: 'Blog Post',
  required: ['title', 'content', 'author', 'status'],
  properties: {
    title: {
      type: 'string',
      title: 'Post Title',
      minLength: 5,
      maxLength: 200
    },
    slug: {
      type: 'string',
      title: 'URL Slug',
      pattern: '^[a-z0-9-]+$',
      description: 'URL-friendly identifier (lowercase, hyphens only)'
    },
    content: {
      type: 'string',
      title: 'Content',
      description: 'Main post content (markdown supported)',
      maxLength: 50000
    },
    excerpt: {
      type: 'string',
      title: 'Excerpt',
      description: 'Short summary for previews',
      maxLength: 300
    },
    status: {
      type: 'string',
      title: 'Status',
      enum: ['draft', 'review', 'published', 'archived']
    },
    publishDate: {
      type: 'string',
      title: 'Publish Date',
      format: 'date'
    },
    author: {
      type: 'object',
      title: 'Author',
      required: ['name', 'email'],
      properties: {
        name: {
          type: 'string',
          title: 'Name'
        },
        email: {
          type: 'string',
          title: 'Email',
          format: 'email'
        },
        bio: {
          type: 'string',
          title: 'Short Bio',
          maxLength: 500
        },
        website: {
          type: 'string',
          title: 'Website',
          format: 'url'
        }
      }
    },
    tags: {
      type: 'array',
      title: 'Tags',
      description: 'Categorization tags',
      minItems: 1,
      maxItems: 10,
      items: {
        type: 'string',
        title: 'Tag'
      }
    },
    featured: {
      type: 'boolean',
      title: 'Featured Post',
      default: false
    },
    allowComments: {
      type: 'boolean',
      title: 'Allow Comments',
      default: true
    }
  }
}

// Nasty: E-commerce order with nested products, variants, shipping, and payment
export const orderSchema: JSONSchema = {
  type: 'object',
  title: 'Order',
  description: 'E-commerce order with full complexity',
  required: ['customer', 'items', 'shipping', 'payment'],
  properties: {
    orderNumber: {
      type: 'string',
      title: 'Order Number',
      pattern: '^ORD-[0-9]{8}$',
      description: 'Format: ORD-12345678'
    },
    status: {
      type: 'string',
      title: 'Order Status',
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']
    },
    priority: {
      type: 'string',
      title: 'Priority',
      anyOf: [
        { const: 'low', title: 'Low Priority' },
        { const: 'normal', title: 'Normal Priority' },
        { const: 'high', title: 'High Priority' },
        { const: 'urgent', title: 'Urgent' }
      ]
    },
    customer: {
      type: 'object',
      title: 'Customer Information',
      required: ['firstName', 'lastName', 'email'],
      properties: {
        firstName: {
          type: 'string',
          title: 'First Name',
          minLength: 1
        },
        lastName: {
          type: 'string',
          title: 'Last Name',
          minLength: 1
        },
        email: {
          type: 'string',
          title: 'Email',
          format: 'email'
        },
        phone: {
          type: 'string',
          title: 'Phone'
        },
        company: {
          type: 'string',
          title: 'Company',
          description: 'Optional company name for B2B orders'
        },
        taxId: {
          type: 'string',
          title: 'Tax ID / VAT Number'
        },
        notes: {
          type: 'string',
          title: 'Customer Notes',
          maxLength: 1000
        }
      }
    },
    items: {
      type: 'array',
      title: 'Order Items',
      minItems: 1,
      maxItems: 50,
      items: {
        type: 'object',
        title: 'Line Item',
        required: ['productName', 'sku', 'quantity', 'unitPrice'],
        properties: {
          productName: {
            type: 'string',
            title: 'Product Name'
          },
          sku: {
            type: 'string',
            title: 'SKU',
            pattern: '^[A-Z0-9-]+$'
          },
          quantity: {
            type: 'integer',
            title: 'Quantity',
            minimum: 1,
            maximum: 999
          },
          unitPrice: {
            type: 'number',
            title: 'Unit Price',
            minimum: 0
          },
          discount: {
            type: 'number',
            title: 'Discount %',
            minimum: 0,
            maximum: 100
          },
          variants: {
            type: 'array',
            title: 'Variant Options',
            items: {
              type: 'object',
              title: 'Variant',
              required: ['name', 'value'],
              properties: {
                name: {
                  type: 'string',
                  title: 'Option Name',
                  enum: ['Size', 'Color', 'Material', 'Style']
                },
                value: {
                  type: 'string',
                  title: 'Option Value'
                },
                priceModifier: {
                  type: 'number',
                  title: 'Price Adjustment',
                  description: 'Additional cost for this option'
                }
              }
            }
          },
          customizations: {
            type: 'object',
            title: 'Customizations',
            properties: {
              engraving: {
                type: 'string',
                title: 'Engraving Text',
                maxLength: 50
              },
              giftWrap: {
                type: 'boolean',
                title: 'Gift Wrap'
              },
              giftMessage: {
                type: 'string',
                title: 'Gift Message',
                maxLength: 200
              }
            }
          }
        }
      }
    },
    shipping: {
      type: 'object',
      title: 'Shipping Information',
      required: ['address', 'method'],
      properties: {
        address: {
          type: 'object',
          title: 'Shipping Address',
          required: ['line1', 'city', 'country', 'postalCode'],
          properties: {
            line1: {
              type: 'string',
              title: 'Address Line 1'
            },
            line2: {
              type: 'string',
              title: 'Address Line 2'
            },
            city: {
              type: 'string',
              title: 'City'
            },
            state: {
              type: 'string',
              title: 'State / Province'
            },
            country: {
              type: 'string',
              title: 'Country',
              enum: ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia', 'Japan', 'Other']
            },
            postalCode: {
              type: 'string',
              title: 'Postal Code'
            }
          }
        },
        method: {
          type: 'string',
          title: 'Shipping Method',
          enum: ['standard', 'express', 'overnight', 'pickup']
        },
        instructions: {
          type: 'string',
          title: 'Delivery Instructions',
          description: 'Special instructions for delivery',
          maxLength: 500
        },
        signature: {
          type: 'boolean',
          title: 'Require Signature',
          default: false
        },
        insurance: {
          type: 'boolean',
          title: 'Add Shipping Insurance',
          default: false
        }
      }
    },
    billing: {
      type: 'object',
      title: 'Billing Address',
      description: 'Leave empty if same as shipping',
      properties: {
        sameAsShipping: {
          type: 'boolean',
          title: 'Same as Shipping Address',
          default: true
        },
        address: {
          type: 'object',
          title: 'Billing Address',
          properties: {
            line1: {
              type: 'string',
              title: 'Address Line 1'
            },
            line2: {
              type: 'string',
              title: 'Address Line 2'
            },
            city: {
              type: 'string',
              title: 'City'
            },
            state: {
              type: 'string',
              title: 'State / Province'
            },
            country: {
              type: 'string',
              title: 'Country'
            },
            postalCode: {
              type: 'string',
              title: 'Postal Code'
            }
          }
        }
      }
    },
    payment: {
      type: 'object',
      title: 'Payment Information',
      required: ['method'],
      properties: {
        method: {
          type: 'string',
          title: 'Payment Method',
          enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto', 'invoice']
        },
        cardLast4: {
          type: 'string',
          title: 'Card Last 4 Digits',
          pattern: '^[0-9]{4}$'
        },
        subtotal: {
          type: 'number',
          title: 'Subtotal',
          minimum: 0
        },
        tax: {
          type: 'number',
          title: 'Tax',
          minimum: 0
        },
        shippingCost: {
          type: 'number',
          title: 'Shipping Cost',
          minimum: 0
        },
        discount: {
          type: 'number',
          title: 'Total Discount',
          minimum: 0
        },
        total: {
          type: 'number',
          title: 'Order Total',
          minimum: 0
        }
      }
    },
    coupons: {
      type: 'array',
      title: 'Applied Coupons',
      items: {
        type: 'object',
        title: 'Coupon',
        required: ['code'],
        properties: {
          code: {
            type: 'string',
            title: 'Coupon Code',
            pattern: '^[A-Z0-9]+$'
          },
          discountType: {
            type: 'string',
            title: 'Discount Type',
            enum: ['percentage', 'fixed', 'free_shipping']
          },
          value: {
            type: 'number',
            title: 'Discount Value'
          }
        }
      }
    },
    metadata: {
      type: 'object',
      title: 'Order Metadata',
      properties: {
        source: {
          type: 'string',
          title: 'Order Source',
          enum: ['web', 'mobile_app', 'phone', 'in_store', 'marketplace']
        },
        affiliateCode: {
          type: 'string',
          title: 'Affiliate Code'
        },
        marketingConsent: {
          type: 'boolean',
          title: 'Marketing Consent',
          description: 'Customer agreed to receive marketing emails'
        },
        internalNotes: {
          type: 'string',
          title: 'Internal Notes',
          description: 'Staff-only notes',
          maxLength: 2000
        }
      }
    }
  }
}

// Content Builder - showcases union types with array variant picker
export const contentBuilderSchema: JSONSchema = {
  type: 'object',
  title: 'Content Builder',
  description: 'Build a page with mixed content blocks',
  properties: {
    title: {
      type: 'string',
      title: 'Page Title',
      minLength: 1,
      maxLength: 100
    },
    slug: {
      type: 'string',
      title: 'URL Slug',
      pattern: '^[a-z0-9-]+$'
    },
    published: {
      type: 'boolean',
      title: 'Published',
      default: false
    },
    seoScore: {
      type: 'integer',
      title: 'SEO Score',
      description: 'Calculated SEO score (0-100)',
      minimum: 0,
      maximum: 100
    },
    readingTime: {
      type: 'number',
      title: 'Estimated Reading Time (minutes)',
      minimum: 0.5,
      maximum: 60
    },
    blocks: {
      type: 'array',
      title: 'Content Blocks',
      description: 'Add different types of content blocks',
      items: {
        anyOf: [
          {
            type: 'object',
            title: 'Text Block',
            properties: {
              blockType: { type: 'string', const: 'text' },
              heading: { type: 'string', title: 'Heading' },
              content: { type: 'string', title: 'Content', maxLength: 5000 },
              alignment: { 
                type: 'string', 
                title: 'Alignment',
                enum: ['left', 'center', 'right', 'justify']
              }
            }
          },
          {
            type: 'object',
            title: 'Image Block',
            properties: {
              blockType: { type: 'string', const: 'image' },
              url: { type: 'string', title: 'Image URL', format: 'uri' },
              alt: { type: 'string', title: 'Alt Text' },
              caption: { type: 'string', title: 'Caption' },
              width: { type: 'integer', title: 'Width %', minimum: 10, maximum: 100 }
            }
          },
          {
            type: 'object',
            title: 'Video Block',
            properties: {
              blockType: { type: 'string', const: 'video' },
              platform: {
                type: 'string',
                title: 'Platform',
                enum: ['youtube', 'vimeo', 'custom']
              },
              videoId: { type: 'string', title: 'Video ID' },
              autoplay: { type: 'boolean', title: 'Autoplay', default: false }
            }
          },
          {
            type: 'object',
            title: 'Code Block',
            properties: {
              blockType: { type: 'string', const: 'code' },
              language: {
                type: 'string',
                title: 'Language',
                enum: ['javascript', 'typescript', 'python', 'rust', 'go', 'html', 'css', 'json', 'other']
              },
              code: { type: 'string', title: 'Code' },
              showLineNumbers: { type: 'boolean', title: 'Show Line Numbers', default: true }
            }
          },
          {
            type: 'object',
            title: 'Quote Block',
            properties: {
              blockType: { type: 'string', const: 'quote' },
              text: { type: 'string', title: 'Quote Text' },
              author: { type: 'string', title: 'Author' },
              source: { type: 'string', title: 'Source' }
            }
          }
        ]
      }
    },
    settings: {
      type: 'object',
      title: 'Page Settings',
      properties: {
        template: {
          anyOf: [
            { const: 'default', title: 'Default Template' },
            { const: 'full-width', title: 'Full Width' },
            { const: 'sidebar-left', title: 'Sidebar Left' },
            { const: 'sidebar-right', title: 'Sidebar Right' },
            { const: 'landing', title: 'Landing Page' }
          ]
        },
        headerStyle: {
          oneOf: [
            {
              type: 'object',
              title: 'Simple Header',
              properties: {
                style: { type: 'string', const: 'simple' },
                showTitle: { type: 'boolean', title: 'Show Title', default: true }
              }
            },
            {
              type: 'object',
              title: 'Hero Header',
              properties: {
                style: { type: 'string', const: 'hero' },
                backgroundImage: { type: 'string', title: 'Background Image URL', format: 'uri' },
                overlayOpacity: { type: 'integer', title: 'Overlay Opacity %', minimum: 0, maximum: 100 },
                height: { type: 'integer', title: 'Height (px)', minimum: 200, maximum: 800 }
              }
            }
          ]
        }
      }
    }
  }
}

export const contentBuilderSampleData = {
  title: 'Getting Started Guide',
  slug: 'getting-started',
  published: true,
  seoScore: 78,
  readingTime: 5.5,
  blocks: [
    {
      blockType: 'text',
      heading: 'Welcome',
      content: 'This is an introduction to our platform...',
      alignment: 'left'
    },
    {
      blockType: 'image',
      url: 'https://example.com/hero.jpg',
      alt: 'Platform dashboard screenshot',
      caption: 'The main dashboard view',
      width: 100
    },
    {
      blockType: 'code',
      language: 'javascript',
      code: 'const hello = "world";\nconsole.log(hello);',
      showLineNumbers: true
    }
  ],
  settings: {
    template: 'default',
    headerStyle: {
      style: 'hero',
      backgroundImage: 'https://example.com/header-bg.jpg',
      overlayOpacity: 40,
      height: 400
    }
  }
}

// Sample data for each schema
export const contactSampleData = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  phone: '+1 555-1234',
  subject: 'Support',
  message: 'I need help with my recent order. The tracking number shows delivered but I haven\'t received it.',
  subscribe: true
}

export const blogPostSampleData = {
  title: 'Getting Started with Web Components',
  slug: 'getting-started-web-components',
  content: '# Introduction\n\nWeb Components are a set of standardized APIs...',
  excerpt: 'Learn how to build reusable UI components using native web standards.',
  status: 'draft',
  publishDate: '2025-01-20',
  author: {
    name: 'Alex Chen',
    email: 'alex@techblog.example.com',
    bio: 'Senior frontend developer passionate about web standards.',
    website: 'https://alexchen.dev'
  },
  tags: ['javascript', 'web-components', 'tutorial'],
  featured: false,
  allowComments: true
}

export const orderSampleData = {
  orderNumber: 'ORD-20250116',
  status: 'confirmed',
  priority: 'normal',
  customer: {
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@example.com',
    phone: '+1 555-9876',
    company: 'Brown Industries',
    taxId: 'US123456789',
    notes: 'Preferred customer - handle with care'
  },
  items: [
    {
      productName: 'Wireless Keyboard',
      sku: 'KB-2000-BLK',
      quantity: 2,
      unitPrice: 79.99,
      discount: 10,
      variants: [
        { name: 'Color', value: 'Black', priceModifier: 0 },
        { name: 'Style', value: 'Ergonomic', priceModifier: 15 }
      ],
      customizations: {
        engraving: '',
        giftWrap: false,
        giftMessage: ''
      }
    },
    {
      productName: 'USB-C Hub',
      sku: 'HUB-7PORT',
      quantity: 1,
      unitPrice: 49.99,
      discount: 0,
      variants: [
        { name: 'Color', value: 'Silver', priceModifier: 5 }
      ],
      customizations: {
        engraving: 'For Dad',
        giftWrap: true,
        giftMessage: 'Happy Birthday!'
      }
    }
  ],
  shipping: {
    address: {
      line1: '456 Oak Avenue',
      line2: 'Suite 200',
      city: 'Austin',
      state: 'Texas',
      country: 'USA',
      postalCode: '78701'
    },
    method: 'express',
    instructions: 'Leave at front desk if no answer',
    signature: true,
    insurance: false
  },
  billing: {
    sameAsShipping: true,
    address: {}
  },
  payment: {
    method: 'credit_card',
    cardLast4: '4242',
    subtotal: 259.97,
    tax: 21.45,
    shippingCost: 12.99,
    discount: 16.00,
    total: 278.41
  },
  coupons: [
    {
      code: 'SAVE10',
      discountType: 'percentage',
      value: 10
    }
  ],
  metadata: {
    source: 'web',
    affiliateCode: 'PARTNER123',
    marketingConsent: true,
    internalNotes: 'VIP customer - prioritize fulfillment'
  }
}
