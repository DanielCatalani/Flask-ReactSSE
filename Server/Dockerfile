# pull official base image
FROM python:3.8.1-slim-buster

# Copy project
ADD ./Server /Server

# Set work directory
WORKDIR /Server

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

EXPOSE 5000

RUN chmod +x entrypoint.sh
ENTRYPOINT ["sh", "entrypoint.sh"]

