
import { InspectionData, WebhookResponse } from '../types';
import { APP_CONFIG } from '../constants';

export const sendInspectionToWebhook = async (data: InspectionData): Promise<WebhookResponse> => {
  try {
    let webhookUrl = APP_CONFIG.WEBHOOK_PREVENTIVO_URL;
    
    if (data.type === 'correctivo') {
      webhookUrl = APP_CONFIG.WEBHOOK_CORRECTIVO_URL;
    } else if (data.type === 'alta_unidad') {
      webhookUrl = APP_CONFIG.WEBHOOK_FLOTA_URL;
    } else if (data.type === 'pendientes') {
      webhookUrl = APP_CONFIG.WEBHOOK_PENDIENTES_URL;
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Intentamos obtener el cuerpo del error si existe
      let errorDetail = '';
      try {
        errorDetail = await response.text();
      } catch (e) {}
      throw new Error(`Error ${response.status}: ${response.statusText || 'Sin mensaje de servidor'}. ${errorDetail}`);
    }

    const result = await response.text();
    
    // Limpieza mejorada de la respuesta
    let cleanMessage = result
      .replace(/\([^)]*\)/g, '')
      .replace(/[{}":]/g, '')
      .trim();
    
    if (!cleanMessage || cleanMessage.toLowerCase().includes('success') || cleanMessage.length < 3) {
      if (data.type === 'correctivo') cleanMessage = 'OPERACIÓN EXITOSA';
      else if (data.type === 'alta_unidad') cleanMessage = 'UNIDAD REGISTRADA';
      else if (data.type === 'pendientes') {
        const action = data.extraData?.action;
        cleanMessage = action === 'update_status' ? 'ESTADO ACTUALIZADO' : 'PENDIENTE REGISTRADO';
      }
      else cleanMessage = 'PROTOCOLO SINCRONIZADO';
    }

    return {
      status: 'success',
      message: cleanMessage
    };
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return {
      status: 'error',
      message: error.message || 'Error de conexión con el servidor central.'
    };
  }
};
