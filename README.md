# Jadice Web Viewer - Getting Started Project

This project demonstrates the integration of jadice web viewer, a document viewing solution that enables viewing, annotating, and handling various document formats in web applications.

## Overview

The jadice web viewer Getting Started project consists of two main components:

1. **Backend**: A Spring Boot application that provides document processing capabilities
2. **Frontend**: An Angular application that integrates the jadice web viewer components
3. **Test Storage Server with Basic Auth**: A node http server that provides Basic Auth

Together, these components create a complete document viewing solution with features like annotation support, and format export.

## Backend Features

- **Document Viewing**: Core functionality for rendering documents via Document Data Providers
- **Annotation Handling**: Support for creating, viewing, and saving annotations
- **Authentication Support**: Configure Basic or Bearer token authentication
- **CORS Support**: Comprehensive cross-origin configuration for web integration

## Frontend Features

- **Document Display**: Renders documents
- **Toolbar Configuration**: Customizable toolbar with various document operations
- **Annotation Support**: Create and manage document annotations
- **Page Navigation**: Navigate through multi-page documents
- **Zoom Controls**: Adjust document zoom levels
- **Rotation Controls**: Rotate document pages
- **Export Options**: Export documents to various formats

## Getting Started

### Prerequisites

- Java 21
- Node.js 20+ and npm
  - Needs to be configured for our private repositories @see: https://levigo.github.io/jadice-webtoolkit-documentation/ng-client/getting-started/
- Angular CLI

### Running the Test Server

This test server is needed for the default document which is included in the getting started.
As well as for saving annotations via the save action to the Basic Auth endpoint defined in the
application.yml file of the backend.

@See README.md in test-server-basic-auth

### Running the Backend

@See README.md in jadice-web-viewer-gs-backend

### Running the Frontend

1. Navigate to the frontend directory
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run start
```

4. Open your browser and navigate to `http://localhost:4200`

## Configuration Options

### Backend Configuration

The application can be configured via `application.yml`. Key configuration options include:

- Annotation save settings
- Authentication settings
- CORS configuration

### Frontend Configuration

The Angular application can be configured through:
- Custom toolbar configurations
- Source document configuration

## Key Components

### Backend Components

- `JadiceWebViewerApplicationGS`: Main application entry point
- `SaveJadiceAnnotationsHandler`: Handles saving annotations to a remote server
- `CorsConfig`: Configures cross-origin resource sharing

### Frontend Components

- `AppComponent`: Main application component integrating jadice web viewer
- `WebviewerComponent`: Core component for document viewing

### Annotation Support

Users can add, edit, and save annotations to documents. The backend provides handlers for saving annotations to a configured server endpoint.

### Toolbar Customization

The toolbar can be customized with various actions:
- Navigation controls
- Zoom controls
- Rotation options
- Export options
- Annotation tools

## Additional Resources

For more detailed information, refer to the jadice web viewer documentation and API references.