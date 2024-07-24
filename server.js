import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const app = express();

// Configuração do CORS para permitir todas as origens
app.use(cors({
  origin: '*', // Permite todas as origens
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Teste de conexão com o banco de dados
async function testConnection() {
  try {
    await prisma.$connect();
    console.log("Conexão com o banco de dados bem-sucedida.");
  } catch (error) {
    console.error("Falha na conexão com o banco de dados:", error);
  }
}

testConnection();

// Rota para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('hello3');
});

// Rota para buscar todos os destinos
app.get('/destinations', async (req, res) => {
  try {
    console.log('Fetching all destinations...');
    const destinations = await prisma.destination.findMany({
      take: 100, // Limitar a quantidade de dados para teste inicial
    });
    console.log('Destinations fetched successfully:', destinations.length);
    res.json(destinations);
  } catch (error) {
    console.error('Error fetching destinations:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar destino por ID
app.get('/destinations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Fetching destination with ID: ${id}`);
    const destination = await prisma.destination.findUnique({
      where: { id },
      include: { atrativos: true },
    });
    if (!destination) {
      res.status(404).json({ error: 'Destination not found' });
    } else {
      console.log('Destination fetched successfully:', destination);
      res.json(destination);
    }
  } catch (error) {
    console.error('Error fetching destination:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar um novo destino
app.post('/destinations', async (req, res) => {
  const { name, region, description, latitude, longitude, bestPeriod, photos } = req.body;
  try {
    console.log('Creating a new destination:', req.body);
    const newDestination = await prisma.destination.create({
      data: { name, region, description, latitude, longitude, bestPeriod, photos },
    });
    console.log('New destination created:', newDestination);
    res.status(201).json(newDestination);
  } catch (error) {
    console.error('Error creating destination:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar atrativos por destino ID
app.get('/destinations/:id/atrativos', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`Fetching attractions for destination ID: ${id}`);
    const atrativos = await prisma.atrativo.findMany({
      where: { destinationId: id },
    });
    console.log('Attractions fetched successfully:', atrativos.length);
    res.json(atrativos);
  } catch (error) {
    console.error('Error fetching attractions:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para criar um novo atrativo
app.post('/atrativos', async (req, res) => {
  const { name, type, description, tips, destinationId } = req.body;
  try {
    console.log('Creating a new attraction:', req.body);
    const newAtrativo = await prisma.atrativo.create({
      data: { name, type, description, tips, destinationId },
    });
    console.log('New attraction created:', newAtrativo);
    res.status(201).json(newAtrativo);
  } catch (error) {
    console.error('Error creating attraction:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
