import request from 'supertest';
import app from '../index.js';

// Mock external services
jest.mock('node-fetch', () => jest.fn());

describe('Webhook API', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should return 200 OK on health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should handle Dialogflow webhook request', async () => {
    const mockRequest = {
      queryResult: {
        intent: { displayName: 'test_intent' },
        parameters: { param1: 'value1' }
      }
    };

    const response = await request(app)
      .post('/webhook')
      .send(mockRequest)
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('fulfillmentText');
  });

  it('should handle missing intent gracefully', async () => {
    const mockRequest = {
      queryResult: {
        parameters: {}
      }
    };

    const response = await request(app)
      .post('/webhook')
      .send(mockRequest);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('fulfillmentText');
  });

  it('should return 500 if OpenAI call fails', async () => {
    const fetch = require('node-fetch');
    fetch.mockRejectedValue(new Error('OpenAI API error'));

    const mockRequest = {
      queryResult: {
        intent: { displayName: 'test_intent' },
        parameters: {}
      }
    };

    const response = await request(app)
      .post('/webhook')
      .send(mockRequest);

    expect(response.status).toBe(500);
    expect(response.body.fulfillmentText).toContain('Internal server error');
  });
});