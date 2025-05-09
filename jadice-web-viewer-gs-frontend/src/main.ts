import {enableProdMode} from "@angular/core";
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {AppModule} from "./root/app.module";
import {environment} from "./environments/environment";
import {preloadPrecursor} from "@levigo/webtoolkit-ng-client";

if (environment.production) {
    enableProdMode();
}

const serverURL = environment.production ? window.location.origin : window.location.origin + "/api";

preloadPrecursor({serverURL}).then(() => {
    platformBrowserDynamic().bootstrapModule(AppModule)
        .catch(err => console.error(err));
});
