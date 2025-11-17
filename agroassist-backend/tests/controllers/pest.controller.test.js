const { describe, test, expect, beforeEach } = require('@jest/globals');
const request = require('supertest');
const express = require('express');

// Mock del servicio
jest.mock('../../src/infrastructure/services/pestAnalysisService');
const pestAnalysisService = require('../../src/infrastructure/services/pestAnalysisService');

// Mock del middleware
jest.mock('../../src/interfaces/middlewares/validateJWT', () => ({
  validateJWT: (req, res, next) => {
    req.uid = 1;
    next();
  }
}));

describe('PestController', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    
    app = express();
    app.use(express.json({ limit: '50mb' }));
    
    const pestRoutes = require('../../src/interfaces/routes/pest.routes');
    app.use('/api/pests', pestRoutes);
  });

  describe('POST /api/pests/analyze-image', () => {
    test('debe analizar imagen correctamente', async () => {
      const mockAnalysis = {
        exito: true,
        analisis: {
          detectado: true,
          cultivo_identificado: 'Tomate',
          problemas: [{
            tipo: 'plaga',
            nombre: 'Mosca blanca',
            confianza: 'alta',
            gravedad: 'moderada'
          }],
          recomendaciones: [{
            accion: 'Aplicar tratamiento',
            prioridad: 'alta'
          }]
        },
        modelo_utilizado: 'gpt-4o',
        tokens_utilizados: 1500
      };

      pestAnalysisService.analyzeCropImage.mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .post('/api/pests/analyze-image')
        .send({
          imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
          cropName: 'Tomate'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.analisis.cultivo_identificado).toBe('Tomate');
    });

    test('debe retornar 400 si no se proporciona imagen', async () => {
      const response = await request(app)
        .post('/api/pests/analyze-image')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });

    test('debe limpiar prefijo base64 correctamente', async () => {
      const mockAnalysis = {
        exito: true,
        analisis: { detectado: false },
        tokens_utilizados: 500
      };

      pestAnalysisService.analyzeCropImage.mockResolvedValue(mockAnalysis);

      await request(app)
        .post('/api/pests/analyze-image')
        .send({
          imageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...'
        });

      expect(pestAnalysisService.analyzeCropImage).toHaveBeenCalledWith(
        expect.not.stringContaining('data:image'),
        undefined
      );
    });
  });

  describe('POST /api/pests/weather-alerts', () => {
    test('debe generar alertas basadas en clima', async () => {
      const mockAlerts = {
        alertas: [{
          tipo: 'temperatura_alta',
          titulo: 'Temperatura Alta',
          nivel_riesgo: 'alto'
        }],
        nivel_riesgo_general: 'alto'
      };

      pestAnalysisService.getPestAlertsBasedOnWeather.mockResolvedValue(mockAlerts);

      const response = await request(app)
        .post('/api/pests/weather-alerts')
        .send({
          weatherData: {
            temperature: 35,
            humidity: 60
          },
          cropName: 'Café'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.alertas).toHaveLength(1);
    });

    test('debe retornar 400 si no se proporcionan datos de clima', async () => {
      const response = await request(app)
        .post('/api/pests/weather-alerts')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});
