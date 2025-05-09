# FEATURES.md

# Document Viewer Features

This document describes the key features of our document viewer application and how they are implemented.

## Table of Contents

1. [Document Loading](#document-loading)
2. [Annotation Management](#annotation-management)
3. [Save Functionality](#save-functionality)
4. [Authentication](#authentication)
5. [Redacted Document Export](#redacted-document-export)

## Document Loading

### Loading Documents via REST API

The application supports loading documents through a REST interface. Documents can be requested directly from the server using unique identifiers in the source object requested by the client.

**Implementation Details:**
- Documents are loaded using the web viewer defined source, which is sent to the backend server
- The viewer supports various document formats including PDF and TIFF
- Document loading is handled asynchronously to prevent UI blocking
- Error handling is implemented for cases where documents cannot be found or loaded

For this Getting Started guide the server uses a predefined built-in Document Data Provider called HttpSchemeDocumentDataProvider which is activated by turning on `uriProviderHttpEnabled: true` in the application.yml file of the backend.

For the authentication part it uses the configuration set in the `application.yml` file that looks like this:
```
webtoolkit:
  ddp:
    http:
      authentication:
        - host: localhost
          user: user1
          password: test
```

How does the interaction with the HttpSchemeDocumentDataProvider work?

The HttpSchemeDocumentDataProvider implements UriBasedDocumentDataProvider and is registered via @UriScheme({"http", "https"}) as our default specialized {@link UriBasedDocumentDataProvider} for HTTP and HTTP scheme.

It is initialized via a Factory method that is defined via:
```
@UriScheme({"http", "https"})
@ConditionalOnProperty(prefix = "webtoolkit", name = "uriProviderHttpEnabled", havingValue = "true")
```
That is why the application.yml file contains `uriProviderHttpEnabled: true` such that this mechanism is turned on.

## Annotation Management

### Loading and Saving Annotations in Jadice Format

The application allows users to add, edit, delete and save annotations to documents. All annotations in the Getting Started use the Jadice format

**Implementation Details:**
- Annotations are loaded automatically with documents when available (by default with the configured HttpSchemeDocumentDataProvider as mentioned above). @See the source definition in the frontend.
- The system supports various annotation types including:
    - Text annotations
    - Highlight annotations
    - Drawing annotations
    - Redaction annotations
- Annotations are stored in the Jadice XML format
- Annotation reading is also done via the HttpSchemeDocumentDataProvider based on the field annotationUrisList
  - The source thereby consists out of the uris and a list of annotationsUris for the document uri

## Save Functionality

### Save Button Implementation

The application features a dedicated "Save" menu entry to persist annotations to the server.

**Implementation Details:**
- Button is automatically enabled/disabled based on whether:
    - A document is currently loaded
- Upon successful save:
    - A confirmation alert is displayed to the user
- Save operations use the `SaveJadiceAnnotationsHandler` on the server side to persist the annotations.

**Technical Flow:**
1. User clicks the save button
2. Application generates a document snapshot
3. Application initiates a server conversation with required parameters
4. Server processes and stores the annotations to the test backend
5. Confirmation is displayed to the user (currently as window.alert)

This is realized by implementing the SaveAnnotationsHandler interface, which you can see in the code which is then registed in the application configuration class via:
```
final SaveJadiceAnnotationsHandler saveJadiceAnnotationsHandler = new SaveJadiceAnnotationsHandler();
saveJadiceAnnotationsHandler.setAnnotationSaveConfiguration(annotationSaveConfiguration);
saveAnnotationsHandlerHashMap.put("SaveJadiceAnnotationsHandler", saveJadiceAnnotationsHandler);
serverConfiguration.setSaveAnnotationHandlers(saveAnnotationsHandlerHashMap);
```

On the client side the action can then be called like this as seen in the app.component.ts file of the frontend.
```
const subscription = ServerConnection.get().initConversation(
    AppComponent.SAVE_ANNOS_MSG_NAME,
    {
        doc: dto,
        saveStreamId: "test101.xml",
        saveAnnotationsHandlerId: "SaveJadiceAnnotationsHandler",
        annoFormat: "JADICE"
    }
).pipe(tap(() => {
    window.alert("Annotations saved");
})).subscribe();
setTimeout(() => {
    subscription.unsubscribe();
}, 3000);
```

## Authentication

### Authentication Options

The application supports authentication against the document archive system.

**Implementation Details:**
- Basic Authentication is the primary authentication method
- Authentication settings are configurable through the application settings

## Redacted Document Export

### Exporting Documents with Redactions

The application allows users to export documents with applied redactions, ensuring sensitive information is properly removed from exported versions.

**Implementation Details:**
- Export supports Redacted PDF (with redactions permanently applied)
- Redaction process permanently removes content under redaction annotations
- Export function is available through:
    - The main toolbar's export menu
    - Context menu options on the document
- Export operations run on the server side to ensure consistent redaction

**Export Process:**
1. User applies a mask annotation (redaction annotation) on the document.
2. User selects "Export Redacted PDF" from the export menu
3. Document with mask annotations is sent to the server
4. Server applies redactions permanently
5. Redacted document is returned for download (No original content remains beneath redaction areas in the exported file)