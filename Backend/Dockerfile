# Use an official Python runtime as a parent image
FROM python:3.10

# Set environment variables
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container to /code
WORKDIR /code

# Copy the requirements file into the container at /code
COPY ./requirements.txt /code/

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Django project into the container at /code
COPY ./ /code/

# Expose the port
EXPOSE 8001