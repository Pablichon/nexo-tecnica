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
    system: `Eres el Asistente Técnico Avanzado de NEXO TÉCNICA. 
    Tu función es facilitar la vinculación entre empresas y proveedores de servicios industriales especializados.
    
    Tono: Profesional, técnico, preciso y ejecutivo. Evita lenguaje excesivamente coloquial.
    
    Capacidades:
    1. Buscar proveedores por rubro técnico.
    2. Consultar ofertas y suministros vigentes.
    
    Reglas de interacción:
    - Si el usuario busca un rubro o servicio, usa 'buscarEmpresas'.
    - Si el usuario busca promociones, descuentos o suministros específicos, usa 'buscarOfertas'.
    - Siempre presenta los resultados con sus puntos de contacto (WhatsApp).
    
    Rubros clave en la plataforma:
    - mecanizado: Tornería, centros de mecanizado CNC, fresado de precisión.
    - mantenimiento: Electromecánica industrial, hidráulica, neumática.
    - automatizacion: Integración de PLC, robótica, control de procesos.
    - suministros: Ferretería industrial, insumos químicos, repuestos.
    - servicios-tecnicos: Ingeniería de diseño, consultoría técnica, CAD/CAM.`,
    tools: {
      buscarEmpresas: tool({
        description: 'Busca proveedores industriales especializados por rubro en la base de datos',
        parameters: z.object({
          rubro: z.string().describe('El ID del rubro a buscar (ej: mecanizado, mantenimiento, automatizacion)'),
        }),
        execute: async ({ rubro }) => {
          console.log(`🤖 IA ejecutando búsqueda de empresas: ${rubro}`);
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
                whatsapp: data.whatsapp,
                direccion: data.direccion
              });
            });

            if (empresas.length === 0) return { message: `No se encontraron proveedores registrados bajo el rubro '${rubro}' en este momento.` };
            return { empresas };
          } catch (error) {
            console.error("Error en buscarEmpresas:", error);
            return { error: "Error en la consulta de proveedores." };
          }
        },
      }),
      buscarOfertas: tool({
        description: 'Busca ofertas vigentes de suministros o servicios industriales',
        parameters: z.object({
          termino: z.string().optional().describe('Término de búsqueda opcional (ej: rodamientos, herramientas)'),
        }),
        execute: async ({ termino }) => {
          console.log(`🤖 IA ejecutando búsqueda de ofertas: ${termino || 'todas'}`);
          try {
            const q = query(
              collection(db, 'ofertas'),
              where('estado', '==', 'activa'),
              limit(5)
            );
            
            const querySnapshot = await getDocs(q);
            const ofertas = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              // Filtro simple por término si existe
              if (!termino || data.titulo.toLowerCase().includes(termino.toLowerCase())) {
                ofertas.push({
                  titulo: data.titulo,
                  negocio: data.negocioNombre,
                  precio: data.precioOferta,
                  whatsapp: data.whatsapp
                });
              }
            });

            if (ofertas.length === 0) return { message: "No hay ofertas vigentes que coincidan con tu búsqueda." };
            return { ofertas };
          } catch (error) {
            console.error("Error en buscarOfertas:", error);
            return { error: "Error al consultar las ofertas vigentes." };
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
