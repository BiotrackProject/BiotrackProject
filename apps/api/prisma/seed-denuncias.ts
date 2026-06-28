import 'dotenv/config';
import { randomInt } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import type { estado_denuncia, tipo_actividad_ilegal, estado_accion } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] as string });
const prisma = new PrismaClient({ adapter });

/**
 * Cuántas denuncias generar. Orden de prioridad:
 *   1. Argumento de línea de comandos: `... seed-denuncias.ts 50`
 *      (también acepta `--count=50` o `--count 50`).
 *   2. Variable de entorno `SEED_DENUNCIAS_COUNT`.
 *   3. Default: 30.
 */
function resolverCantidad(): number {
  const args = process.argv.slice(2);

  // --count=50  /  --count 50
  const flagIdx = args.findIndex((a) => a === '--count' || a.startsWith('--count='));
  if (flagIdx !== -1) {
    const flag = args[flagIdx]!;
    const valor = flag.includes('=') ? flag.split('=')[1] : args[flagIdx + 1];
    const n = Number(valor);
    if (Number.isInteger(n) && n > 0) return n;
  }

  // Primer argumento posicional numérico: `... seed-denuncias.ts 50`
  const posicional = args.find((a) => /^\d+$/.test(a));
  if (posicional) {
    const n = Number(posicional);
    if (n > 0) return n;
  }

  // Env var como fallback.
  const env = Number(process.env['SEED_DENUNCIAS_COUNT']);
  if (Number.isInteger(env) && env > 0) return env;

  return 30;
}

const CANTIDAD = resolverCantidad();

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

// ── Datos para acciones correctivas (MOD-05) ──────────────────────────────────
const ESTADOS_ACCION: estado_accion[] = ['Planificada', 'En_Ejecucion', 'Completada', 'Cancelada'];

const TITULOS_ACCION = [
  'Operativo de fiscalización en la zona afectada',
  'Decomiso de maquinaria de extracción ilegal',
  'Restauración de la ribera erosionada',
  'Instalación de señalización y vigilancia',
  'Sanción administrativa al responsable',
  'Suspensión de actividad y clausura del sitio',
  'Reforestación del área degradada',
  'Coordinación interinstitucional con MIMARENA',
];

const DESCRIPCIONES_ACCION = [
  'Se desplegó un operativo conjunto con la Procuraduría para detener la extracción y levantar acta de inspección en el punto reportado.',
  'Se procedió al decomiso de la maquinaria utilizada y a la identificación de los responsables para el inicio del proceso sancionador.',
  'Se ejecutó un plan de restauración de la ribera con estabilización de taludes y recuperación de la cobertura vegetal nativa.',
  'Se instaló señalización de prohibición y se reforzó la vigilancia periódica con personal técnico de la institución.',
  'Se aplicó la sanción administrativa correspondiente conforme a la normativa ambiental vigente en la República Dominicana.',
  'Se ordenó la suspensión inmediata de la actividad y la clausura temporal del sitio hasta nueva evaluación técnica.',
];

const RESUMENES_PUBLICOS = [
  'MIMARENA intervino la zona afectada por extracción ilegal de arena y aplicó medidas correctivas para proteger el ecosistema.',
  'Se restauró el área degradada y se reforzó la vigilancia para evitar nuevas extracciones no autorizadas.',
  'Operativo de fiscalización concluido con decomiso de equipos y sanción a los responsables de la actividad ilegal.',
];

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
  let accionesCreadas = 0;

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

        // ── Acciones correctivas (MOD-05) ──────────────────────────────────
        // Solo las denuncias Verificadas o Resueltas generan respuesta institucional.
        // ~70% de ellas reciben 1-2 acciones correctivas vinculadas.
        if ((estadoFinal === 'Verificada' || estadoFinal === 'Resuelta') && randomInt(10) < 7) {
          const numAcciones = 1 + randomInt(2); // 1 o 2
          for (let a = 0; a < numAcciones; a++) {
            // Una denuncia resuelta tiende a tener acciones completadas.
            const estadoAccion: estado_accion =
              estadoFinal === 'Resuelta' ? rand(['Completada', 'En_Ejecucion']) : rand(ESTADOS_ACCION);
            const completada = estadoAccion === 'Completada';

            // Planificación tras la denuncia; implementación solo si está completada.
            const fechaPlan = new Date(fechaBase.getTime() + (2 + randomInt(10)) * 24 * 60 * 60 * 1000);
            const fechaImpl = completada
              ? new Date(fechaPlan.getTime() + (3 + randomInt(20)) * 24 * 60 * 60 * 1000)
              : null;

            // Algunas acciones completadas se publican en el portal público.
            const publica = completada && randomInt(10) < 5;

            await tx.accion_Correctiva.create({
              data: {
                responsable_id: admin.IDUsuario,
                titulo: rand(TITULOS_ACCION),
                descripcion_accion: rand(DESCRIPCIONES_ACCION),
                Estado: estadoAccion,
                FechaPlanificacion: fechaPlan,
                FechaImplementacion: fechaImpl,
                Presupuesto: (50_000 + randomInt(950) * 1000).toString(),
                Resultado: completada
                  ? 'Acción ejecutada satisfactoriamente; se mitigó el impacto reportado.'
                  : null,
                visibilidad: publica ? 'Publico' : 'Restringido',
                resumen_publico: publica ? rand(RESUMENES_PUBLICOS) : null,
                created_at: fechaPlan,
                accion_denuncia: {
                  create: { IDDenuncia: denuncia.IDDenuncia },
                },
              },
            });
            accionesCreadas++;
          }
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
  console.log(`✓ ${accionesCreadas} acciones correctivas creadas y vinculadas.`);
  console.log('Distribución por estado:');
  for (const g of porEstado) {
    console.log(`  ${g.Estado}: ${g._count.IDDenuncia}`);
  }

  const porEstadoAccion = await prisma.accion_Correctiva.groupBy({ by: ['Estado'], _count: { IDAccion: true } });
  if (porEstadoAccion.length > 0) {
    console.log('Distribución de acciones por estado:');
    for (const g of porEstadoAccion) {
      console.log(`  ${g.Estado}: ${g._count.IDAccion}`);
    }
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
