import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {
    DefaultActionGroups,
    DefaultActions,
    DefaultMenuActions,
    DefaultToolbar,
    DocumentSource,
    GWTDocumentWrapper,
    ServerConnection,
    Viewer
} from "@levigo/webtoolkit-ng-client";
import {
    combineLatest,
    filter,
    interval,
    map,
    of,
    ReplaySubject,
    startWith,
    Subject,
    switchMap,
    take,
    takeUntil,
    tap
} from "rxjs";
import {JadiceIcon} from "@levigo/jadice-web-icons";
import {
    MenuAction,
    MenuItemType,
    ToolbarConfig,
    ToolbarUtils
} from "@levigo/jadice-common-components";
import {Nullable} from "@levigo/utility-types";
import {I18NService} from "@levigo/ngx-translate-support";
import {ActivatedRoute, Router} from "@angular/router";
import {FeatureService, JWVRights, WebviewerComponent} from "@levigo/jadice-web-viewer";
import {TRANSLATE_ACTION_GROUP} from "@levigo/webtoolkit-ng-client/dist/defaults/actions/action-templates";

/**
 * The main application component.
 *
 * This component is the root of the application and is responsible for initializing the web viewer and toolbar configuration.
 * It also provides functionality for loading (as url in the source) and saving documents via the SAVE_ANNOS_MSG_NAME message.
 */
@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    standalone: false
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

    private static SAVE_ANNOS_MSG_NAME: string = "SAVE_ANNOS";

    /**
     * The document source for the web viewer.
     * @see source: In this case they are loaded from the test server via GET requests and Basic Auth.
     */
    source: Nullable<DocumentSource|any> = {
        uris: ["http://localhost:3000/PDFUA.pdf"],
        annotationUrisList: [["http://localhost:3000/test101.xml"]],
        password: null
    };

    /**
     * Flag to display the open file dialog, can be configured via the server as well.
     * @see displayOpenFileAtStartup: "false" in application.yml.
     */
    displayOpenFile: boolean = false;

    /**
     * The web viewer component.
     */
    @ViewChild("webviewer")
    webviewer!: WebviewerComponent;

    /**
     * The toolbar configuration for the web viewer.
     */
    toolbarConfig: ToolbarConfig<Viewer> | null = AppComponent.createDefaultNonFeatureConfig();

    /**
     * Subject that emits when the component is destroyed.
     */
    private readonly _destroyed$ = new Subject<void>();

    /**
     * Subject that emits the webviewer instance whenever it becomes available.
     * @private
     */
    private webviewer$: ReplaySubject<WebviewerComponent> = new ReplaySubject(1);

    /**
     * The rights object that provides license information for the viewer component to make some features available.
     */
    rights$: ReplaySubject<JWVRights> = new ReplaySubject(1);

    constructor(i18n: I18NService,
                private route: ActivatedRoute, private router: Router, private featureService: FeatureService) {
        i18n.init();
    }

    /**
     * Creates a default toolbar configuration without specific features.
     *
     * This static method generates a toolbar configuration that includes basic document
     * navigation, editing, zoom, and rotation controls, while excluding certain features
     * that might be present in the full default configuration (like open/save actions).
     *
     * Note: This is used until the configuration is provided by the server as part of the
     * viewer initialization.
     *
     * @returns {ToolbarConfig} A modified toolbar configuration object with limited functionality
     *
     * @static
     * @example
     * const toolbarConfig = MyComponent.createDefaultNonFeatureConfig();
     * this.viewer.setToolbarConfig(toolbarConfig);
     */
    static createDefaultNonFeatureConfig() {
        const auxiliaryActions = [...(DefaultToolbar.CONFIG.auxiliaryActions as any)];
        const actions = [
            ToolbarUtils.makeButton(DefaultActions.PAGE_FIRST),
            ToolbarUtils.makeButton(DefaultActions.PAGE_PREV),
            ToolbarUtils.makeButton(DefaultActions.PAGE_NEXT),
            ToolbarUtils.makeButton(DefaultActions.PAGE_LAST),
            ToolbarUtils.SEPARATOR,
            ToolbarUtils.makeButton(DefaultActions.UNDO),
            ToolbarUtils.makeButton(DefaultActions.REDO),
            ToolbarUtils.SEPARATOR,
            ToolbarUtils.makeButton(DefaultActions.ZOOM_IN),
            ToolbarUtils.makeButton(DefaultActions.ZOOM_OUT),
            ToolbarUtils.makeSelection(DefaultActionGroups.ADVANCED_ZOOM),
            ToolbarUtils.SEPARATOR,
            ToolbarUtils.makeSelection(DefaultActionGroups.FIX_ROTATE),
            ToolbarUtils.makeButton(DefaultActions.ROTATE_LEFT),
            ToolbarUtils.makeButton(DefaultActions.ROTATE_RIGHT),
        ];
        const menuItems: any = [];
        menuItems.push(...DefaultToolbar.CONFIG.menu.menuConfiguration.menuItems.slice(2))
        return {
            ...DefaultToolbar.CONFIG,
            menu: {
                ...DefaultToolbar.CONFIG.menu,
                menuConfiguration: {
                    menuItems
                }
            },
            actions,
            auxiliaryActions
        };
    }

    /**
     * Observable that configures the toolbar for the web viewer.
     *
     * This stream initializes and updates the toolbar configuration whenever
     * the webviewer instance becomes available. It sets up navigation controls,
     * editing tools, view options, and export functionality.
     *
     * @returns {Observable<void>} An observable that completes when the component is destroyed
     */
    updateToolbarConfig$ = combineLatest([this.webviewer$, this.rights$]).pipe(
        // Only proceed when we have a valid webviewer instance
        filter(([webviewer, _]) => !!webviewer),
        // Configure the toolbar when webviewer is available
        tap(([webviewer,_]) => {
            // Create auxiliary actions by extending the default configuration
            const auxiliaryActions = [...(DefaultToolbar.CONFIG.auxiliaryActions as any)];
            // Add custom mode switching actions
            auxiliaryActions.push(ToolbarUtils.makeButton(webviewer.SWITCH_MODE_ACTION));
            // Define main toolbar actions with navigation, editing, zoom and rotation controls
            const actions = [
                // Page navigation controls
                ToolbarUtils.makeButton(DefaultActions.PAGE_FIRST),
                ToolbarUtils.makeButton(DefaultActions.PAGE_PREV),
                ToolbarUtils.makeButton(DefaultActions.PAGE_NEXT),
                ToolbarUtils.makeButton(DefaultActions.PAGE_LAST),
                ToolbarUtils.SEPARATOR,
                // Edit history controls
                ToolbarUtils.makeButton(DefaultActions.UNDO),
                ToolbarUtils.makeButton(DefaultActions.REDO),
                ToolbarUtils.SEPARATOR,
                // Zoom controls
                ToolbarUtils.makeButton(DefaultActions.ZOOM_IN),
                ToolbarUtils.makeButton(DefaultActions.ZOOM_OUT),
                ToolbarUtils.makeSelection(DefaultActionGroups.ADVANCED_ZOOM),
                ToolbarUtils.SEPARATOR,
                // Rotation controls
                ToolbarUtils.makeSelection(DefaultActionGroups.FIX_ROTATE),
                ToolbarUtils.makeButton(DefaultActions.ROTATE_LEFT),
                ToolbarUtils.makeButton(DefaultActions.ROTATE_RIGHT),
            ];
            // Initialize menu items with file open action
            const menuItems: any = [{
                type: MenuItemType.ACTION,
                action: webviewer.OPEN_FILE_ACTION
            }];
            // Setup export functionality
            const exportMenuItems: MenuAction<Viewer>[] = [];
            actions.push(ToolbarUtils.SEPARATOR);
            const exportActions = [];
            // Configure various export options
            exportActions.push(DefaultActions.EXPORT_PDF);
            exportMenuItems.push(DefaultMenuActions.EXPORT_PDF);
            exportActions.push(DefaultActions.EXPORT_REDACTED_PDF);
            exportMenuItems.push(DefaultMenuActions.EXPORT_REDACTED_PDF);
            exportActions.push(DefaultActions.EXPORT_PDF_A);
            exportMenuItems.push(DefaultMenuActions.EXPORT_PDF_A);
            exportActions.push(DefaultActions.EXPORT_TIFF);
            exportMenuItems.push(DefaultMenuActions.EXPORT_TIFF);
            exportActions.push(DefaultActions.PRINT);
            // Create export action group and add to main actions
            const actionGroup = {
                icon: JadiceIcon.EXPORT_PDF,
                label: TRANSLATE_ACTION_GROUP("export"),
                actions: exportActions
            };
            actions.push(ToolbarUtils.makeSelection(actionGroup));
            // Add export submenu if we have export options
            if (exportMenuItems.length > 0) {
                menuItems.push({
                    type: MenuItemType.SUB_MENU,
                    label: {
                        translate: true,
                        content: "webtoolkitClient.menu.defaultSubMenus.export"
                    },
                    menuItems: exportMenuItems,
                });
            }
            // Add remaining default menu items
            menuItems.push(...DefaultToolbar.CONFIG.menu.menuConfiguration.menuItems.slice(2));
            menuItems.push({
                type: MenuItemType.ACTION,
                action: {
                    icon: JadiceIcon.DEFAULT_SAVE_ANNO_A,
                    label: {
                        translate: false,
                        content: "speichern"
                    },
                    /**
                     * Determines if the save button should be enabled
                     * @returns {Observable<boolean>} Observable that emits true if a document is loaded
                     */
                    isEnabled$: () => {
                        // Use interval to periodically check if viewer is available
                        return interval(150).pipe(
                            startWith(0), // Emit immediately on subscription
                            map(() => this.webviewer?.viewerComponent.getViewer()), // Get the viewer
                            filter(viewer => !!viewer), // Only continue if the viewer exists
                            take(1), // Take the first occurrence when viewer becomes available, then complete
                            switchMap(viewer => {
                                if (viewer) {
                                    // Check if a document is loaded
                                    return viewer.document$().pipe(
                                        map((doc: Nullable<GWTDocumentWrapper>) => {
                                            return doc !== null;
                                        })
                                    );
                                } else {
                                    return of(false);
                                }
                            })
                        );
                    },
                    // Handler for save action
                    handle: () => this.saveAnnotations()
                }
            });
            // Assemble the complete toolbar configuration
            this.toolbarConfig = {
                ...DefaultToolbar.CONFIG,
                menu: {
                    ...DefaultToolbar.CONFIG.menu,
                    menuConfiguration: {
                        menuItems
                    }
                },
                actions,
                auxiliaryActions
            };
        }),
        // Automatically unsubscribe when a component is destroyed
        takeUntil(this._destroyed$)
    ).subscribe();


    ngOnInit(): void {
        this.featureService.getRights().subscribe(
            // provides license information for the viewer component to make some features available
            // @see app.component.html
            (rights) => this.rights$.next(rights)
        );
    }

    /**
     * Angular lifecycle hook that initializes the webviewer and toolbar configuration after the view is initialized.
     *
     * This method performs two main functions:
     * 1. Updates the webviewer subject with the component's webviewer instance
     * 2. Configures the toolbar with custom and default menu items, actions, and auxiliary actions
     *
     * The Save button's enabled state is determined dynamically by checking
     * if a document is loaded in the viewer. This is handled through a reactive
     * pipeline that polls for viewer availability and then observes document state.
     */
    ngAfterViewInit(): void {
        this.webviewer$.next(this.webviewer);
        this.toolbarConfig = {
            ...DefaultToolbar.CONFIG,
            menu: {
                ...DefaultToolbar.CONFIG.menu,
                menuConfiguration: {
                    menuItems: [
                        {
                            type: MenuItemType.ACTION,
                            action: {
                                icon: JadiceIcon.DEFAULT_SAVE_ANNO_A,
                                label: {
                                    translate: false,
                                    content: "speichern"
                                },
                                isEnabled$: () => {
                                    // Use interval to periodically check if viewer is available
                                    return interval(150).pipe(
                                        startWith(0), // Emit immediately on subscription
                                        map(() => this.webviewer?.viewerComponent.getViewer()), // Get the viewer
                                        filter(viewer => !!viewer), // Only continue if the viewer exists
                                        take(1), // Take the first occurrence when viewer becomes available, then complete
                                        switchMap(viewer => {
                                            if (viewer) {
                                                return viewer.document$().pipe(
                                                    map((doc: Nullable<GWTDocumentWrapper>) => {
                                                        return doc !== null;
                                                    })
                                                );
                                            } else {
                                                return of(false);
                                            }
                                        })
                                    );
                                },
                                handle: () => this.saveAnnotations()
                            }
                        },
                        {
                            type: MenuItemType.ACTION,
                            action: this.webviewer.OPEN_FILE_ACTION
                        },
                        ...DefaultToolbar.CONFIG.menu.menuConfiguration.menuItems.slice(1)
                    ]
                }
            },
            actions: [
                ToolbarUtils.makeButton(this.webviewer.OPEN_FILE_ACTION),
                ToolbarUtils.SEPARATOR,
                ...(DefaultToolbar.CONFIG.actions as any),
                ToolbarUtils.SEPARATOR,
                ToolbarUtils.makeButton(DefaultActions.MAGNIFYING_GLASS),
                ToolbarUtils.makeButton(DefaultActions.CROSSHAIR)
            ],
            auxiliaryActions: [
                ...(DefaultToolbar.CONFIG.auxiliaryActions as any),
                ToolbarUtils.makeButton(this.webviewer.SWITCH_MODE_ACTION)
            ]
        };
    }

    ngOnDestroy() {
        this._destroyed$.complete();
    }

    /**
     * Saves the current document annotations to the server.
     *
     * This method retrieves the current viewer instance, extracts document data as a DTO,
     * and initiates a server conversation to save the annotations. It shows an alert
     * when annotations are successfully saved and automatically cleans up the subscription
     * after 3 seconds to prevent memory leaks.
     *
     * @remarks
     * The server conversation uses the following parameters:
     * - doc: The document DTO containing all annotation data
     * - saveStreamId: Identifier for the saved file ("test101.xml")
     * - saveAnnotationsHandlerId: The server-side handler ID ("SaveJadiceAnnotationsHandler")
     * - annoFormat: The format for saving annotations ("JADICE")
     *
     * The subscription is automatically unsubscribed after 3 seconds to prevent
     * long-running subscriptions that could cause memory leaks. Could be improved
     * by using a more sophisticated approach.
     */
    private saveAnnotations() {
        this.webviewer.viewerComponent.getViewer$().pipe().forEach((v: any) => {
            let dto = v?.getDocument()?.toSnapshot().toDTO();
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
        });
    }

    /**
     * Opens a document in the web viewer.
     *
     * @param {string} documentPath The uri path to the document to open
     */
    openDoc(documentPath: string) {
        if (documentPath) {
            if (this.displayOpenFile)
                this.displayOpenFile = false;
            this.setUrl(documentPath)
            this.router.navigate(['/'], {replaceUrl: true});
        } else
            this.router.navigate(['/']);
    }

    /**
     * Sets the document source for the web viewer.
     *
     * @param url The uri path to the document to open
     * @param password The password for the document, if any
     */
    setUrl(url: string) {
        this.source = {
            uri: url,
            password: null
        };
    }
}
