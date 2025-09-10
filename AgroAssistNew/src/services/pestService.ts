import { Pest, PestIdentification } from '../types';
import { API_CONFIG } from '../config/api';
import axios from 'axios';

class PestService {
  private static instance: PestService;
  
  public static getInstance(): PestService {
    if (!PestService.instance) {
      PestService.instance = new PestService();
    }
    return PestService.instance;
  }

  private getMockPests(): Pest[] {
    return [
      {
        id: '1',
        name: 'Trips',
        scientificName: 'Thrips tabaci',
        description: 'Pequeños insectos que se alimentan de la savia de las plantas, causando daños en hojas y frutos.',
        symptoms: [
          'Manchas plateadas en las hojas',
          'Puntos negros (excrementos)',
          'Hojas marchitas o enrolladas',
          'Deformación en frutos'
        ],
        affectedCrops: ['Tomate', 'Pimiento', 'Cebolla', 'Flores ornamentales'],
        treatment: [
          'Aplicar insecticidas específicos para trips',
          'Uso de trampas adhesivas azules',
          'Control biológico con ácaros depredadores',
          'Eliminación de malezas hospederas'
        ],
        prevention: [
          'Inspección regular de plantas',
          'Mantener humedad adecuada',
          'Rotación de cultivos',
          'Uso de mallas anti-insectos'
        ],
        severity: 'media',
        commonNames: ['Thrips', 'Piojillo', 'Tisanópteros']
      },
      {
        id: '2',
        name: 'Pulgón',
        scientificName: 'Aphis gossypii',
        description: 'Insectos pequeños que se alimentan chupando la savia, debilitando las plantas y transmitiendo virus.',
        symptoms: [
          'Hojas amarillentas y enrolladas',
          'Presencia de melaza pegajosa',
          'Crecimiento atrofiado',
          'Formación de fumagina (hongo negro)'
        ],
        affectedCrops: ['Algodón', 'Tomate', 'Pepino', 'Pimiento', 'Calabaza'],
        treatment: [
          'Jabón potásico diluido',
          'Aceite de neem',
          'Insecticidas sistémicos específicos',
          'Introducción de mariquitas (control biológico)'
        ],
        prevention: [
          'Evitar exceso de nitrógeno',
          'Plantas acompañantes repelentes',
          'Inspección temprana',
          'Control de hormigas (protegen pulgones)'
        ],
        severity: 'alta',
        commonNames: ['Áfido', 'Piojo de planta', 'Pulgón del algodón']
      },
      {
        id: '3',
        name: 'Mosca Blanca',
        scientificName: 'Bemisia tabaci',
        description: 'Pequeña mosca que causa daños directos e indirectos, transmitiendo virus devastadores.',
        symptoms: [
          'Vuelo de pequeñas moscas blancas al disturbar la planta',
          'Hojas amarillentas',
          'Melaza en hojas',
          'Síntomas virales en plantas'
        ],
        affectedCrops: ['Tomate', 'Frijol', 'Yuca', 'Algodón', 'Calabaza'],
        treatment: [
          'Trampas adhesivas amarillas',
          'Aceites hortícolas',
          'Insecticidas específicos',
          'Control biológico con Encarsia formosa'
        ],
        prevention: [
          'Eliminación de malezas',
          'Barreras físicas',
          'Variedades resistentes',
          'Monitoreo constante'
        ],
        severity: 'crítica',
        commonNames: ['Mosca blanca del tabaco', 'Mosquita blanca']
      },
      {
        id: '4',
        name: 'Gusano Cogollero',
        scientificName: 'Spodoptera frugiperda',
        description: 'Larva que ataca principalmente gramíneas, causando daños severos en maíz y otros cereales.',
        symptoms: [
          'Agujeros circulares en hojas',
          'Daño en el cogollo del maíz',
          'Presencia de excrementos',
          'Plantas con aspecto "comido"'
        ],
        affectedCrops: ['Maíz', 'Sorgo', 'Arroz', 'Pastos'],
        treatment: [
          'Bacillus thuringiensis (Bt)',
          'Insecticidas específicos para lepidópteros',
          'Feromonas para captura masiva',
          'Control mecánico manual'
        ],
        prevention: [
          'Siembra escalonada',
          'Destrucción de residuos de cosecha',
          'Trampas de feromonas',
          'Variedades Bt'
        ],
        severity: 'alta',
        commonNames: ['Cogollero del maíz', 'Gusano soldado']
      },
      {
        id: '5',
        name: 'Chinche de los Pastos',
        scientificName: 'Blissus leucopterus',
        description: 'Insecto que se alimenta de gramíneas, causando manchas amarillas y muerte de césped.',
        symptoms: [
          'Manchas amarillas circulares en césped',
          'Césped que se marchita rápidamente',
          'Presencia de insectos pequeños negros',
          'Muerte progresiva del pasto'
        ],
        affectedCrops: ['Césped', 'Pastos forrajeros', 'Gramíneas ornamentales'],
        treatment: [
          'Insecticidas de contacto',
          'Nematodos entomopatógenos',
          'Jabón insecticida',
          'Riego profundo para ahogar ninfas'
        ],
        prevention: [
          'Variedades resistentes de césped',
          'Riego adecuado sin encharcamiento',
          'Fertilización equilibrada',
          'Aireación del suelo'
        ],
        severity: 'media',
        commonNames: ['Chinche del césped', 'Chinche negra']
      }
    ];
  }

  async getAllPests(): Promise<Pest[]> {
    // Si no hay backend configurado, usar datos de ejemplo
    if (API_CONFIG.BACKEND_URL === 'http://localhost:3000') {
      console.log('Demo: Usando datos de plagas de ejemplo');
      return this.getMockPests();
    }

    try {
      const response = await axios.get(`${API_CONFIG.BACKEND_URL}/api/pests`, {
        timeout: API_CONFIG.REQUEST_TIMEOUT,
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo plagas:', error);
      console.log('Fallback: Usando datos de plagas de ejemplo');
      return this.getMockPests();
    }
  }

  async getPestById(id: string): Promise<Pest | null> {
    const pests = await this.getAllPests();
    return pests.find(pest => pest.id === id) || null;
  }

  async searchPests(query: string): Promise<Pest[]> {
    const allPests = await this.getAllPests();
    const lowerQuery = query.toLowerCase();
    
    return allPests.filter(pest =>
      pest.name.toLowerCase().includes(lowerQuery) ||
      pest.scientificName.toLowerCase().includes(lowerQuery) ||
      pest.commonNames.some(name => name.toLowerCase().includes(lowerQuery)) ||
      pest.affectedCrops.some(crop => crop.toLowerCase().includes(lowerQuery))
    );
  }

  async identifyPestBySymptoms(symptoms: string[], crop?: string): Promise<PestIdentification[]> {
    const allPests = await this.getAllPests();
    const identifications: PestIdentification[] = [];

    allPests.forEach(pest => {
      let confidence = 0;
      
      // Calcular confianza basada en síntomas coincidentes
      const matchingSymptoms = symptoms.filter(symptom =>
        pest.symptoms.some(pestSymptom =>
          pestSymptom.toLowerCase().includes(symptom.toLowerCase())
        )
      );
      
      confidence += (matchingSymptoms.length / symptoms.length) * 60;

      // Bonus si el cultivo coincide
      if (crop && pest.affectedCrops.some(affectedCrop =>
        affectedCrop.toLowerCase().includes(crop.toLowerCase())
      )) {
        confidence += 30;
      }

      // Solo incluir si hay al menos 30% de confianza
      if (confidence >= 30) {
        identifications.push({
          pestId: pest.id,
          confidence: Math.min(confidence, 95), // Máximo 95% de confianza
          pest
        });
      }
    });

    // Ordenar por confianza descendente
    return identifications.sort((a, b) => b.confidence - a.confidence);
  }

  async getPestsByCrop(cropName: string): Promise<Pest[]> {
    const allPests = await this.getAllPests();
    return allPests.filter(pest =>
      pest.affectedCrops.some(crop =>
        crop.toLowerCase().includes(cropName.toLowerCase())
      )
    );
  }

  async reportPestIncident(pestId: string, location: string, severity: string, notes?: string): Promise<boolean> {
    // En una app real, esto enviaría el reporte al backend
    console.log('Demo: Reporte de plaga enviado', {
      pestId,
      location,
      severity,
      notes,
      timestamp: new Date().toISOString()
    });
    
    return true;
  }
}

export default PestService.getInstance();
