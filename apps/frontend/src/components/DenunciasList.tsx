/**
 * Componente Lista de Denuncias
 * Ubicación: apps/frontend/src/components/DenunciasList.jsx
 * 
 * Uso: <DenunciasList />
 */

import { useDenuncias } from '@/hooks/useApi';
import { useState } from 'react';

export function DenunciasList() {
  const { denuncias, loading, error, obtenerDenuncias } = useDenuncias();
  const [selectedId, setSelectedId] = useState(null);
  const [filterEstado, setFilterEstado] = useState('todas');

  // Filtrar denuncias según el estado
  const denunciasFiltered =
    filterEstado === 'todas'
      ? denuncias
      : denuncias.filter((d) => d.estado === filterEstado);

  const getEstadoBadge = (estado) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      en_investigacion: 'bg-blue-100 text-blue-800',
      resuelta: 'bg-green-100 text-green-800',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          colors[estado] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {estado.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-900">Denuncias Registradas</h2>
          <button
            onClick={obtenerDenuncias}
            disabled={loading}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '⟳ Cargando...' : '⟳ Actualizar'}
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-4">
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todas">Todas las denuncias</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_investigacion">En investigación</option>
            <option value="resuelta">Resueltas</option>
          </select>

          <span className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 font-medium">
            Total: {denunciasFiltered.length}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 mb-6 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Sin denuncias */}
      {!loading && denunciasFiltered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay denuncias para mostrar</p>
        </div>
      )}

      {/* Lista de Denuncias */}
      {!loading && denunciasFiltered.length > 0 && (
        <div className="space-y-4">
          {denunciasFiltered.map((denuncia) => (
            <div
              key={denuncia.id}
              onClick={() => setSelectedId(selectedId === denuncia.id ? null : denuncia.id)}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{denuncia.titulo}</h3>
                  <p className="text-sm text-gray-600 mt-1">ID: {denuncia.id}</p>
                </div>
                {getEstadoBadge(denuncia.estado)}
              </div>

              {/* Descripción resumida */}
              <p className="text-gray-700 mb-3">
                {denuncia.descripcion.substring(0, 150)}
                {denuncia.descripcion.length > 150 ? '...' : ''}
              </p>

              {/* Ubicación */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                📍 {denuncia.ubicacion}
              </div>

              {/* Coordenadas */}
              <div className="text-xs text-gray-500 mb-3">
                Coordenadas: {denuncia.latitud.toFixed(6)}, {denuncia.longitud.toFixed(6)}
              </div>

              {/* Fecha */}
              <div className="text-xs text-gray-500">
                Creada: {new Date(denuncia.fecha_creacion).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>

              {/* Detalles expandidos */}
              {selectedId === denuncia.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Descripción completa:</h4>
                    <p className="text-gray-700">{denuncia.descripcion}</p>
                  </div>

                  {denuncia.fotos && denuncia.fotos.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Fotos:</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {denuncia.fotos.map((foto, idx) => (
                          <img
                            key={idx}
                            src={foto}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-32 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Información técnica:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Latitud:</span>
                        <p className="font-mono">{denuncia.latitud}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Longitud:</span>
                        <p className="font-mono">{denuncia.longitud}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Creada:</span>
                        <p>{new Date(denuncia.fecha_creacion).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Actualizada:</span>
                        <p>{new Date(denuncia.fecha_actualizacion).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-3">
                    <button className="flex-1 py-2 px-4 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium">
                      ✏️ Editar
                    </button>
                    <button className="flex-1 py-2 px-4 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium">
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
