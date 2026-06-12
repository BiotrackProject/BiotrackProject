const POR_PAGINA_PERMITIDOS = [10, 25, 50, 100] as const;

interface PaginationParams {
  pagina: number;
  por_pagina: number;
  skip: number;
  take: number;
}

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const pagina = Math.max(1, parseInt(String(query['pagina'] ?? '1'), 10) || 1);
  const porPaginaRaw = parseInt(String(query['por_pagina'] ?? '25'), 10) || 25;
  const por_pagina = (POR_PAGINA_PERMITIDOS as readonly number[]).includes(porPaginaRaw)
    ? porPaginaRaw
    : 25;

  return { pagina, por_pagina, skip: (pagina - 1) * por_pagina, take: por_pagina };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  pagination: Pick<PaginationParams, 'pagina' | 'por_pagina'>
) {
  return {
    data,
    paginacion: {
      total,
      pagina: pagination.pagina,
      por_pagina: pagination.por_pagina,
      total_paginas: Math.ceil(total / pagination.por_pagina),
    },
  };
}
