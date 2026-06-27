import 'dotenv/config';
import { randomInt } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import type { estado_denuncia, tipo_actividad_ilegal } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] as string });
const prisma = new PrismaClient({ adapter });

/** Cuántas denuncias generar (configurable por env, default 30). */
const CANTIDAD = Number(process.env['SEED_DENUNCIAS_COUNT'] ?? 30);

/**
 * Puntos base reales de RD donde ocurre extracción ilegal de arena
 * (ríos y zonas costeras). Cada denuncia toma uno de estos y le aplica
 * un pequeño jitter para dispersarla de forma realista sobre el mapa.
 * Formato: [lat, lng] — dentro de DR_BOUNDS [[17.4,-72],[20.1,-68.2]].
 */
const UBICACIONES: Array<{ nombre: string; lat: number; lng: number; tipo: tipo_actividad_ilegal }> = [
  { nombre: 'Río Ozama, Santo Domingo',          lat: 18.49, lng: -69.85, tipo: 'Extraccion_Rio' },
  { nombre: 'Río Haina, San Cristóbal',          lat: 18.42, lng: -70.02, tipo: 'Extraccion_Rio' },
  { nombre: 'Río Nizao, Baní',                   lat: 18.28, lng: -70.2,  tipo: 'Extraccion_Rio' },
  { nombre: 'Río Yaque del Norte, Santiago',     lat: 19.45, lng: -70.69, tipo: 'Extraccion_Rio' },
  { nombre: 'Río Yuna, Bonao',                   lat: 18.94, lng: -70.41, tipo: 'Extraccion_Rio' },
  { nombre: 'Río Camú, La Vega',                 lat: 19.22, lng: -70.52, tipo: 'Extraccion_Rio' },
  { nombre: 'Río Yaque del Sur, Azua',           lat: 18.45, lng: -70.73, tipo: 'Extraccion_Rio' },
  { nombre: 'Río Higuamo, San Pedro de Macorís', lat: 18.46, lng: -69.3,  tipo: 'Extraccion_Rio' },
  { nombre: 'Playa Najayo, San Cristóbal',       lat: 18.3,  lng: -70.18, tipo: 'Extraccion_Playa' },
  { nombre: 'Playa Palenque, San Cristóbal',     lat: 18.27, lng: -70.15, tipo: 'Extraccion_Playa' },
  { nombre: 'Playa de Boca Chica',               lat: 18.45, lng: -69.61, tipo: 'Extraccion_Playa' },
  { nombre: 'Costa de Barahona',                 lat: 18.21, lng: -71.1,  tipo: 'Extraccion_Playa' },
  { nombre: 'Costa de Puerto Plata',             lat: 19.79, lng: -70.69, tipo: 'Extraccion_Playa' },
  { nombre: 'Bahía de Samaná',                   lat: 19.2,  lng: -69.33, tipo: 'Extraccion_Zona_Protegida' },
  { nombre: 'Monte Cristi (área protegida)',     lat: 19.85, lng: -71.65, tipo: 'Extraccion_Zona_Protegida' },
  { nombre: 'Carretera Sánchez (ruta camiones)', lat: 18.35, lng: -70.4,  tipo: 'Transporte_Ilegal' },
];

const ESTADOS: estado_denuncia[] = ['Pendiente', 'En_Investigacion', 'Verificada', 'Resuelta', 'Desestimada'];
const URGENCIAS = ['Baja', 'Media', 'Alta', 'Riesgo inmediato'];
const TIPOS_EXTRACCION = ['Manual con palas', 'Retroexcavadora', 'Camiones volteo', 'Dragado', 'Mixto'];
const NUMERO_PERSONAS = ['1-2', '3-5', '6-10', 'Más de 10', 'Desconocido'];
const CANTIDAD_ARENA = ['Menos de 1 m³', '1-5 m³', '5-20 m³', 'Más de 20 m³', 'Camión completo'];

const DESCRIPCIONES = [
  'Se observa extracción de arena con maquinaria pesada en horas de la madrugada.',
  'Camiones cargando arena del lecho del río sin permiso visible.',
  'Personas extrayendo arena de la playa de forma manual durante el fin de semana.',
  'Actividad de dragado que está alterando el cauce natural del río.',
  'Extracción constante que ha provocado erosión visible en la ribera.',
  'Movimiento de camiones cargados de arena saliendo de zona protegida.',
  'Maquinaria operando dentro del área protegida sin autorización.',
  'Extracción nocturna reportada por residentes de la comunidad cercana.',
  'Acumulación de arena lista para transporte al borde de la carretera.',
  'Daño al ecosistema costero por remoción continua de sedimentos.',
];

function rand<T>(arr: T[]): T {
  return arr[randomInt(arr.length)]!;
}

/** Jitter de ±0.015° (~1.6 km) para dispersar puntos sobre la misma zona. */
function jitter(): number {
  // randomInt(0, 1e6) / 1e6 da un float uniforme en [0, 1).
  return (randomInt(0, 1_000_000) / 1_000_000 - 0.5) * 0.03;
}

function randomCodigo(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < 8; i++) out += chars[randomInt(chars.length)];
  return out;
}

/** Fecha aleatoria dentro de los últimos `dias` días. */
function fechaReciente(dias = 90): Date {
  const ahora = Date.now();
  return new Date(ahora - randomInt(dias) * 24 * 60 * 60 * 1000);
}

/**
 * Historial de transiciones coherente con el estado final, partiendo de Pendiente.
 * Sigue la máquina de estados típica del módulo de denuncias.
 */
function transicionesPara(estadoFinal: estado_denuncia): estado_denuncia[] {
  switch (estadoFinal) {
    case 'Pendiente':        return [];
    case 'En_Investigacion': return ['En_Investigacion'];
    case 'Verificada':       return ['En_Investigacion', 'Verificada'];
    case 'Resuelta':         return ['En_Investigacion', 'Verificada', 'Resuelta'];
    case 'Desestimada':      return ['Desestimada'];
    default:                 return [];
  }
}

async function main(): Promise<void> {
  console.log(`Generando ${CANTIDAD} denuncias de prueba (datos random)...`);

  // Usuario que firma los cambios de estado en el historial (el admin del seed base).
  const admin = await prisma.usuario.findFirst({
    where: { rol: { nombre: 'ADMINISTRADOR' } },
    select: { IDUsuario: true },
  });

  if (!admin) {
    console.error('No se encontró un usuario ADMINISTRADOR. Ejecuta primero `pnpm db:seed`.');
    process.exit(1);
  }

  const usados = new Set<string>();
  let creadas = 0;

  for (let i = 0; i < CANTIDAD; i++) {
    const ubic = rand(UBICACIONES);
    const lat = ubic.lat + jitter();
    const lng = ubic.lng + jitter();
    const estadoFinal = rand(ESTADOS);
    const fechaBase = fechaReciente();

    let codigo = randomCodigo();
    while (usados.has(codigo)) codigo = randomCodigo();
    usados.add(codigo);

    try {
      await prisma.$transaction(async (tx) => {
        const denuncia = await tx.denuncia.create({
          data: {
            codigo_seguimiento: codigo,
            Descripcion: rand(DESCRIPCIONES),
            tipo_actividad: ubic.tipo,
            Estado: estadoFinal,
            Fecha_denuncia: fechaBase,
            fecha_incidente: fechaBase,
            detalle_ubicacion: ubic.nombre,
            tipo_extraccion: rand(TIPOS_EXTRACCION),
            numero_personas: rand(NUMERO_PERSONAS),
            cantidad_arena: rand(CANTIDAD_ARENA),
            nivel_urgencia: rand(URGENCIAS),
          },
          select: { IDDenuncia: true },
        });

        // ubicacion_gps es Unsupported("point"); se escribe vía SQL crudo como point(lat, lng).
        await tx.$executeRaw`UPDATE "Denuncia" SET ubicacion_gps = point(${lat}, ${lng}) WHERE "IDDenuncia" = ${denuncia.IDDenuncia}`;

        // Historial de estados coherente con el estado final.
        const transiciones = transicionesPara(estadoFinal);
        let estadoAnterior: estado_denuncia = 'Pendiente';
        let cuando = fechaBase.getTime();
        for (const estadoNuevo of transiciones) {
          cuando += (1 + randomInt(4)) * 24 * 60 * 60 * 1000;
          await tx.historial_estado_denuncia.create({
            data: {
              IDDenuncia: denuncia.IDDenuncia,
              IDUsuario: admin.IDUsuario,
              estado_anterior: estadoAnterior,
              estado_nuevo: estadoNuevo,
              comentario: `Cambio de estado a ${estadoNuevo} durante la gestión de la denuncia.`,
              created_at: new Date(cuando),
            },
          });
          estadoAnterior = estadoNuevo;
        }
      });
      creadas++;
    } catch (err) {
      console.warn(`Saltada denuncia ${i + 1} (${codigo}):`, (err as Error).message);
    }
  }

  // Resumen por estado.
  const porEstado = await prisma.denuncia.groupBy({ by: ['Estado'], _count: { IDDenuncia: true } });
  console.log(`\n✓ ${creadas} denuncias creadas.`);
  console.log('Distribución por estado:');
  for (const g of porEstado) {
    console.log(`  ${g.Estado}: ${g._count.IDDenuncia}`);
  }
  console.log('\nSeed de denuncias completado.');
}


try {
    await main();
} catch (e) {
    console.error(e);
    process.exit(1);
} finally {
    prisma.$disconnect();
    process.exit(0);
}
