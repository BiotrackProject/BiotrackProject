/**
 * Componente Formulario de Denuncia
 * Ubicación: apps/frontend/src/components/DenunciaForm.jsx
 * 
 * Uso: <DenunciaForm onSuccess={() => { mostrar mensaje, actualizar lista }} />
 */

import { useState } from 'react';
import { useDenuncias, useForm } from '@/hooks/useApi';

export function DenunciaForm({ onSuccess }) {
  const { crear } = useDenuncias();
  const [showMap, setShowMap] = useState(false);

  const form = useForm(
    {
      titulo: '',
      descripcion: '',
      ubicacion: '',
      latitud: 0,
      longitud: 0,
    },
    async (values) => {
      const result = await crear(values);
      if (!result.success) {
        throw new Error(result.error);
      }
      onSuccess?.();
    }
  );

  // Obtener ubicación actual del usuario
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        form.setFieldValue('latitud', position.coords.latitude);
        form.setFieldValue('longitud', position.coords.longitude);
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Registrar Denuncia
      </h2>

      <form onSubmit={form.handleSubmit} className="space-y-6">
        {/* Error Message */}
        {form.submitError && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {form.submitError}
          </div>
        )}

        {/* Success Message */}
        {form.submitSuccess && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            ¡Denuncia creada exitosamente!
          </div>
        )}

        {/* Título */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
            Título de la Denuncia *
          </label>
          <input
            id="titulo"
            type="text"
            name="titulo"
            value={form.values.titulo}
            onChange={form.handleChange}
            placeholder="Ej: Extracción ilegal de arena en playa"
            disabled={form.loading}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
          {form.errors.titulo && (
            <p className="mt-1 text-sm text-red-600">{form.errors.titulo}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
            Descripción *
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={form.values.descripcion}
            onChange={form.handleChange}
            placeholder="Describe los detalles de la situación observada..."
            rows={4}
            disabled={form.loading}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
          {form.errors.descripcion && (
            <p className="mt-1 text-sm text-red-600">{form.errors.descripcion}</p>
          )}
        </div>

        {/* Ubicación */}
        <div>
          <label htmlFor="ubicacion" className="block text-sm font-medium text-gray-700">
            Ubicación *
          </label>
          <input
            id="ubicacion"
            type="text"
            name="ubicacion"
            value={form.values.ubicacion}
            onChange={form.handleChange}
            placeholder="Dirección o descripción del lugar"
            disabled={form.loading}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
          {form.errors.ubicacion && (
            <p className="mt-1 text-sm text-red-600">{form.errors.ubicacion}</p>
          )}
        </div>

        {/* Coordenadas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitud" className="block text-sm font-medium text-gray-700">
              Latitud
            </label>
            <input
              id="latitud"
              type="number"
              name="latitud"
              step="0.000001"
              value={form.values.latitud}
              onChange={form.handleChange}
              placeholder="18.xxxxx"
              disabled={form.loading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label htmlFor="longitud" className="block text-sm font-medium text-gray-700">
              Longitud
            </label>
            <input
              id="longitud"
              type="number"
              name="longitud"
              step="0.000001"
              value={form.values.longitud}
              onChange={form.handleChange}
              placeholder="-69.xxxxx"
              disabled={form.loading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Obtener ubicación actual */}
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={form.loading}
          className="w-full py-2 px-4 bg-gray-200 text-gray-900 font-medium rounded-md hover:bg-gray-300 disabled:bg-gray-100 transition"
        >
          📍 Obtener mi ubicación actual
        </button>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={form.loading}
            className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {form.loading ? 'Enviando denuncia...' : 'Enviar Denuncia'}
          </button>
          <button
            type="button"
            onClick={form.reset}
            disabled={form.loading}
            className="flex-1 py-2 px-4 bg-gray-300 text-gray-900 font-medium rounded-md hover:bg-gray-400 disabled:bg-gray-100 transition"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
