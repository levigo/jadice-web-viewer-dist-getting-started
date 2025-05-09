# Jadice Web Viewer - Getting Started Guide

## Overview

The Jadice Web Viewer is a Spring Boot-based application that provides document viewing capabilities for web applications. This documentation covers the backend components of the Getting Started tutorial, focusing on the annotation handling, application configuration, and CORS settings.

## Core Components

### 1. Main Application Class

The `JadiceWebViewerApplicationGS` class serves as the entry point for the Spring Boot application:

- Initializes the Spring application context
- Imports necessary configurations including JWT security
- Configures component scanning for required packages
- Enables configuration properties

### 2. Application Configuration

The `JadiceWebViewerApplicationGSConfig` class handles the post-initialization setup:

- Registers the `SaveJadiceAnnotationsHandler` for saving annotations
- Configures supported redaction types ("Mask" and "TextMask")
- Sets up the annotation saving mechanism

### 3. Annotation Handling

The `SaveJadiceAnnotationsHandler` class is responsible for saving document annotations:

- Implements the `SaveAnnotationsHandler` interface
- Converts annotations to binary format
- Transmits annotations to a remote HTTP server
- Supports both Bearer token and Basic authentication methods
- Handles HTTP response validation and error reporting

### 4. Annotation Configuration

The `AnnotationSaveConfiguration` class defines properties for the annotation saving functionality:

- Base URL for the annotation server
- Connection and request timeouts
- Authentication configuration (username/password or token)

### 5. Annotation Image Provider

The `AnnoImageProvider` class implements the `AnnotationImageProvider` interface:

- Provides annotation-related images by ID
- Supports specific annotation images like signatures and QR codes
- Loads resources from the classpath

### 6. CORS Configuration

The application includes comprehensive CORS (Cross-Origin Resource Sharing) support:

- `CorsProperties` class defines configurable CORS settings:
    - Allowed origin patterns (default: all origins)
    - Allowed HTTP methods and headers
    - Exposed headers
    - Credentials support
    - Preflight cache duration

- `CorsConfig` class creates and registers the CORS filter:
    - Applies CORS settings from the properties
    - Sets up the filter for all application paths
    - Assigns the highest priority to ensure it runs first

## Configuration Examples

The application can be configured via `application.yml`.

## Security Considerations

- Authentication is configurable for annotation saving
- Supports both Basic Authentication and Bearer Token methods
- Includes CORS settings to control cross-origin access

## System Requirements

- Java Runtime Environment (JRE) 21 or higher
- Spring Boot compatible environment
- Network connectivity for annotation saving (if configured)

## Getting Started

1. Configure the application using `application.yml`
2. Set up your license in the configuration
3. Run the application using for instance:
   ```
   java -jar -Dspring.config.location=./application.yml jadice-web-viewer-gs-backend-1.0.0-SNAPSHOT.jar -Djwt.log.dir=/tmp
   ```
4. The jadice wev viewer backend should be running at `http://localhost:8080`

## Implementation Notes

The application is designed with a modular architecture:
- Spring Boot for application framework
- Component-based design for extensibility
- Configuration-driven functionality
- Support for various document formats and annotation types

This documentation provides an overview of the backend components for the Jadice Web Viewer Getting Started tutorial. For more detailed information, refer to the complete Jadice Web Viewer documentation.