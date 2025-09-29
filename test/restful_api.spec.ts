import pactum from 'pactum';
import { SimpleReporter } from '../simple-reporter';
import { faker } from '@faker-js/faker';
import { StatusCodes } from 'http-status-codes';

describe('API Restful - Testes de Integração', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://api.restful-api.dev';
  let createdObjectId: string;

  p.request.setDefaultTimeout(90000);

  beforeAll(async () => {
    p.reporter.add(rep);
    // Criar um objeto para usar nos testes de atualização e exclusão
    const dataToCreate = {
      name: faker.commerce.productName(),
      data: {
        color: faker.color.human(),
        capacity: faker.string.numeric(3) + ' GB'
      }
    };
    console.log(
      'Dados enviados para criar o objeto:',
      JSON.stringify(dataToCreate, null, 2)
    );
    const response = await p
      .spec()
      .post(`${baseUrl}/objects`)
      .withJson(dataToCreate)
      .expectStatus(StatusCodes.OK)
      .returns('id');
    createdObjectId = response;
    console.log('ID do objeto criado para testes:', createdObjectId);
    // Buscar o objeto criado para log
    const fullObject = await p
      .spec()
      .get(`${baseUrl}/objects/${createdObjectId}`)
      .expectStatus(StatusCodes.OK)
      .returns('body');
    console.log('Objeto criado completo:', JSON.stringify(fullObject, null, 2));
  });

  describe('Cenários de Teste da API Restful', () => {
    it('1. Listar todos os objetos', async () => {
      await p
        .spec()
        .get(`${baseUrl}/objects`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              data: { type: ['object', 'null'] }
            },
            required: ['id', 'name']
          }
        });
    });

    it('2. Obter objeto por ID específico', async () => {
      await p
        .spec()
        .get(`${baseUrl}/objects/7`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            data: { type: 'object' }
          },
          required: ['id', 'name', 'data']
        });
    });

    it('3. Obter múltiplos objetos por IDs', async () => {
      await p
        .spec()
        .get(`${baseUrl}/objects?id=3&id=5&id=10`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              data: { type: 'object' }
            },
            required: ['id', 'name', 'data']
          }
        });
    });

    it('4. Adicionar um novo objeto', async () => {
      await p
        .spec()
        .post(`${baseUrl}/objects`)
        .withJson({
          name: faker.commerce.productName(),
          data: {
            color: faker.color.human(),
            capacity: faker.string.numeric(3) + ' GB'
          }
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            createdAt: { type: 'string' },
            data: { type: 'object' }
          },
          required: ['id', 'name', 'data']
        });
    });

    it('5. Atualizar objeto completamente (PUT)', async () => {
      console.log('Atualizando objeto com ID:', createdObjectId);
      await p
        .spec()
        .put(`${baseUrl}/objects/${createdObjectId}`)
        .withJson({
          name: 'Produto Atualizado',
          data: {
            color: 'Preto',
            capacity: '256 GB'
          }
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            updatedAt: { type: 'string' },
            data: { type: 'object' }
          },
          required: ['id', 'name', 'data']
        });
    });

    it('6. Atualizar objeto parcialmente (PATCH)', async () => {
      console.log('Aplicando PATCH no objeto com ID:', createdObjectId);
      await p
        .spec()
        .patch(`${baseUrl}/objects/${createdObjectId}`)
        .withJson({
          data: {
            capacity: '512 GB'
          }
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            updatedAt: { type: 'string' },
            data: { type: 'object' }
          },
          required: ['id', 'name', 'data']
        });
    });

    it('7. Deletar um objeto', async () => {
      console.log('Deletando objeto com ID:', createdObjectId);
      await p
        .spec()
        .delete(`${baseUrl}/objects/${createdObjectId}`)
        .expectStatus(StatusCodes.OK)
        .expectJson({
          message: `Object with id = ${createdObjectId} has been deleted.`
        });
    });

    it('8. Tentar obter objeto inexistente', async () => {
      await p
        .spec()
        .get(`${baseUrl}/objects/999`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });

    it('9. Tentar atualizar objeto inexistente (PUT)', async () => {
      await p
        .spec()
        .put(`${baseUrl}/objects/999`)
        .withJson({
          name: 'Produto Inexistente',
          data: {
            color: 'Azul',
            capacity: '128 GB'
          }
        })
        .expectStatus(StatusCodes.NOT_FOUND);
    });

    it('10. Tentar deletar objeto inexistente', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/objects/999`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });

  afterAll(() => p.reporter.end());
});
