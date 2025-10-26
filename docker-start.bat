@echo off
echo Construyendo imagen Docker...
docker-compose build
echo.
echo Iniciando contenedor en puerto 5000...
docker-compose up -d
echo.
echo Dashboard disponible en http://localhost:5000
echo.
echo Para ver logs: docker-compose logs -f
echo Para detener: docker-compose down
