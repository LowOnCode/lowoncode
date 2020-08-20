module.exports = {
  definitions: {},
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'http://example.com/root.json',
  type: 'object',
  title: 'The Root Schema',
  properties: {
    title: {
      $id: '#/properties/title',
      type: 'string',
      title: 'The Title Schema',
      default: '',
      examples: [
        'monitor'
      ],
      pattern: '^(.*)$'
    },
    description: {
      $id: '#/properties/description',
      type: 'string',
      title: 'The Description Schema',
      default: '',
      examples: [
        'Core monitor service'
      ],
      pattern: '^(.*)$'
    },
    version: {
      $id: '#/properties/version',
      type: 'string',
      title: 'The Version Schema',
      default: '',
      examples: [
        '0.0.1'
      ],
      pattern: '^(.*)$'
    },
    author: {
      $id: '#/properties/author',
      type: 'string',
      title: 'The Author Schema',
      default: '',
      examples: [
        'LowOnCode Team'
      ],
      pattern: '^(.*)$'
    },
    nodes: {
      $id: '#/properties/nodes',
      type: 'array',
      title: 'The Nodes Schema',
      items: {
        $id: '#/properties/nodes/items',
        type: 'object',
        title: 'The Items Schema',
        properties: {
          color: {
            $id: '#/properties/nodes/items/properties/color',
            type: 'string',
            title: 'The Color Schema',
            default: '',
            examples: [
              'red'
            ],
            pattern: '^(.*)$'
          },
          name: {
            $id: '#/properties/nodes/items/properties/name',
            type: 'string',
            title: 'The Name Schema',
            default: '',
            examples: [
              'GET /hello'
            ],
            pattern: '^(.*)$'
          },
          state: {
            $id: '#/properties/nodes/items/properties/state',
            type: 'object',
            title: 'The State Schema',
            required: [
              'text',
              'color'
            ],
            properties: {
              text: {
                $id: '#/properties/nodes/items/properties/state/properties/text',
                type: 'string',
                title: 'The Text Schema',
                default: '',
                examples: [
                  ''
                ],
                pattern: '^(.*)$'
              },
              color: {
                $id: '#/properties/nodes/items/properties/state/properties/color',
                type: 'string',
                title: 'The Color Schema',
                default: '',
                examples: [
                  ''
                ],
                pattern: '^(.*)$'
              }
            }
          },
          x: {
            $id: '#/properties/nodes/items/properties/x',
            type: 'integer',
            title: 'The X Schema',
            default: 0,
            examples: [
              117
            ]
          },
          y: {
            $id: '#/properties/nodes/items/properties/y',
            type: 'integer',
            title: 'The Y Schema',
            default: 0,
            examples: [
              182
            ]
          },
          id: {
            $id: '#/properties/nodes/items/properties/id',
            type: 'string',
            title: 'The Id Schema',
            default: '',
            examples: [
              '1563108178295'
            ],
            pattern: '^(.*)$'
          },
          component: {
            $id: '#/properties/nodes/items/properties/component',
            type: 'string',
            title: 'The Component Schema',
            default: '',
            examples: [
              'restproxy'
            ],
            pattern: '^(.*)$'
          },
          options: {
            $id: '#/properties/nodes/items/properties/options',
            type: 'object',
            title: 'The Options Schema'
          },
          status: {
            $id: '#/properties/nodes/items/properties/status',
            type: 'string',
            title: 'The Status Schema',
            default: '',
            examples: [
              'starting'
            ],
            pattern: '^(.*)$'
          },
          statusColor: {
            $id: '#/properties/nodes/items/properties/statusColor',
            type: 'string',
            title: 'The Statuscolor Schema',
            default: '',
            examples: [
              'orange'
            ],
            pattern: '^(.*)$'
          },
          connections: {
            $id: '#/properties/nodes/items/properties/connections',
            type: 'array',
            title: 'The Connections Schema',
            items: {
              $id: '#/properties/nodes/items/properties/connections/items',
              type: 'object',
              title: 'The Items Schema',
              required: [
                'id',
                'type',
                'fromNodeId',
                'fromPortId',
                'toNodeId',
                'toPortId'
              ],
              properties: {
                id: {
                  $id: '#/properties/nodes/items/properties/connections/items/properties/id',
                  type: 'string',
                  title: 'The Id Schema',
                  default: '',
                  examples: [
                    'bc3fb20e-a689-4d32-afe0-4ddba67d52df'
                  ],
                  pattern: '^(.*)$'
                },
                type: {
                  $id: '#/properties/nodes/items/properties/connections/items/properties/type',
                  type: 'string',
                  title: 'The Type Schema',
                  default: '',
                  examples: [
                    'connection'
                  ],
                  pattern: '^(.*)$'
                },
                fromNodeId: {
                  $id: '#/properties/nodes/items/properties/connections/items/properties/fromNodeId',
                  type: 'string',
                  title: 'The Fromnodeid Schema',
                  default: '',
                  examples: [
                    '1563108178295'
                  ],
                  pattern: '^(.*)$'
                },
                fromPortId: {
                  $id: '#/properties/nodes/items/properties/connections/items/properties/fromPortId',
                  type: 'string',
                  title: 'The Fromportid Schema',
                  default: '',
                  examples: [
                    '0'
                  ],
                  pattern: '^(.*)$'
                },
                toNodeId: {
                  $id: '#/properties/nodes/items/properties/connections/items/properties/toNodeId',
                  type: 'string',
                  title: 'The Tonodeid Schema',
                  default: '',
                  examples: [
                    '1563108181445'
                  ],
                  pattern: '^(.*)$'
                },
                toPortId: {
                  $id: '#/properties/nodes/items/properties/connections/items/properties/toPortId',
                  type: 'string',
                  title: 'The Toportid Schema',
                  default: '',
                  examples: [
                    '0'
                  ],
                  pattern: '^(.*)$'
                }
              }
            }
          }
        },
        required: [
          'state',
          'x',
          'y',
          'id',
          'component',
          'options',
          'connections'
        ]
      }
    }
  },
  required: [
    'nodes'
  ]
}
