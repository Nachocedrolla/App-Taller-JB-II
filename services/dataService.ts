
import { Unit, Personnel, Rubro, Insumo, MaintenanceAlert, UnitExpiration, ExpirationItem, FleetUnit } from '../types';
import { APP_CONFIG } from '../constants';

export interface PendingTask {
  id: string;
  unit: string;
  date: string;
  priority: string;
  description: string;
  status: string;
  driver?: string;
}

const parseCSV = (csv: string): string[][] => {
  if (!csv || typeof csv !== 'string') return [];
  const lines = csv.split(/\r\n|\n|\r/).map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) return [];

  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const separator = semiCount > commaCount ? ';' : ',';
  
  return lines.map(row => 
    row.split(separator).map(cell => 
      cell.trim()
          .replace(/^"|"$/g, '') 
          .replace(/\uFEFF/g, '') 
    )
  );
};

const safeFetchData = async (url: string, label: string): Promise<string | null> => {
  try {
    const response = await fetch(url, { 
      method: 'GET',
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const text = await response.text();
    if (!text || text.includes('<!DOCTYPE html>')) {
      throw new Error('La respuesta no es un CSV válido (posiblemente error de permisos en la hoja)');
    }
    
    return text;
  } catch (error) {
    console.error(`[DataService] Error en ${label}:`, error);
    return null;
  }
};

export const fetchSystemDate = async (): Promise<Date> => {
  const csvText = await safeFetchData(APP_CONFIG.SYSTEM_STATE_URL, 'Estado Global (Fecha)');
  if (!csvText) return new Date();
  
  const rows = parseCSV(csvText);
  for (const row of rows) {
    for (const cell of row) {
      if (cell.includes('/')) {
        const parts = cell.split('/');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      }
    }
  }
  return new Date();
};

export const fetchUnits = async (): Promise<Unit[]> => {
  const csvText = await safeFetchData(APP_CONFIG.UNITS_CSV_URL, 'Unidades');
  if (!csvText) return [];
  const rows = parseCSV(csvText);
  return rows.slice(1)
    .filter(row => row[0] && row[0].length > 0)
    .map(row => ({ id: row[0], name: row[0] }));
};

export const fetchFleetData = async (): Promise<FleetUnit[]> => {
  const csvText = await safeFetchData(APP_CONFIG.FLEET_DATA_CSV_URL, 'Datos de Flota');
  if (!csvText) return [];
  const rows = parseCSV(csvText);
  return rows.slice(1)
    .filter(row => row[0] && row[0].trim().length > 0)
    .map(row => ({
      id: row[0],
      name: `${row[0]} - ${row[1]}`,
      plate: row[1] || 'S/D',
      model: row[2] || 'S/D',
      year: row[3] || 'S/D',
      chassisNumber: row[4] || 'S/D',
      engineNumber: row[5] || 'S/D',
      status: 'activo'
    }));
};

export const fetchPendientesData = async (): Promise<PendingTask[]> => {
  const csvText = await safeFetchData(APP_CONFIG.PENDIENTES_DATA_CSV_URL, 'Datos de Pendientes');
  if (!csvText) return [];
  const rows = parseCSV(csvText);
  // Estructura: ID, Interno, Fecha, Prioridad, Tarea, Estado, Chofer
  return rows.slice(1)
    .filter(row => row[0] && row[0].trim().length > 0)
    .map(row => ({
      id: row[0],
      unit: row[1] || 'S/D',
      date: row[2] || 'S/D',
      priority: row[3] || 'Media',
      description: row[4] || 'S/D',
      status: row[5] || 'Pendiente',
      driver: row[6] || 'S/D'
    }));
};

export const fetchPersonnel = async (): Promise<Personnel[]> => {
  const csvText = await safeFetchData(APP_CONFIG.PERSONNEL_CSV_URL, 'Personal');
  if (!csvText) return [];
  const rows = parseCSV(csvText);
  return rows.slice(1)
    .filter(row => row[0] && row[1])
    .map(row => ({ name: row[0], code: row[1].toString() }));
};

export const fetchRubros = async (): Promise<Rubro[]> => {
  const csvText = await safeFetchData(APP_CONFIG.RUBROS_CSV_URL, 'Rubros');
  if (!csvText) return [];
  const rows = parseCSV(csvText);
  return rows.slice(1)
    .filter(row => row[0] && row[0].length > 0)
    .map(row => ({ id: row[0], name: row[0] }));
};

export const fetchInsumos = async (): Promise<Insumo[]> => {
  const csvText = await safeFetchData(APP_CONFIG.INSUMOS_CSV_URL, 'Insumos');
  if (!csvText) return [];
  const rows = parseCSV(csvText);
  return rows.slice(1)
    .filter(row => row[0] && row[0].trim().length > 0)
    .map(row => ({ id: row[0], name: row[0] }));
};

export const fetchAlerts = async (): Promise<MaintenanceAlert[]> => {
  const csvText = await safeFetchData(APP_CONFIG.ALERTS_CSV_URL, 'Alertas');
  if (!csvText) return [];
  const rows = parseCSV(csvText);
  const headers = rows[0];
  
  return rows.slice(1).map(row => {
    const unit = row[0];
    const currentKm = parseInt(row[1]) || 0;
    const items: MaintenanceAlert['items'] = [];

    for (let i = 2; i < row.length; i++) {
      if (!headers[i]) continue;
      const remainingKm = parseInt(row[i]) || 0;
      let status: 'critical' | 'warning' | 'ok' = 'ok';
      
      if (remainingKm <= 1000) status = 'critical';
      else if (remainingKm <= 3000) status = 'warning';

      items.push({
        task: headers[i],
        remainingKm,
        status
      });
    }

    return { unit, currentKm, items };
  }).filter(a => a.unit);
};

const processExpirations = (rows: string[][], baseDate: Date, isPersonnel = false): UnitExpiration[] => {
  const headers = rows[0];
  const nameIndex = isPersonnel ? 1 : 0;
  const dataStartIndex = isPersonnel ? 2 : 1;

  return rows.slice(1).map(row => {
    const unit = row[nameIndex];
    if (!unit) return { unit: '', expirations: [] };

    const expirations: ExpirationItem[] = [];

    for (let i = dataStartIndex; i < row.length; i++) {
      if (isPersonnel && (i === 6 || i === 7 || i === 8)) continue;
      if (!headers[i] || !row[i] || row[i].trim() === '') continue;
      
      const headerLower = headers[i].toLowerCase();
      if (headerLower.includes('observaciones') || headerLower === 'unidad' || headerLower === 'unidades') continue;
      
      const docName = headers[i];
      const expiryDate = row[i];
      const parts = expiryDate.split('/');
      const d = parts.length === 3 ? new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])) : null;
      
      if (!d) continue;

      const diffTime = d.getTime() - baseDate.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let status: 'critical' | 'warning' | 'ok' = 'ok';
      if (docName.toLowerCase().includes('fumigacion')) {
        if (daysLeft <= 0) status = 'critical'; 
        else if (daysLeft >= 1 && daysLeft <= 8) status = 'warning';
      } else {
        if (daysLeft <= 0) status = 'critical'; 
        else if (daysLeft >= 1 && daysLeft <= 30) status = 'warning';
      }

      expirations.push({
        document: docName,
        expiryDate,
        daysLeft,
        status
      });
    }

    return { unit, expirations };
  }).filter(u => u.unit && u.unit.trim().length > 0);
};

export const fetchUnitExpirations = async (): Promise<UnitExpiration[]> => {
  const [csvText, systemDate] = await Promise.all([
    safeFetchData(APP_CONFIG.VENCIMIENTOS_UNIDADES_CSV_URL, 'Vencimientos Unidades'),
    fetchSystemDate()
  ]);
  if (!csvText) return [];
  return processExpirations(parseCSV(csvText), systemDate, false);
};

export const fetchPersonnelExpirations = async (): Promise<UnitExpiration[]> => {
  const [csvText, systemDate] = await Promise.all([
    safeFetchData(APP_CONFIG.VENCIMIENTOS_CHOFERES_CSV_URL, 'Vencimientos Choferes'),
    fetchSystemDate()
  ]);
  if (!csvText) return [];
  return processExpirations(parseCSV(csvText), systemDate, true);
};
