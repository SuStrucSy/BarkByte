import { defineConfig } from 'orval';


export default defineConfig({
  barkbyte: {
    input: {
      target: './openapi.yaml',
    },
    output: {
      mode: 'tags-split',
      client: 'react-query',
      httpClient: 'axios',
      target: 'src/api/endpoints',
      schemas: 'src/api/model',
      fileExtension: '.gen.ts',
      biome: true,
      override: {
        mutator: {
          path: './src/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
      }
    },
  },
  barkByteZod: {
    input: {
      target: './openapi.yaml',
    },
    output: {
      mode: 'tags-split',
      client: 'zod',
      target: 'src/api/endpoints',
      fileExtension: '.zod.ts',
      biome: true
    },

  },

});
