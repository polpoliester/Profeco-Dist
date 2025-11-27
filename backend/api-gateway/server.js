const express = require('express');
const jwt = require('jsonwebtoken');
const amqp = require('amqplib');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken, authorize, JWT_SECRET } = require('./middleware/auth');
const RABBITMQ_CONFIG = require('./config/rabbitmq');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const usuarios = [
  {
    id: 1,
    email: 'consumidor@test.com',
    password: 'password123',
    tipo: 'consumidor',
    nombre: 'Juan Perez'
  },
  {
    id: 2,
    email: 'supermercado@test.com',
    password: 'password123',
    tipo: 'supermercado',
    nombre: 'Walmart Centro'
  },
  {
    id: 3,
    email: 'profeco@test.com',
    password: 'password123',
    tipo: 'profeco',
    nombre: 'Administrador ProFeCo'
  }
];

let channel = null;
let connection = null;

async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQ_CONFIG.url);
    channel = await connection.createChannel();
    console.log('API Gateway conectado a RabbitMQ');
    return true;
  } catch (error) {
    console.error('Error conectando a RabbitMQ:', error.message);
    setTimeout(connectRabbitMQ, 5000);
    return false;
  }
}

async function enviarMensajeRPC(cola, mensaje) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!channel) {
        return reject(new Error('Canal de RabbitMQ no disponible'));
      }

      const { queue: colaRespuesta } = await channel.assertQueue('', { exclusive: true });
      const correlationId = uuidv4();

      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta del microservicio'));
      }, 10000);

      channel.consume(colaRespuesta, (msg) => {
        if (msg.properties.correlationId === correlationId) {
          clearTimeout(timeout);
          const respuesta = JSON.parse(msg.content.toString());
          resolve(respuesta);
        }
      }, { noAck: true });

      mensaje.correlationId = correlationId;
      mensaje.replyTo = colaRespuesta;

      channel.sendToQueue(
        cola,
        Buffer.from(JSON.stringify(mensaje)),
        { correlationId, replyTo: colaRespuesta }
      );
    } catch (error) {
      reject(error);
    }
  });
}

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      mensaje: 'Email y password son requeridos'
    });
  }

  const usuario = usuarios.find(u => u.email === email && u.password === password);

  if (!usuario) {
    return res.status(401).json({
      success: false,
      mensaje: 'Credenciales invalidas'
    });
  }

  const token = jwt.sign(
    { 
      id: usuario.id, 
      email: usuario.email, 
      tipo: usuario.tipo,
      nombre: usuario.nombre
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    mensaje: 'Login exitoso',
    data: {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
        nombre: usuario.nombre
      }
    }
  });
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    mensaje: 'Token valido',
    data: req.user
  });
});

app.get('/api/ofertas', authenticateToken, async (req, res) => {
  try {
    const respuesta = await enviarMensajeRPC(RABBITMQ_CONFIG.queues.ofertas, {
      operacion: 'obtener_ofertas',
      filtros: {
        supermercadoId: req.query.supermercadoId ? parseInt(req.query.supermercadoId) : undefined,
        activa: req.query.activa ? req.query.activa === 'true' : undefined
      },
      usuario: req.user
    });

    res.json(respuesta);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error comunicandose con el microservicio',
      error: error.message
    });
  }
});

app.post('/api/ofertas', authenticateToken, authorize('supermercado', 'profeco'), async (req, res) => {
  try {
    const respuesta = await enviarMensajeRPC(RABBITMQ_CONFIG.queues.ofertas, {
      operacion: 'crear_oferta',
      datos: {
        ...req.body,
        supermercadoId: req.user.tipo === 'supermercado' ? req.user.id : req.body.supermercadoId
      },
      usuario: req.user
    });

    res.status(respuesta.success ? 201 : 400).json(respuesta);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error comunicandose con el microservicio',
      error: error.message
    });
  }
});

app.put('/api/ofertas/:id', authenticateToken, authorize('supermercado', 'profeco'), async (req, res) => {
  try {
    const respuesta = await enviarMensajeRPC(RABBITMQ_CONFIG.queues.ofertas, {
      operacion: 'actualizar_oferta',
      id: parseInt(req.params.id),
      datos: req.body,
      usuario: req.user
    });

    res.status(respuesta.success ? 200 : 404).json(respuesta);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error comunicandose con el microservicio',
      error: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    servicio: 'API Gateway ProFeCo',
    rabbitmq: channel ? 'conectado' : 'desconectado',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    servicio: 'API Gateway - ProFeCo',
    version: '1.0',
    endpoints: {
      autenticacion: {
        'POST /api/auth/login': 'Iniciar sesion',
        'GET /api/auth/verify': 'Verificar token'
      },
      ofertas: {
        'GET /api/ofertas': 'Obtener ofertas (requiere autenticacion)',
        'POST /api/ofertas': 'Crear oferta (supermercado/profeco)',
        'PUT /api/ofertas/:id': 'Actualizar oferta (supermercado/profeco)'
      }
    },
    usuariosPrueba: [
      { email: 'consumidor@test.com', password: 'password123', tipo: 'consumidor' },
      { email: 'supermercado@test.com', password: 'password123', tipo: 'supermercado' },
      { email: 'profeco@test.com', password: 'password123', tipo: 'profeco' }
    ]
  });
});

async function iniciar() {
  console.log('Iniciando API Gateway...');
  
  await connectRabbitMQ();
  
  app.listen(PORT, () => {
    console.log(`API Gateway ejecutandose en http://localhost:${PORT}`);
    console.log('Endpoints principales:');
    console.log('   POST   /api/auth/login');
    console.log('   GET    /api/auth/verify');
    console.log('   GET    /api/ofertas');
    console.log('   POST   /api/ofertas');
    console.log('   PUT    /api/ofertas/:id');
  });
}

process.on('SIGINT', async () => {
  console.log('Cerrando conexiones...');
  if (channel) await channel.close();
  if (connection) await connection.close();
  process.exit(0);
});

iniciar();
