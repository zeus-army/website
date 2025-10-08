# Zeus Army Website - Guía de Desarrollo 🐕⚡

## 🚀 Inicio Rápido

### Requisitos Previos
- Node.js 16+
- Docker Desktop o OrbStack (para Redis local)
- Una wallet Ethereum (MetaMask recomendado)

### Instalación

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**

El archivo `.env.local` ya está configurado para desarrollo local:
```bash
REDIS_URL=redis://localhost:6379
ETHEREUM_RPC_URL=https://eth.llamarpc.com
```

### Desarrollo Local

#### Opción 1: Con Redis (Recomendado)

1. **Iniciar Redis con Docker:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. **Iniciar el servidor API (Terminal 1):**
```bash
vercel dev --listen 3001
```

3. **Iniciar React (Terminal 2):**
```bash
npm start
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- API: http://localhost:3001

#### Opción 2: Solo Frontend (sin funcionalidad de leaderboard)

Si solo quieres ver los cambios de UI sin las APIs:

```bash
npm start
```

### 🏗️ Arquitectura

#### Frontend (React + TypeScript)
- **Framework**: React 19 con TypeScript
- **Estilos**: Styled Components
- **Animaciones**: Framer Motion
- **Web3**: @web3-react/core + ethers.js

#### Backend (Vercel Serverless Functions)
- **API Routes**: `/api/leaderboard` y `/api/join`
- **Base de datos**: Redis (local) o Vercel KV (producción)
- **Smart Contract**: Token ZEUS en Ethereum Mainnet

#### Estructura de Archivos
```
zeus-army-website/
├── src/
│   ├── components/        # Componentes React
│   │   ├── Leaderboard.tsx  # Leaderboard con wallet connect
│   │   ├── Footer.tsx       # Footer mejorado
│   │   └── ...
│   └── styles/
│       └── GlobalStyles.ts  # Estilos globales
├── api/                   # Vercel Serverless Functions
│   ├── _redis.ts         # Cliente Redis unificado
│   ├── leaderboard.ts    # GET endpoint
│   └── join.ts           # POST endpoint
├── public/               # Assets estáticos
└── docker-compose.dev.yml # Redis para desarrollo
```

### 🔑 Funcionalidades Implementadas

#### ✅ Footer Mejorado
- Mayor contraste en textos
- Línea de puntos con borde sólido
- Mejor legibilidad del disclaimer

#### ✅ Leaderboard Interactivo
1. **Conectar Wallet**: Los usuarios pueden conectar MetaMask
2. **Firmar Mensaje**: Se firma un mensaje para autenticación
3. **Verificación de Balance**: Se consulta automáticamente el balance de ZEUS
4. **Input de Twitter**: Modal para ingresar cuenta de Twitter (validado con @)
5. **Ranking**: Se muestra el ranking ordenado por balance de ZEUS

#### ✅ Cambios de UI
- Favicon actualizado desde zeuscoin.vip
- Enlace "Buy ZEUS Now" apunta a Uniswap con el par correcto
- Columna de Twitter en el leaderboard con enlaces directos

### 🧪 Testing Local

Para probar la funcionalidad completa:

1. **Conecta tu wallet** en el navegador (asegúrate de tener MetaMask)
2. **Haz clic en "Connect Wallet"** en el leaderboard
3. **Firma el mensaje** cuando MetaMask lo solicite
4. **Ingresa tu Twitter** (debe empezar con @)
5. **Haz clic en "Join Now"**

El sistema:
- Verificará tu firma
- Consultará tu balance de ZEUS
- Te agregará al leaderboard
- Ordenará por balance

### 📦 Despliegue en Vercel

#### Variables de Entorno en Vercel

Configura estos secrets en tu proyecto de Vercel:

1. **KV Storage** (Vercel KV):
   - Crea un KV Store en el dashboard de Vercel
   - Las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN` se configuran automáticamente

2. **Opcional - RPC personalizado**:
   ```
   ETHEREUM_RPC_URL=tu_rpc_url_aquí
   ```

#### Deploy

```bash
# Login en Vercel
vercel login

# Deploy
vercel --prod
```

### 🐛 Troubleshooting

**Error: "Cannot connect to Redis"**
- Asegúrate de que Docker está corriendo
- Verifica que Redis está activo: `docker ps | grep redis`
- Reinicia Redis: `docker-compose -f docker-compose.dev.yml restart`

**Error: "Failed to fetch leaderboard"**
- Verifica que el servidor API está corriendo en el puerto 3001
- Comprueba los logs: `vercel dev --debug`

**Wallet no se conecta**
- Asegúrate de tener MetaMask instalado
- Verifica que estás en Ethereum Mainnet
- Recarga la página

**Balance de ZEUS no aparece**
- El RPC puede estar lento, espera unos segundos
- Verifica que tienes ZEUS en tu wallet
- Comprueba el contrato: `0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8`

### 🔗 Links Importantes

- Token ZEUS: `0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8`
- Uniswap Swap: https://app.uniswap.org/swap?chain=mainnet&inputCurrency=NATIVE&outputCurrency=0x0f7dc5d02cc1e1f5ee47854d534d332a1081ccc8
- Vercel Docs: https://vercel.com/docs
- Vercel KV Docs: https://vercel.com/docs/storage/vercel-kv

### 🤝 Contribuir

Este proyecto está listo para ser desplegado. Las principales mejoras futuras podrían incluir:

- [ ] Sistema de caché para reducir consultas al RPC
- [ ] Soporte para ENS names
- [ ] Sistema de notificaciones
- [ ] Integración con más wallets (WalletConnect, Coinbase Wallet)
- [ ] Tests unitarios y de integración

---

**Made with 💙 by the Zeus Army pack** 🐕⚡
