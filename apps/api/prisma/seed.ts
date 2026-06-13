import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL'] as string });
const prisma = new PrismaClient({ adapter });

// Valores de enum según schema de producción (accion_permiso)
const PERMISOS: Array<{ modulo: string; accion: string }> = [
  { modulo: 'MOD_01_AUTH', accion: 'Leer' },
  { modulo: 'MOD_01_AUTH', accion: 'Editar' },
  { modulo: 'MOD_02_DENUNCIAS', accion: 'Leer' },
  { modulo: 'MOD_02_DENUNCIAS', accion: 'Crear' },
  { modulo: 'MOD_02_DENUNCIAS', accion: 'Editar' },
  { modulo: 'MOD_02_DENUNCIAS', accion: 'Eliminar_Logico' },
  { modulo: 'MOD_02_DENUNCIAS', accion: 'Exportar' },
  { modulo: 'MOD_03_ZONAS', accion: 'Leer' },
  { modulo: 'MOD_03_ZONAS', accion: 'Crear' },
  { modulo: 'MOD_03_ZONAS', accion: 'Editar' },
  { modulo: 'MOD_03_ZONAS', accion: 'Eliminar_Logico' },
  { modulo: 'MOD_04_INDICADORES', accion: 'Leer' },
  { modulo: 'MOD_04_INDICADORES', accion: 'Exportar' },
  { modulo: 'MOD_05_ACCIONES', accion: 'Leer' },
  { modulo: 'MOD_05_ACCIONES', accion: 'Crear' },
  { modulo: 'MOD_05_ACCIONES', accion: 'Editar' },
  { modulo: 'MOD_05_ACCIONES', accion: 'Publicar' },
  { modulo: 'MOD_05_ACCIONES', accion: 'Exportar' },
  { modulo: 'MOD_06_ADMIN', accion: 'Leer' },
  { modulo: 'MOD_06_ADMIN', accion: 'Crear' },
  { modulo: 'MOD_06_ADMIN', accion: 'Editar' },
  { modulo: 'MOD_06_ADMIN', accion: 'Eliminar_Logico' },
  { modulo: 'MOD_06_ADMIN', accion: 'Configurar' },
];

const ROLES = [
  {
    nombre: 'ADMINISTRADOR',
    descripcion: 'Control total del sistema.',
    modulos: ['MOD_01_AUTH', 'MOD_02_DENUNCIAS', 'MOD_03_ZONAS', 'MOD_04_INDICADORES', 'MOD_05_ACCIONES', 'MOD_06_ADMIN'],
    acciones: ['Leer', 'Crear', 'Editar', 'Eliminar_Logico', 'Exportar', 'Publicar', 'Configurar'],
  },
  {
    nombre: 'TECNICO_AMBIENTAL',
    descripcion: 'Gestión de denuncias, zonas y acciones correctivas.',
    modulos: ['MOD_01_AUTH', 'MOD_02_DENUNCIAS', 'MOD_03_ZONAS', 'MOD_04_INDICADORES', 'MOD_05_ACCIONES'],
    acciones: ['Leer', 'Crear', 'Editar', 'Exportar', 'Publicar'],
  },
  {
    nombre: 'INSPECTOR',
    descripcion: 'Registro de denuncias e inspección en campo.',
    modulos: ['MOD_01_AUTH', 'MOD_02_DENUNCIAS', 'MOD_03_ZONAS'],
    acciones: ['Leer', 'Crear', 'Editar'],
  },
  {
    nombre: 'CONSULTOR',
    descripcion: 'Solo lectura y exportación de reportes.',
    modulos: ['MOD_01_AUTH', 'MOD_02_DENUNCIAS', 'MOD_03_ZONAS', 'MOD_04_INDICADORES', 'MOD_05_ACCIONES'],
    acciones: ['Leer', 'Exportar'],
  },
];

async function main(): Promise<void> {
  console.log('Iniciando seed...');

  for (const { modulo, accion } of PERMISOS) {
    await prisma.permiso.upsert({
      where: { modulo_accion: { modulo, accion: accion as never } },
      update: {},
      create: { modulo, accion: accion as never },
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
          where: { modulo_accion: { modulo: p.modulo, accion: p.accion as never } },
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
        rol_permiso: { create: permisoIds.map(({ id }) => ({ permiso_id: id })) },
      },
    });
    console.log(`✓ Rol "${rol.nombre}" con ${permisoIds.length} permisos`);
  }

  // Crear usuario administrador inicial si no existe
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@biotrack.org.do';
  const adminPass  = process.env.SEED_ADMIN_PASS  ?? 'Biotrack2026!';

  const rolAdmin = await prisma.rol.findUniqueOrThrow({ where: { nombre: 'ADMINISTRADOR' } });
  const hash = await bcrypt.hash(adminPass, 12);

  await prisma.usuario.upsert({
    where: { correo_electronico: adminEmail },
    update: { contrasena_hash: hash, Estado: 'Activo', rol_id: rolAdmin.id },
    create: {
      nombre_completo: 'Administrador BIOTRACK',
      correo_electronico: adminEmail,
      contrasena_hash: hash,
      rol_id: rolAdmin.id,
      Estado: 'Activo',
      cargo: 'Administrador del Sistema',
      institucion: 'BIOTRACK',
    },
  });

  console.log(`✓ Usuario admin: ${adminEmail} / ${adminPass}`);
  console.log('\nSeed completado.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
