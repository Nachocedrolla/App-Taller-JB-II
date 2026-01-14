
import React from 'react';

export const APP_CONFIG = {
  WEBHOOK_PREVENTIVO_URL: 'https://primary-production-e953.up.railway.app/webhook/AppTallerJB',
  WEBHOOK_CORRECTIVO_URL: 'https://primary-production-e953.up.railway.app/webhook/Correctivo',
  WEBHOOK_FLOTA_URL: 'https://primary-production-e953.up.railway.app/webhook/AltaUnidad',
  WEBHOOK_PENDIENTES_URL: 'https://primary-production-e953.up.railway.app/webhook/Pendientes',
  COMPANY_NAME: 'TALLER JOTA BE',
  TAGLINE: 'CONTROL INTELIGENTE DE FLOTA',
  SYSTEM_STATE_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTROf3uSKgOTiGU66iyY0_EhZFziw_QqrXTURSdTqsAV2dW1nHe70xSEPmHRYt3Vz0wlgFmZ7ldwNWj/pub?gid=1852479142&single=true&output=csv',
  UNITS_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTROf3uSKgOTiGU66iyY0_EhZFziw_QqrXTURSdTqsAV2dW1nHe70xSEPmHRYt3Vz0wlgFmZ7ldwNWj/pub?gid=1803304221&single=true&output=csv',
  FLEET_DATA_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbQFwLJWbkUeFhy6NRfD62PdEk_fiJG04W9efGuCzMExgc9JQgelBrju7jub4ze-4vtA1TKCmvJwGQ/pub?gid=602415456&single=true&output=csv',
  PENDIENTES_DATA_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTROf3uSKgOTiGU66iyY0_EhZFziw_QqrXTURSdTqsAV2dW1nHe70xSEPmHRYt3Vz0wlgFmZ7ldwNWj/pub?gid=712981862&single=true&output=csv',
  PERSONNEL_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTROf3uSKgOTiGU66iyY0_EhZFziw_QqrXTURSdTqsAV2dW1nHe70xSEPmHRYt3Vz0wlgFmZ7ldwNWj/pub?gid=255449939&single=true&output=csv',
  RUBROS_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTROf3uSKgOTiGU66iyY0_EhZFziw_QqrXTURSdTqsAV2dW1nHe70xSEPmHRYt3Vz0wlgFmZ7ldwNWj/pub?gid=203962470&single=true&output=csv',
  INSUMOS_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTROf3uSKgOTiGU66iyY0_EhZFziw_QqrXTURSdTqsAV2dW1nHe70xSEPmHRYt3Vz0wlgFmZ7ldwNWj/pub?gid=844936611&single=true&output=csv',
  ALERTS_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTROf3uSKgOTiGU66iyY0_EhZFziw_QqrXTURSdTqsAV2dW1nHe70xSEPmHRYt3Vz0wlgFmZ7ldwNWj/pub?gid=1406929369&single=true&output=csv',
  VENCIMIENTOS_UNIDADES_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTROf3uSKgOTiGU66iyY0_EhZFziw_QqrXTURSdTqsAV2dW1nHe70xSEPmHRYt3Vz0wlgFmZ7ldwNWj/pub?gid=260921177&single=true&output=csv',
  VENCIMIENTOS_CHOFERES_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQKTtFyAeCKKW1Qxx46f8O6Z65xa4vC2ATrwMTMbnrIrdD2QYjnzh7JaagVkAA9-4tXRr-J7viFDPdK/pub?gid=1313007637&single=true&output=csv'
};

export const MAINTENANCE_TASKS = [
  { id: 'aceite_motor', label: 'Cambio de aceite motor', iconName: 'oil' },
  { id: 'filtros_aire', label: 'Cambio de filtros de aire', iconName: 'filter' },
  { id: 'aceite_caja_dif', label: 'Cambio de aceite de caja y diferencial', iconName: 'gear' },
  { id: 'rotacion_del', label: 'Rotación de cubiertas delanteras', iconName: 'tire' },
  { id: 'rotacion_tra', label: 'Rotación de cubiertas traseras', iconName: 'tire' },
  { id: 'tensores_correas', label: 'Cambio de tensores y correas', iconName: 'belt' },
  { id: 'rotacion_baterias', label: 'Rotación de baterías', iconName: 'battery' },
  { id: 'bomba_agua', label: 'Cambio de bomba de agua', iconName: 'water' },
];
