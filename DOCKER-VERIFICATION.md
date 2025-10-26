# =3 Verificaci�n de Docker - Checklist

##  Pre-requisitos

Antes de construir la imagen Docker, verifica:

- [ ] Docker Desktop est� instalado y corriendo
- [ ] Tienes conexi�n a internet (para descargar im�genes base)
- [ ] Tienes al menos 2 GB de espacio libre en disco

Verificar Docker:
```cmd
docker --version
docker info
```

## >� Pruebas de Construcci�n

### Test 1: Build Simple

```bash
cd aws-ecs-dashboard
docker build -t aws-ecs-dashboard:test .
```

**Resultado esperado:**
```
Successfully built <image-id>
Successfully tagged aws-ecs-dashboard:test
```

**Tiempo estimado**: 2-3 minutos

### Test 2: Inspeccionar la Imagen

```bash
docker images aws-ecs-dashboard
```

**Verificar:**
- Tama�o: ~20-30 MB (gracias a multi-stage build)
- Tag: latest o test

### Test 3: Ejecutar el Contenedor

```bash
docker run -d -p 5000:5000 --name test-dashboard aws-ecs-dashboard:test
```

**Verificar:**
```bash
docker ps
```

Deber�as ver el contenedor corriendo.

### Test 4: Health Check

```bash
# Espera 10 segundos para que el contenedor inicie
timeout /t 10

# Verificar health
docker inspect --format='{{.State.Health.Status}}' test-dashboard
```

**Resultado esperado**: `healthy`

### Test 5: Acceso HTTP

```bash
# Test con curl o en navegador
curl http://localhost:5000/health
```

**Resultado esperado**: `healthy`

Navegador: http://localhost:5000
**Resultado esperado**: Se carga la aplicaci�n

### Test 6: Logs del Contenedor

```bash
docker logs test-dashboard
```

**Verificar:** No hay errores, solo logs de Nginx iniciando.

### Test 7: Performance

```bash
docker stats test-dashboard --no-stream
```

**Verificar:**
- CPU: < 5%
- Memoria: < 50 MB

## >� Limpieza despu�s de Tests

```bash
# Detener y eliminar contenedor de prueba
docker stop test-dashboard
docker rm test-dashboard

# Eliminar imagen de prueba
docker rmi aws-ecs-dashboard:test

# Limpiar im�genes no usadas
docker image prune -f
```

## =� Checklist de Producci�n

Antes de desplegar en producci�n:

- [ ] El build completa sin errores
- [ ] La imagen es < 50 MB
- [ ] El health check responde
- [ ] La aplicaci�n carga en el navegador
- [ ] No hay errores en logs
- [ ] CPU y memoria est�n dentro de l�mites

## = Troubleshooting

### Error: "Cannot connect to Docker daemon"

**Soluci�n:**
1. Abre Docker Desktop
2. Espera a que inicie completamente
3. Verifica: `docker info`

### Error: "Failed to fetch"

**Soluci�n:**
1. Verifica conexi�n a internet
2. Intenta de nuevo: `docker build --no-cache -t aws-ecs-dashboard .`

### Error: "Port 5000 already in use"

**Soluci�n:**
```bash
# Encuentra qu� usa el puerto
netstat -ano | findstr :5000

# Usa otro puerto
docker run -d -p 5001:5000 --name test-dashboard aws-ecs-dashboard
```

### Contenedor inicia pero no responde

**Soluci�n:**
```bash
# Ver logs detallados
docker logs test-dashboard

# Entrar al contenedor
docker exec -it test-dashboard sh

# Verificar nginx
ps aux | grep nginx

# Ver configuraci�n
cat /etc/nginx/conf.d/default.conf
```

### Build muy lento

**Soluci�n:**
1. Usa `.dockerignore` (ya incluido)
2. Aumenta recursos en Docker Desktop (Settings � Resources)

## ( Resultado Esperado Final

Si todos los tests pasan:

```
 Imagen construida: aws-ecs-dashboard:latest
 Tama�o optimizado: ~25 MB
 Contenedor corriendo en puerto 5000
 Health check: healthy
 Aplicaci�n accesible en http://localhost:5000
 Logs limpios sin errores
 Uso de recursos m�nimo
```

## =� Pr�ximos Pasos

Una vez verificado localmente:

1. **Push a ECR**: Ver [DOCKER-GUIDE.md](DOCKER-GUIDE.md) secci�n "Despliegue en AWS ECS"
2. **Deploy en ECS**: Crear Task Definition y Service
3. **Configurar ALB**: Para acceso p�blico (opcional)
4. **Monitoreo**: CloudWatch Logs y m�tricas

---

**�Todo listo para producci�n!** <�
