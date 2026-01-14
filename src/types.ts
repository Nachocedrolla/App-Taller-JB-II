
export interface Personnel {
  name: string;
  code: string;
}

export interface Unit {
  id: string;
  name: string;
}

export interface FleetUnit extends Unit {
  plate?: string;
  model?: string;
  year?: string;
  chassisNumber?: string;
  engineNumber?: string;
  type?: 'Tractor' | 'Semicuello' | 'Acoplado' | 'Utilitario';
  status?: 'activo' | 'taller' | 'baja';
}

export interface Rubro {
  id: string;
  name: string;
}

export interface Insumo {
  id: string;
  name: string;
}

export interface MaintenanceAlert {
  unit: string;
  currentKm: number;
  items: Array<{
    task: string;
    remainingKm: number;
    status: 'critical' | 'warning' | 'ok';
  }>;
}

export interface ExpirationItem {
  document: string;
  expiryDate: string;
  daysLeft: number;
  status: 'critical' | 'warning' | 'ok';
}

export interface UnitExpiration {
  unit: string;
  expirations: ExpirationItem[];
}

export interface InspectionData {
  id: string;
  otNumber?: string;
  date: string;
  driver: string;
  unit: string;
  odometer: number;
  type: 'preventivo' | 'correctivo' | 'alta_unidad' | 'pendientes';
  rubro?: string;
  taskDescription?: string;
  insumo?: string;
  cantidad?: number;
  workshop?: string;
  status: 'pending' | 'completed' | 'failed' | string;
  tasks: Record<string, number | null>;
  notes: string;
  extraData?: any;
}

export interface WebhookResponse {
  status: string;
  message: string;
}
