import { Component, NgZone, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";
import jwt_decode from "jwt-decode";
import { HttpClient } from '@angular/common/http';
import {Router} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [
    trigger('enterTrigger', [
    state('fadeIn', style({
        opacity: '1',
        transform: 'translateY(20%)'
    })),
    
    transition('void => *', [style({opacity: '0'}), animate('800ms')])
    ])
  ]
})
export class LoginComponent implements OnInit {

  windowsSize: any;

  constructor(private ngZone: NgZone,private titleService:Title,private http:HttpClient,private router: Router,private cookieService: CookieService) { 
    this.titleService.setTitle("Road Management System");
    if(cookieService.check('adminId') != false   &&  cookieService.check('username') != false && cookieService.check('token') != false){
      this.router.navigateByUrl('');
    }
    cookieService.deleteAll()
  }

  ngOnInit(): void {
    this.S_setHeighwindowsAuto();
    this.F_autoSelectSizeWindows();
  }



  Username:any
  Password:any
  response: any
  statr = true
  HTTP_ADMIN_LOGIN(){
    let json = {username: this.Username, password: this.Password};
    this.http.post("http://20.198.233.53:1230/admin/login", JSON.stringify(json)).subscribe(response => {
      let login:any = response;
      
      this.SELETE_TOKEN(login)
      
    }, error => {
      console.log("fail");
      this.statr = false

    });
  } 
  SELETE_TOKEN(response: any) {
    var token = response.token
    var decoded: any = jwt_decode(token);
    if(decoded.login == true){
      this.cookieService.set('token', decoded.token);
      this.cookieService.set('adminId', decoded.admin_id);
      this.cookieService.set('username', this.Username);
      this.router.navigateByUrl('');
    }
  }


  F_autoSelectSizeWindows(){
    window.onresize = (e) =>
    {
        this.ngZone.run(() => {
          this.windowsSize = window.innerHeight;
        });
    };
   }
  
    S_setHeighwindowsAuto() {
      let styles = {
        'height': window.innerHeight-10 +'px',
      };
      
      return styles;
    }

}
