import { PrismaClient, ModuloSistema, AccionPermiso } from '@prisma/client';

const prisma = new PrismaClient();

const PERMISOS: Array<{ modulo: ModuloSistema; accion: AccionPermiso }> = [
  { modulo: 'MOD_01_AUTH', accion: 'LEER' },
  { modulo: 'MOD_01_AUTH', accion: 'EDITAR' },
  { modulo: 'MOD_02_DENUNCIAS', accion: 'LEER' },
  { modulo: 'MOD_02_DENUNCIAS', accion: 'CREAR' },
  { modulo: 'MOD_02_DENUNCIAS', accion: 'EDITAR' },
  { modulo: 'MOD_02_DENUNCIAS', accion: 'ELIMINAR_LOGICO' },
  { modulo: 'MOD_02_DENUNCIAS', accion: 'EXPORTAR' },
  { modulo: 'MOD_03_ZONAS', accion: 'LEER' },
  { modulo: 'MOD_03_ZONAS', accion: 'CREAR' },
  { modulo: 'MOD_03_ZONAS', accion: 'EDITAR' },
  { modulo: 'MOD_03_ZONAS', accion: 'ELIMINAR_LOGICO' },
  { modulo: 'MOD_04_INDICADORES', accion: 'LEER' },
  { modulo: 'MOD_04_INDICADORES', accion: 'EXPORTAR' },
  { modulo: 'MOD_05_ACCIONES', accion: 'LEER' },
  { modulo: 'MOD_05_ACCIONES', accion: 'CREAR' },
  { modulo: 'MOD_05_ACCIONES', accion: 'EDITAR' },
  { modulo: 'MOD_05_ACCIONES', accion: 'PUBLICAR' },
  { modulo: 'MOD_05_ACCIONES', accion: 'EXPORTAR' },
  { modulo: 'MOD_06_ADMIN', accion: 'LEER' },
  { modulo: 'MOD_06_ADMIN', accion: 'CREAR' },
  { modulo: 'MOD_06_ADMIN', accion: 'EDITAR' },
  { modulo: 'MOD_06_ADMIN', accion: 'ELIMINAR_LOGICO' },
  { modulo: 'MOD_06_ADMIN', accion: 'CONFIGURAR' },
];

const ROLES = [
  {
    nombre: 'ADMINISTRADOR',
    descripcion: 'Control total del sistema.',
    modulos: ['MOD_01_AUTH', 'MOD_02_DENUNCIAS', 'MOD_03_ZONAS', 'MOD_04_INDICADORES', 'MOD_05_ACCIONES', 'MOD_06_ADMIN'] as ModuloSistema[],
    acciones: ['LEER', 'CREAR', 'EDITAR', 'ELIMINAR_LOGICO', 'EXPORTAR', 'PUBLICAR', 'CONFIGURAR'] as AccionPermiso[],
  },
  {
    nombre: 'TECNICO_AMBIENTAL',
    descripcion: 'Gestión de denuncias, zonas y acciones correctivas.',
    modulos: ['MOD_01_AUTH', 'MOD_02_DENUNCIAS', 'MOD_03_ZONAS', 'MOD_04_INDICADORES', 'MOD_05_ACCIONES'] as ModuloSistema[],
    acciones: ['LEER', 'CREAR', 'EDITAR', 'EXPORTAR', 'PUBLICAR'] as AccionPermiso[],
  },
  {
    nombre: 'INSPECTOR',
    descripcion: 'Registro de denuncias e inspección en campo.',
    modulos: ['MOD_01_AUTH', 'MOD_02_DENUNCIAS', 'MOD_03_ZONAS'] as ModuloSistema[],
    acciones: ['LEER', 'CREAR', 'EDITAR'] as AccionPermiso[],
  },
  {
    nombre: 'CONSULTOR',
    descripcion: 'Solo lectura y exportación de reportes.',
    modulos: ['MOD_01_AUTH', 'MOD_02_DENUNCIAS', 'MOD_03_ZONAS', 'MOD_04_INDICADORES', 'MOD_05_ACCIONES'] as ModuloSistema[],
    acciones: ['LEER', 'EXPORTAR'] as AccionPermiso[],
  },
];

async function main(): Promise<void> {
  console.log('Iniciando seed...');

  for (const { modulo, accion } of PERMISOS) {
    await prisma.permiso.upsert({
      where: { modulo_accion: { modulo, accion } },
      update: {},
      create: { modulo, accion },
    });
  }
  console.log(`✓ ${PERMISOS.length} permisos creados/actualizados`);

  for (const rolDef of ROLES) {
    const permisosRol = PERMISOS.filter(
      (p) => rolDef.modulos.includes(p.modulo) && rolDef.acciones.includes(p.accion)
    );
    const permisoIds = await Promise.all(
      permisosRol.map((p) =>
        prisma.permiso.findUniqueOrThrow({
          where: { modulo_accion: { modulo: p.modulo, accion: p.accion } },
          select: { id: true },
        })
      )
    );
    const rol = await prisma.rol.upsert({
      where: { nombre: rolDef.nombre },
      update: { descripcion: rolDef.descripcion },
      create: {
        nombre: rolDef.nombre,
        descripcion: rolDef.descripcion,
        permisos: { create: permisoIds.map(({ id }) => ({ permisoId: id })) },
      },
    });
    console.log(`✓ Rol "${rol.nombre}" con ${permisoIds.length} permisos`);
  }

  console.log('\nSeed completado.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
