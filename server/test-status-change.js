// Script para probar el cambio de estado de tickets y envío de correos
const fetch = require('node-fetch');

async function testTicketStatusChange() {
  console.log(
    '🔄 Probando cambio de estado de ticket con notificación por correo...\n'
  );

  try {
    // Login como administrador
    console.log('🔐 Iniciando sesión como administrador...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@partequipos.com',
        password: 'admin123',
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Error en login: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    console.log('✅ Login exitoso\n');

    // Obtener tickets existentes
    console.log('📋 Obteniendo tickets existentes...');
    const ticketsResponse = await fetch('http://localhost:3000/api/tickets', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!ticketsResponse.ok) {
      throw new Error(`Error obteniendo tickets: ${ticketsResponse.status}`);
    }

    const tickets = await ticketsResponse.json();

    if (tickets.length === 0) {
      console.log('❌ No hay tickets disponibles para probar');
      return;
    }

    // Buscar un ticket en estado 'open'
    const openTicket = tickets.find(ticket => ticket.status === 'open');

    if (!openTicket) {
      console.log('❌ No hay tickets en estado "open" para probar');
      return;
    }

    console.log(
      `✅ Ticket encontrado: ${openTicket.title} (ID: ${openTicket.id})`
    );
    console.log(
      `📧 Cliente: ${openTicket.customer.name} (${openTicket.customer.email})\n`
    );

    // Cambiar estado a 'in_progress'
    console.log('🔄 Cambiando estado a "En Progreso"...');
    const updateResponse = await fetch(
      `http://localhost:3000/api/tickets/${openTicket.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'in_progress',
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(
        `Error actualizando ticket: ${updateResponse.status} - ${errorData.message}`
      );
    }

    const updateResult = await updateResponse.json();
    console.log('✅ Estado cambiado a "En Progreso" exitosamente');
    console.log(
      '📧 Verifica tu bandeja de entrada para el correo de notificación'
    );
    console.log('📧 También revisa la bandeja de soportemq@partequipos.com\n');

    // Esperar un poco y cambiar a 'resolved'
    console.log('⏳ Esperando 3 segundos...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🔄 Cambiando estado a "Resuelto"...');
    const resolveResponse = await fetch(
      `http://localhost:3000/api/tickets/${openTicket.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'resolved',
        }),
      }
    );

    if (!resolveResponse.ok) {
      const errorData = await resolveResponse.json();
      throw new Error(
        `Error resolviendo ticket: ${resolveResponse.status} - ${errorData.message}`
      );
    }

    const resolveResult = await resolveResponse.json();
    console.log('✅ Estado cambiado a "Resuelto" exitosamente');
    console.log(
      '📧 Verifica tu bandeja de entrada para el segundo correo de notificación'
    );
    console.log('📧 También revisa la bandeja de soportemq@partequipos.com');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testTicketStatusChange();
