import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { DataService } from './app/core/services/data.service';

bootstrapApplication(App, appConfig).then(async (ref) => {
  const ds = ref.injector.get(DataService);
  await ds.load();
  (window as any).__allIncidents = ds.incidents();
});
