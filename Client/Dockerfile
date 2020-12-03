# Pull official base image
FROM node:9.6.1

# Copy project
ADD ./Client /Client

# Set work directory
WORKDIR /Client

# Install dependencies
RUN npm install --silent

# Build project
#RUN npm run build

#ENTRYPOINT ["npm", "start:prod"]
ENTRYPOINT ["npm", "start"]
