import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AgmCoreModule } from '@agm/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';

import {AccordionModule} from 'primeng/accordion';     //accordion and accordion tab 
import {ButtonModule} from 'primeng/button';
import {SplitterModule} from 'primeng/splitter';
import {MenubarModule} from 'primeng/menubar';
import {InputTextModule} from 'primeng/inputtext';
import {AvatarModule} from 'primeng/avatar';
import {AvatarGroupModule} from 'primeng/avatargroup';
import {TreeTableModule} from 'primeng/treetable';
import {ProgressBarModule} from 'primeng/progressbar';
import {DialogModule} from 'primeng/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {CalendarModule} from 'primeng/calendar';
import {FileUploadModule} from 'primeng/fileupload';
import {DropdownModule} from 'primeng/dropdown';
import {CheckboxModule} from 'primeng/checkbox';
import {CardModule} from 'primeng/card';
import {PasswordModule} from 'primeng/password';

import { HttpClientModule } from '@angular/common/http';
import { GooglemaphomeComponent } from './googlemaphome/googlemaphome.component';

import { CookieService } from 'ngx-cookie-service';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    GooglemaphomeComponent
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBwnti2r615GpzS8vrpuGG4uXaK8VGG4kM',
      libraries: ['drawing']
    }),
    BrowserModule,
    AppRoutingModule,
    AccordionModule,
    ButtonModule,
    CardModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    HttpClientModule,
    MenubarModule,
    DialogModule,
    FileUploadModule,
    DropdownModule,
    CheckboxModule,
    CalendarModule,
    AvatarModule,
    AvatarGroupModule,
    TreeTableModule,
    BrowserAnimationsModule,
    ProgressBarModule,
    SplitterModule
    
    
    
  ],
  providers: [CookieService ,{provide: LocationStrategy, useClass: HashLocationStrategy} ],
  bootstrap: [AppComponent]
})
export class AppModule { }
