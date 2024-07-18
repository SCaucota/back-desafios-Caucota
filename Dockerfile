FROM node
#Definimos una imagen base de NODE.

WORKDIR /app
#Creamos la carpeta interna donde guardar el proyecto.

COPY package*.json .
#Copiamos el paquete de dependencias a mi nueva carpeta de destino.

RUN npm install
#Tiene que instalar todas las dependencias

COPY . .
#Copiamos todo el código de mi aplicación

EXPOSE 8080
#Qué puerto vamos a escuchar

CMD ["npm", "start"]
#Ejecutamos la aplicacion