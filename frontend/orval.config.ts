import { defineConfig } from 'orval';


export default defineConfig({
  barkbyte: {
    input: {
      target: './openapi.json',
    },
    output: {
      mode: 'tags-split',
      client: 'react-query',
      target: 'src/api/endpoints',
      schemas: 'src/api/model',
      fileExtension: '.gen.ts',
      biome: true
    },
  },
  barkByteZod: {
    input: {
      target: './openapi.json',
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
