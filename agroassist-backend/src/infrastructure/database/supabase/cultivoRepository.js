const supabase = require('./supabaseClient');

const findByUserId = async (userId) => {
  console.log(`📋 Buscando cultivos para usuario: ${userId}`);
  
  const { data, error } = await supabase
    .from('cultivos_usuario')
    .select('*')
    .eq('id_usuario', userId)
    .order('fecha_siembra', { ascending: false });

  if (error) {
    console.error('❌ Error al obtener cultivos:', error);
    throw new Error(`Error al obtener cultivos: ${error.message}`);
  }

  console.log(`✅ Cultivos encontrados: ${data?.length || 0}`);
  return data || [];
};

const findById = async (id) => {
  console.log(`📋 Buscando cultivo con ID: ${id}`);
  
  const { data, error } = await supabase
    .from('cultivos_usuario')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('❌ Error al obtener cultivo:', error);
    throw new Error(`Error al obtener cultivo: ${error.message}`);
  }

  console.log(`✅ Cultivo encontrado:`, data);
  return data;
};

const create = async (cultivoData) => {
  console.log('🌱 Creando nuevo cultivo:', cultivoData);
  
  const cultivoToInsert = {
    id_usuario: cultivoData.id_usuario,
    nombre_cultivo: cultivoData.nombre_cultivo,
    variedad: cultivoData.variedad || null,
    area_sembrada: cultivoData.area_sembrada || null,
    unidad_area: cultivoData.unidad_area || 'hectáreas',
    fecha_siembra: cultivoData.fecha_siembra,
    fecha_cosecha_estimada: cultivoData.fecha_cosecha_estimada || null,
    estado: cultivoData.estado || 'activo',
    notas: cultivoData.notas || null,
    lote: cultivoData.lote || null
  };

  const { data, error } = await supabase
    .from('cultivos_usuario')
    .insert([cultivoToInsert])
    .select()
    .single();

  if (error) {
    console.error('❌ Error al crear cultivo:', error);
    throw new Error(`Error al crear cultivo: ${error.message}`);
  }

  console.log('✅ Cultivo creado exitosamente:', data);
  return data;
};

const update = async (id, cultivoData) => {
  console.log(`✏️ Actualizando cultivo ${id}:`, cultivoData);
  
  const updateData = {};
  
  if (cultivoData.nombre_cultivo !== undefined) updateData.nombre_cultivo = cultivoData.nombre_cultivo;
  if (cultivoData.variedad !== undefined) updateData.variedad = cultivoData.variedad;
  if (cultivoData.area_sembrada !== undefined) updateData.area_sembrada = cultivoData.area_sembrada;
  if (cultivoData.unidad_area !== undefined) updateData.unidad_area = cultivoData.unidad_area;
  if (cultivoData.fecha_siembra !== undefined) updateData.fecha_siembra = cultivoData.fecha_siembra;
  if (cultivoData.fecha_cosecha_estimada !== undefined) updateData.fecha_cosecha_estimada = cultivoData.fecha_cosecha_estimada;
  if (cultivoData.fecha_cosecha_real !== undefined) updateData.fecha_cosecha_real = cultivoData.fecha_cosecha_real;
  if (cultivoData.estado !== undefined) updateData.estado = cultivoData.estado;
  if (cultivoData.notas !== undefined) updateData.notas = cultivoData.notas;
  if (cultivoData.lote !== undefined) updateData.lote = cultivoData.lote;

  if (Object.keys(updateData).length === 0) {
    throw new Error('No hay campos para actualizar');
  }

  const { data, error } = await supabase
    .from('cultivos_usuario')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('❌ Error al actualizar cultivo:', error);
    throw new Error(`Error al actualizar cultivo: ${error.message}`);
  }

  console.log('✅ Cultivo actualizado:', data);
  return data;
};

const remove = async (id) => {
  console.log(`🗑️ Eliminando cultivo ${id}`);
  
  const { error } = await supabase
    .from('cultivos_usuario')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('❌ Error al eliminar cultivo:', error);
    throw new Error(`Error al eliminar cultivo: ${error.message}`);
  }

  console.log('✅ Cultivo eliminado exitosamente');
};

const countByUserId = async (userId) => {
  console.log(`📊 Contando cultivos activos del usuario ${userId}`);
  
  const { count, error } = await supabase
    .from('cultivos_usuario')
    .select('*', { count: 'exact', head: true })
    .eq('id_usuario', userId)
    .eq('estado', 'activo');

  if (error) {
    console.error('❌ Error al contar cultivos:', error);
    throw new Error(`Error al contar cultivos: ${error.message}`);
  }

  console.log(`✅ Cultivos activos: ${count}`);
  return count || 0;
};

module.exports = {
  findByUserId,
  findById,
  create,
  update,
  remove,
  countByUserId
};
