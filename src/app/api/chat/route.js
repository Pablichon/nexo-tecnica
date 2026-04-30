import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export const maxDuration = 30;

export async function POST(req) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-1.5-flash'),
    messages,
    system: `Eres el Asistente Inteligente de NEXO TÉCNICA. 
    Tu objetivo es ayudar a encontrar proveedores industriales.
    
    Tienes acceso a una herramienta para buscar empresas en nuestra base de datos.
    Si el usuario busca un rubro o tipo de servicio, UTILIZA la herramienta 'buscarEmpresas'.
    
    Rubros disponibles en el sistema:
    - mecanizado (Tornería, CNC, Fresado)
    - mantenimiento (Electromecánica, Hidráulica)
    - automatizacion (PLC, Robótica)
    - suministros (Ferretería industrial)
    - servicios-tecnicos (Ingeniería, CAD)

    Cuando encuentres resultados, preséntalos de forma profesional y menciona que pueden ver más detalles en el listado principal.`,
    tools: {
      buscarEmpresas: tool({
        description: 'Busca empresas industriales por rubro en la base de datos',
        parameters: z.object({
          rubro: z.string().describe('El ID del rubro a buscar (ej: mecanizado, mantenimiento, automatizacion)'),
        }),
        execute: async ({ rubro }) => {
          console.log(`🤖 IA ejecutando búsqueda para rubro: ${rubro}`);
          try {
            const q = query(
              collection(db, 'negocios'),
              where('rubro', '==', rubro),
              where('estado', '==', 'aprobado'),
              limit(5)
            );
            
            const querySnapshot = await getDocs(q);
            const empresas = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              empresas.push({
                nombre: data.nombre,
                descripcion: data.descripcion,
                whatsapp: data.whatsapp
              });
            });

            if (empresas.length === 0) {
              return { message: `No encontré empresas aprobadas en el rubro '${rubro}' actualmente.` };
            }

            return { empresas };
          } catch (error) {
            console.error("Error en tool buscarEmpresas:", error);
            return { error: "Hubo un problema al consultar la base de datos." };
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
