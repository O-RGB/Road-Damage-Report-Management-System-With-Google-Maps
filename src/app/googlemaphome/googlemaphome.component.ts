import { Component, InjectFlags, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Marker } from './INTERFACES/MARKER_ARRAY';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Title } from '@angular/platform-browser';
import {MenuItem, PrimeIcons} from 'primeng/api';

@Component({
  selector: 'app-googlemaphome',
  templateUrl: './googlemaphome.component.html',
  styleUrls: ['./googlemaphome.component.css']
})
export class GooglemaphomeComponent implements OnInit {


  username:any
  userid:any
  token:any

  constructor(private ngZone: NgZone,private http:HttpClient,private router: Router,private cookieService: CookieService,private titleService:Title) {
    this.titleService.setTitle("Road Management System");

    if(cookieService.check('adminId') != false   &&  cookieService.check('username') != false && cookieService.check('token') != false){
      this.userid = this.cookieService.get('adminId');
      this.username = this.cookieService.get('username');
      this.token = this.cookieService.get('token');
    }else{
      cookieService.deleteAll();
      this.router.navigateByUrl('login');

    }
  
    this._MARKER_ARRAY_TEMP = [[[],[],[],[]],[[],[],[],[]]]
    this.HTTP_SELETE_MARKER_USER();
    this.HTTP_SELETE_MARKER_ADMIN();
    this.MARKER_TIME()


  }
  ngOnInit(): void {
    this.S_setHeighwindowsW();
    this.F_autoSelectSizeWindows();
    this.MANU_BAR_CREATE();

  }

  Logout(){
    this.cookieService.deleteAll();
    this.router.navigateByUrl('login');
  }

  _REGISTER_USERNAME: any
  _REGISTER_PASSWORD: any
  Register(){
    this._DISPLAY_REGISTER = false;
    this._DISPLAY_ACCOUNT = false;

    let json = { username: this._REGISTER_USERNAME, password: this._REGISTER_PASSWORD};
    this.http.post("http://20.198.233.53:1230/admin/register", JSON.stringify(json)).subscribe(response => {
      console.log(response)
    }, error => {
      console.log("fail");
    });

  }


  ////////////////////////MARKER//////////////////////////////////
  _MARKER_ARRAY_TEMP : any[] = [[[],[],[],[]],[[],[],[],[]]]
  _MARKER_ARRAY      : any[] = [[[],[],[],[]],[[],[],[],[]]]

  _MARKER_DETEIL_BY_ID: any = [];

  _MARKER_SETTING_VALUE_DISPLAY: any[] = ["PH","CK","RP","NA"]
  _MARKER_SETTING_VALUE_MODE: any[] = ["USER","ADMIN"]
  _MARKER_VALUE_FORME = false

  _MARKER_DETEIL_COLOR = [{red: "#EC7063", blue: "#3498DB", green: "#58D68D", black: "#000000"}]
  _MARKER_DETEIL = [
    {main : "หลุมบนถนน", level : "", mode: "0", value : 0, color : ""},
    {main : "ถนนแตกร้าว", level : "", mode: "1", value : 0, color : ""},
    {main : "ถนนซ่อมป่ะ", level : "", mode: "2", value : 0, color : ""},
    {main : "N/A", level : "", mode: "3", value : 0, color : ""}
  ]

  //โหลดฟังก์มาร์เกอร์ทั้งหมด
  MARKER_LOAD(re: any,Mode: any){
    
    re.forEach((element: any) => { 
      
      let mode = "";
      let maskerColoer = "";
      if(element.crack_type == 0) {
        mode = "plot";
        maskerColoer = "redMarker";
      }
      else if(element.crack_type == 1) {
        mode = "crack";
        maskerColoer = "blueMarker";
      }
      else if(element.crack_type == 2){ 
        mode = "repair";
        maskerColoer = "greenMarker";
      }
      else if(element.crack_type == 3){ 
        mode = "N/A";
        maskerColoer = "blackMarker";
      }


      let photoPath  = ""
      let user_id = ''
      if(Mode == "USER"){
        photoPath = "photo/"
        user_id = element.user_id_fk
      }
      else if(Mode == "ADMIN"){
        photoPath = "photo/admin/"
        user_id = element.admin_id_fk
      }
      
      let MakerList:Marker = ({
        id: element.road_id,
        lat: Number(element.gps_latitude), 
        lng: Number(element.gps_longitude), 
        name: "test1", 
        mode: mode, 
        url:"assets/"+maskerColoer+".svg" ,
        date: new Date(element.date),
        by: Mode,
        imgPath: photoPath,
        predict: element.predict,
        repaired: element.repaired,
        user_id: user_id,
        state: element.state
      })

      
      if(Mode == "USER"){       this._MARKER_ARRAY_TEMP[0][element.crack_type].push(MakerList)}
      else if(Mode == "ADMIN"){ this._MARKER_ARRAY_TEMP[1][element.crack_type].push(MakerList)}
    });
    
    this.MARKER_SETTING(this._MARKER_SETTING_VALUE_MODE,this._MARKER_SETTING_VALUE_DISPLAY)
  }

  //กรองมาร์เกอร์ตาม Setting
  MARKER_SETTING(mode: any, display:any){
    this._MARKER_ARRAY = [[[],[],[],[]],[[],[],[],[]]]
    if(mode.indexOf("USER") != -1){

      if(display.indexOf("PH")!= -1) {
          let _MARKER_ARRAY = this.MARKER_CHECK_TIME(this._MARKER_ARRAY_TEMP[0][0])
          _MARKER_ARRAY = this.MARKER_CHECK_ME(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_PREDICT(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_MANAGER(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_REPAIRED(_MARKER_ARRAY)
          this._MARKER_ARRAY[0][0] = _MARKER_ARRAY
      }
      else this._MARKER_ARRAY[0][0] = []

      if(display.indexOf("CK")!= -1) {
          let _MARKER_ARRAY = this.MARKER_CHECK_TIME(this._MARKER_ARRAY_TEMP[0][1])
          _MARKER_ARRAY = this.MARKER_CHECK_ME(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_PREDICT(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_MANAGER(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_REPAIRED(_MARKER_ARRAY)
          this._MARKER_ARRAY[0][1] = _MARKER_ARRAY
      }
      else this._MARKER_ARRAY[0][1] = []
      
      if(display.indexOf("RP")!= -1) {
          let _MARKER_ARRAY = this.MARKER_CHECK_TIME(this._MARKER_ARRAY_TEMP[0][2])
          _MARKER_ARRAY = this.MARKER_CHECK_ME(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_PREDICT(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_MANAGER(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_REPAIRED(_MARKER_ARRAY)
          this._MARKER_ARRAY[0][2] = _MARKER_ARRAY
      }
      else this._MARKER_ARRAY[0][2] = []
      
      if(display.indexOf("NA")!= -1) {
          let _MARKER_ARRAY = this.MARKER_CHECK_TIME(this._MARKER_ARRAY_TEMP[0][3])
          _MARKER_ARRAY = this.MARKER_CHECK_ME(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_PREDICT(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_MANAGER(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_REPAIRED(_MARKER_ARRAY)
          this._MARKER_ARRAY[0][3] = _MARKER_ARRAY
      }
      else this._MARKER_ARRAY[0][3] = []
    }else{
      this._MARKER_ARRAY[0] = [[],[],[],[]]
    }

    if(mode.indexOf("ADMIN")!= -1){
      
      if(display.indexOf("PH")!= -1) {
          let _MARKER_ARRAY = this.MARKER_CHECK_TIME(this._MARKER_ARRAY_TEMP[1][0])
          _MARKER_ARRAY = this.MARKER_CHECK_ME(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_PREDICT(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_MANAGER(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_REPAIRED(_MARKER_ARRAY)
          this._MARKER_ARRAY[1][0] = _MARKER_ARRAY
      }
      else this._MARKER_ARRAY[1][0] = []
      
      if(display.indexOf("CK")!= -1) {
          let _MARKER_ARRAY = this.MARKER_CHECK_TIME(this._MARKER_ARRAY_TEMP[1][1])
          _MARKER_ARRAY = this.MARKER_CHECK_ME(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_PREDICT(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_MANAGER(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_REPAIRED(_MARKER_ARRAY)
          this._MARKER_ARRAY[1][1] = _MARKER_ARRAY
      }
      else this._MARKER_ARRAY[1][1] = []
      
      if(display.indexOf("RP")!= -1) {
          let _MARKER_ARRAY = this.MARKER_CHECK_TIME(this._MARKER_ARRAY_TEMP[1][2])
          _MARKER_ARRAY = this.MARKER_CHECK_ME(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_PREDICT(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_MANAGER(_MARKER_ARRAY)
          _MARKER_ARRAY = this.MARKER_CHECK_REPAIRED(_MARKER_ARRAY)
          this._MARKER_ARRAY[1][2] = _MARKER_ARRAY
      }
      else this._MARKER_ARRAY[1][2] = []

      if(display.indexOf("NA")!= -1) {
        let _MARKER_ARRAY = this.MARKER_CHECK_TIME(this._MARKER_ARRAY_TEMP[1][3])
        _MARKER_ARRAY = this.MARKER_CHECK_ME(_MARKER_ARRAY)
        _MARKER_ARRAY = this.MARKER_CHECK_PREDICT(_MARKER_ARRAY)
        _MARKER_ARRAY = this.MARKER_CHECK_MANAGER(_MARKER_ARRAY)
        _MARKER_ARRAY = this.MARKER_CHECK_REPAIRED(_MARKER_ARRAY)
        this._MARKER_ARRAY[1][3] = _MARKER_ARRAY
      }
      else this._MARKER_ARRAY[1][3] = []
    }else{
      this._MARKER_ARRAY[1] = [[],[],[],[]]
    }
  } 

  //กรองมาร์เกอร์ตาม เวลา
  MARKER_CHECK_TIME(element: any){
    if(this._MARKER_ALL_TIME == false){

      const _MARKER_ARRAY: any[] = []
      element.forEach((data: any) => {

        let newDate = data.date;
        newDate = new Date( newDate.getTime() - newDate.getTimezoneOffset() * -60000 ) 
        newDate.setHours(0,0,0,0);

        if( newDate.getDate() == this._MARKER_TIME.getDate() &&
            newDate.getMonth() == this._MARKER_TIME.getMonth() &&
            newDate.getFullYear() == this._MARKER_TIME.getFullYear() ){
          _MARKER_ARRAY.push(data)
        }
      });
      return _MARKER_ARRAY

    }else{
      return element
    }
  }

  
  //กรองมาร์เกอร์ตาม ชื่อ Admin
  MARKER_CHECK_ME(element: any){
      if(this._MARKER_VALUE_FORME==true){
        const _MARKER_ARRAY: any[] = []
          element.forEach((data: any) => {
            if(data.user_id == this.userid){//user Login
              _MARKER_ARRAY.push(data)
            }
          });
          return _MARKER_ARRAY
      }
      return element
  }

  //กรองมาร์เกอร์ที่ระบบตรวจสอบแล้วเท่านั้น
  _MARKER_PREDICT = false
  MARKER_CHECK_PREDICT(element: any){
    if(this._MARKER_PREDICT==true){
      const _MARKER_ARRAY: any[] = []
        element.forEach((data: any) => {

          if(data.predict == 1){
            _MARKER_ARRAY.push(data)
          }
        });

        return _MARKER_ARRAY
    }

    return element
  }
  
  //กรองมาร์เกอร์ที่เจ้าหน้าที่ตรวจสอบแล้วเท่านั้น
  _MARKER_MANAGER = false
  MARKER_CHECK_MANAGER(element: any){
    if(this._MARKER_MANAGER==true){
      const _MARKER_ARRAY: any[] = []
        element.forEach((data: any) => {

          if(data.state == 1){
            _MARKER_ARRAY.push(data)
          }
        });

        return _MARKER_ARRAY
    }

    return element
  }

  //กรองมาร์เกอร์ที่เจ้าหน้าได้ซ่อมถนนจริง ๆ แล้ว
  _MARKER_REPAIRED = false
  MARKER_CHECK_REPAIRED(element: any){
    if(this._MARKER_REPAIRED==true){
      const _MARKER_ARRAY: any[] = []
        element.forEach((data: any) => {

          if(data.repaired == 1){
            _MARKER_ARRAY.push(data)
          }
        });

        return _MARKER_ARRAY
    }

    return element
  }


  
  //ตรวจสอบเมื่อ Check box เวลาทั้งหมดออก
  _MARKER_ALL_TIME: boolean = true
  _MARKER_CALEN_TIME: boolean = true
  MARKER_CHECKBOX_CH(){
    if(this._MARKER_ALL_TIME == true){
      this._MARKER_CALEN_TIME = true
    }else{
      this._MARKER_CALEN_TIME = false
    }
  }

  //SELETE เวลาปัจจุบันของเครื่อง
  _MARKER_TIME: any
  MARKER_TIME(){
    this._MARKER_TIME = new Date();
    this._MARKER_TIME.setHours(0,0,0,0);
  }

  //เมื่อมีการกด Save ของการตั้งค่า
  MARKER_SETTING_SAVE(){
    this._MARKER_ARRAY_TEMP = [[[],[],[],[]],[[],[],[],[]]]
    this._MARKER_ARRAY = [[[],[],[],[]],[[],[],[],[]]]
    this.HTTP_SELETE_MARKER_USER();
    this.HTTP_SELETE_MARKER_ADMIN();
    this.MARKER_SETTING(this._MARKER_SETTING_VALUE_MODE,this._MARKER_SETTING_VALUE_DISPLAY)

    
  }
  
  _RPAD_DETEIL_TYPE: any = [{name: 'หลุม'},{name: 'ถนนแตก'},{name: 'ถนนซ่อมปะ'},{name: 'N/A'}];
  _MARKER_DETEIL_TYPE_CHENGE: any= []
  MARKER_DETEIL_TYPE_SAVE(road_id: any,mode: any){
    
    let index: any
    if(this._MARKER_DETEIL_TYPE_CHENGE.name == 'หลุม') index = 0
    else if(this._MARKER_DETEIL_TYPE_CHENGE.name == 'ถนนแตก') index = 1
    else if(this._MARKER_DETEIL_TYPE_CHENGE.name == 'ถนนซ่อมปะ') index = 2
    else if(this._MARKER_DETEIL_TYPE_CHENGE.name == 'N/A') index = 3

    let str: any
    if(mode == "photo/") str = "USER"
    else if(mode == "photo/admin/") str = "ADMIN"

    let json = { predict: 1, state: 1, road_id: road_id, crack_type: index, mode: str };
    this.http.post("http://20.198.233.53:1230/marker/add", JSON.stringify(json)).subscribe(response => {
      console.log(json)
      console.log(response)
      this.HTTP_SELETE_MARKER_USER();
      this.HTTP_SELETE_MARKER_ADMIN();
    }, error => {
      console.log("fail");
    });
  }

  MARKER_CONVERT(mode: any,str:any){

    let string: any
    let index: any
    if(mode == "reverse"){
      if(str == '0'){
        string = "หลุม"
      }else if(str == '1'){
        string = "ถนนแตก"
      }else if(str == '2'){
        string = "ถนนซ่อมปะ"
      }else if(str == '3'){
        string = "N/A"
      }
      return string
    }else{

      if(str == 'หลุม'){
        index = 0
      }else if(str == 'ถนนแตก'){
        index = 1
      }else if(str == 'ถนนซ่อมปะ'){
        index = 2
      }else if(str == 'N/A'){
        index = 3
      }
      return index
    }

    
  }


  ////////////////////////MANU_BAR//////////////////////////////////
  items: any = [];

  MANU_BAR_CREATE(){
    this.items = [
      {label: 'Open',icon: 'pi pi-file-o', command: (e: any) =>{this.UPLOAD_DIGILOG_TEXT()}},
      {label: 'Options',icon: 'pi pi-cog', command: (e: any) =>{this.DISPLAY_OPTIONS()}},
    ]
          
  }
  ////////////////////////ROAD_DETECTOR//////////////////////////////////

  _RPAD_TYPE: any = [{name: 'หลุม'},{name: 'ถนนแตก'},{name: 'ถนนซ่อมปะ'},{name: 'ลบ'}];
  _TEXT_STRING_TEST: any = []

  ROAD_DETECTOR_TEXT(){
    const array: any = []
    let Line = this._TEXT_STRING.split("\r\n")
    Line.forEach((LineNew: any,index: any) => {
      if(index != Line.length-1){
        let Conma = LineNew.split(", ")
        console.log(Conma[2])
        if (Conma[2].includes('pothole')) { 
          Conma[2] = {name: "หลุม"}
        }
        else if (Conma[2].includes('crack')) { 
          Conma[2] = {name: "ถนนแตก"}
        }
        else if (Conma[2].includes('repai')) { 
          Conma[2] = {name: "ถนนซ่อมปะ"}
        }
        
        array.push(Conma)
      }
    });
    this._TEXT_STRING_TEST = array
    this._DISPLAY_UPLOAD =  false; 
    this.UPLOAD_DIGILOG_ROAD_DETECTOR()
    
  }

  SAVE_ROAD_DETECTOR_BASE64_TO_FORM(dataURI: any) {
    const byteString = window.atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });    
    return blob;
  }

  SAVE_ROAD_DETECTOR(){
    
    this._TEXT_STRING_TEST.forEach((element: any,index: any) => {
      
        if (!(this._TEXT_STRING_TEST[index][2].name.includes('ลบ') && index != this._TEXT_STRING_TEST.length-1)) { 

            const base64 = this._TEXT_STRING_TEST[index][3]
            const imageName = 'name.png';
            const imageBlob = this.SAVE_ROAD_DETECTOR_BASE64_TO_FORM(base64);
            const file = new File([imageBlob], imageName, { type: 'image/png' });
            const formData = new FormData();

            if (this._TEXT_STRING_TEST[index][2].name.includes('หลุม')) { 
                this._TEXT_STRING_TEST[index][2] = "0"
            }
            else if (this._TEXT_STRING_TEST[index][2].name.includes('ถนนแตก')) { 
                this._TEXT_STRING_TEST[index][2] = "1"
            }
            else if (this._TEXT_STRING_TEST[index][2].name.includes('ถนนซ่อมปะ')) { 
                this._TEXT_STRING_TEST[index][2] = "2"
            }

            formData.append('file', file, file.name);
            formData.append('adminid', "1");
            formData.append('gps_latitude', this._TEXT_STRING_TEST[index][0]);
            formData.append('gps_longitude', this._TEXT_STRING_TEST[index][1]);
            formData.append('crack_type',  this._TEXT_STRING_TEST[index][2]);

            this.http.post("http://20.198.233.53:1230/admin/upload_file", formData).subscribe(response => {
                console.log(response)
                this._DISPLAY_ROAD_DETECTOR = false
                
            }, err => {
                console.log(err)
            });
            console.log(formData)

        }
    });

    this.HTTP_SELETE_MARKER_USER();
    this.HTTP_SELETE_MARKER_ADMIN();
  }


  _RPAD_TYPE_CHANGE(event : any,index: any){
    this._TEXT_STRING_TEST[index][2] = event.value
  }
  _READ_FILE = true
  _TEXT_STRING : any = ""
    readFile(event: any,fubauto: any) {
    let files =  event.files;
    this._READ_FILE = false
    fubauto.chooseLabel = files[0].name
    for (var index = 0; index <  files.length; index++) {
        let  reader  =   new FileReader(); 
          reader.onload  =  async ()  =>  { 
            this._TEXT_STRING =  reader.result
        }
        reader.readAsText(files[index]);
    };
    fubauto.clear()
  }

  ////////////////////////HTTP//////////////////////////////////


  HTTP_SELETE_MARKER_USER(){
    this.http.get("http://20.198.233.53:1230/select/road/user/all")
    .subscribe(re => {
      var MARKER = Object.values(re);
      this.MARKER_LOAD(MARKER,"USER")
      console.log(MARKER)
    }, err => {
      console.log("re" + JSON.stringify(err));
    });
    
  } 

  HTTP_SELETE_MARKER_ADMIN(){
    this.http.get("http://20.198.233.53:1230/select/road/admin/all")
    .subscribe(re => {
      var MARKER = Object.values(re);
      this.MARKER_LOAD(MARKER,"ADMIN")
    }, err => {
      console.log("re" + JSON.stringify(err));
    });
  }


  
  
  HTTP_SELETE_BY_ID(id: any,mode: any,infowindow: any,closeWindwos = false){
    console.log(id,mode,infowindow,closeWindwos)
    console.log(this._MARKER_DETEIL_BY_ID)
    this.HTTP_SELETE_BY_ID_SELETE(id,mode)
    if(closeWindwos){
      this._MARKER_DETEIL_BY_ID = []
      this._DISPLAY_DETEIL = true
    }
  }

  HTTP_SELETE_BY_ID_SELETE(id: any,mode: any,shownow = false){
    if(mode == "USER"){
      this.http.get("http://20.198.233.53:1230/road/select/id/"+id)
      .subscribe(re => {
        var MARKER = Object.values(re);
        console.log(MARKER)
        MARKER[0].by = "photo/"
        this._MARKER_DETEIL_BY_ID = MARKER
        this._MARKER_DETEIL_TYPE_CHENGE = {name: this.MARKER_CONVERT("reverse",MARKER[0].crack_type)}

      }, err => {
        console.log("re" + JSON.stringify(err));
      });
    }
    else if(mode == "ADMIN"){
      this.http.get("http://20.198.233.53:1230/road/select/id/admin/"+id)
      .subscribe(re => {
        var MARKER = Object.values(re);
        console.log(MARKER)
        MARKER[0].by ="photo/admin/"
        this._MARKER_DETEIL_BY_ID = MARKER
        this._MARKER_DETEIL_TYPE_CHENGE = {name: this.MARKER_CONVERT("reverse",MARKER[0].crack_type)}
      }, err => {
        console.log("re" + JSON.stringify(err));
      });
    }

    if(shownow == true){
      this._MARKER_DETEIL_BY_ID = []
      this._DISPLAY_DETEIL = true
    }
  }



  

  ////////////////////////Tools//////////////////////////////////

  TOOLS_MOVE(){
    this._LAYER_SELETEION_ARRAY = []
    let drawingManager = this.drawingManager
    drawingManager.setDrawingMode(null);
  }
  TOOLS_DRAW(){
    let drawingManager = this.drawingManager
    drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    
  }
  TOOLS_LAYER_POLYGON(){

  }
  onNodeSelect(){
    this._LAYER_SELETEION_ARRAY.forEach((OnSelete: any) => {
      this._LAYER_ARRAY.forEach((OnArray: any) => {
        if(OnSelete.data.name == OnArray.data.name){
          OnArray.data.obj.setEditable(true);
          OnArray.data.obj.setDraggable(true);
          this._LAYER_SELETEION_ARRAY.push(OnArray.data.obj)
          this.LAYER_CLICK_POLYGON_AND_SELETEION_ARRAY(OnArray.data.obj);
          GooglemaphomeComponent.STATIC_NOW_SELETEION_POLYGON = OnArray.data.obj
          this.CAL_MARKER_CLASSIFIER(this._MARKER_ARRAY,OnArray.data.obj)
        }
        else{
          OnArray.data.obj.setEditable(false);
          OnArray.data.obj.setDraggable(false);
        }
      });
    });
  }
  TOOLS_DELETE_ARRAY(){
    
      this._LAYER_ARRAY.forEach((OnArray: any,index: any) => {
        if(GooglemaphomeComponent.STATIC_NOW_SELETEION_POLYGON == OnArray.data.obj){
          this._LAYER_ARRAY.splice(index, 1);
          this._LAYER_SELETEION_ARRAY = []
          let drawingManager = this.drawingManager
          drawingManager.setDrawingMode(null);
        }
      });
      this._LAYER_ARRAY = Object.values(this._LAYER_ARRAY);
  }




  /////////////////////////LAYER/////////////////////////////////
  cols: any = [ 
    { field: 'name', header: 'Name' },
    { field: 'size', header: 'Size' }
  ];
  _LAYER_SELETEION_ARRAY: any = [];
  _LAYER_ARRAY: any = [];

  LAYER_CREATE(POLYGON:google.maps.Polygon){

    let test: any = [
      {
        "data":{
          "name":"Layer"+(Number(this._LAYER_ARRAY.length)+1),
          "size":"Marker ",
          "obj":POLYGON
        },
      },
    ]
    var ArrayMain = Object.values(this._LAYER_ARRAY);
    var liker = Object.values(test);
    const ttt = ArrayMain.concat(liker);
    this._LAYER_ARRAY = ttt
  }
  LAYER_CLICK_POLYGON_AND_SELETEION_ARRAY(FK_POLYGON : google.maps.Polygon){
     
    this._LAYER_ARRAY.forEach((OnArray: any) => {
      if(FK_POLYGON == OnArray.data.obj){
        this._LAYER_SELETEION_ARRAY = [];
        this._LAYER_SELETEION_ARRAY.push(OnArray)
      }
    });

  }



  /////////////////////////GMAP/////////////////////////////////
  options : any;
  drawingManager : any;
  map: any;

  public mapReadyHandler(map: any): void { //main Map
    this.map = map
    this.initDrawingManager()
    this.getPolygonCoordinates();
    let drawingManager = this.drawingManager
    google.maps.event.addListener(drawingManager, 'drawingmode_changed', this.DRAW_REMOVEALL_SELETE);
    google.maps.event.addListener(map, 'click', (e) =>{
      // this._LAYER_SELETEION_ARRAY = null
      // this.DRAW_REMOVEALL_SELETE();  
    });
  }
  initDrawingManager() { //Setting Gmap

    this.options = {
      drawingControl: false,
      drawingControlOptions: {
        drawingModes: ["polygon"]
      },
      polygonOptions: {
        draggable: true,
        editable: true,
      },
      drawingMode: google.maps.drawing.OverlayType.POLYGON
    };
    this.drawingManager = new google.maps.drawing.DrawingManager(this.options);
    this.drawingManager.setMap(this.map);
  }
  getPolygonCoordinates() { //Function Tools Gmap
    var arrMarKer = this._MARKER_ARRAY
      google.maps.event.addListener(this.drawingManager, 'polygoncomplete',  (POLYGON) => {
          this.DRAW_SELETEION_ELEMENT(POLYGON);
          this.LAYER_CREATE(POLYGON);
          this.onNodeSelect();
          this.CAL_MARKER_CLASSIFIER(arrMarKer,POLYGON)

          google.maps.event.addListener(POLYGON, 'click',  (e) =>{
            this.DRAW_SELETEION_ELEMENT(POLYGON);
            // this.onNodeSelect();
            this.LAYER_CLICK_POLYGON_AND_SELETEION_ARRAY(POLYGON);
            this.CAL_MARKER_CLASSIFIER(arrMarKer,POLYGON)
            
            

          }); 
          google.maps.event.addListener(POLYGON, 'rightclick', 
          this.DRAW_DELETE_NOTE
          );
          google.maps.event.addListener(POLYGON.getPath(), 'set_at', (e) =>{
            this.CAL_MARKER_CLASSIFIER(arrMarKer,POLYGON)
          });
          google.maps.event.addListener(POLYGON.getPath(), 'insert_at', (e) =>{
            this.CAL_MARKER_CLASSIFIER(arrMarKer,POLYGON)
          });
          google.maps.event.addDomListener(document.getElementById('delete') as HTMLElement, 'click', (e) =>{
            this.DRAW_DELETE_POLYGON();
            this.TOOLS_DELETE_ARRAY()
          });
          // this.LAYER_CLICK_POLYGON_AND_SELETEION_ARRAY(POLYGON);
          
          
        
      });
  }

  /////////////////////////////Calculator/////////////////////////////////////////
  _TEMP_TEST_P:any[] = []
  _TEMP_TEST_C:any[] = []
  _TEMP_TEST_R:any[] = []
  _TEMP_TEST_N:any[] = []
  CAL_MARKER_CLASSIFIER(FK_arrMarKer:any, FK_poLyGon:any) {
    // 0 = หลุมบนถนน (plot), 1 = ถนนแตกร้าว (road), 2 = ถนนซ่อมป่ะ (repair)
    var marKerCount: any[] = [0,0,0,0]
    this._TEMP_TEST_P = []
    this._TEMP_TEST_C = []
    this._TEMP_TEST_R = []
    this._TEMP_TEST_N = []
    
          FK_arrMarKer.forEach((USER_ADMIN: any) => {
            USER_ADMIN.forEach((TYPE: any[]) => {
              TYPE.forEach((element: any) => {

                let LatLng = new google.maps.LatLng({ lat: element.lat, lng: element.lng })
                if (google.maps.geometry.poly.containsLocation(LatLng, FK_poLyGon)) {
                  if(element.mode == "plot") {marKerCount[0]++;this._TEMP_TEST_P.push(element)}
                  else if(element.mode == "crack") {marKerCount[1]++;this._TEMP_TEST_C.push(element)}
                  else if(element.mode == "repair") {marKerCount[2]++;this._TEMP_TEST_R.push(element)}
                  else if(element.mode == "N/A") {marKerCount[3]++;this._TEMP_TEST_N.push(element)}

              }});
              
            });
            
          });
         
    this.CAL_MARKER_PUSH(marKerCount);
    this._LAYER_ARRAY.forEach((OnArray: any) => {
      if(GooglemaphomeComponent.STATIC_NOW_SELETEION_POLYGON == OnArray.data.obj){
        OnArray.data.size = "Marker "+ (marKerCount[0]+marKerCount[1]+marKerCount[2]+marKerCount[3])
      }
    });
    this._LAYER_ARRAY = Object.values(this._LAYER_ARRAY);
  }

  CAL_MARKER_PUSH(FK_marKerCount:any){
    var markerPercent: any[] = [
      FK_marKerCount[0],
      FK_marKerCount[1],
      FK_marKerCount[2],
      FK_marKerCount[3]
    ]
    if(isNaN((markerPercent[0])) || isNaN((markerPercent[1])) || isNaN((markerPercent[2])) || isNaN((markerPercent[3]))){
      markerPercent[0] = 0; markerPercent[1] = 0; markerPercent[2] = 0; markerPercent[3] = 0
    } 
    markerPercent.forEach((e: any, index: any) => {
      this._MARKER_DETEIL[index].value = markerPercent[index]

    });
    this._MARKER_DETEIL[0].color = this._MARKER_DETEIL_COLOR[0].red
    this._MARKER_DETEIL[1].color = this._MARKER_DETEIL_COLOR[0].blue
    this._MARKER_DETEIL[2].color = this._MARKER_DETEIL_COLOR[0].green
    this._MARKER_DETEIL[3].color = this._MARKER_DETEIL_COLOR[0].black
  }

/////////////////////////////UI Draw/////////////////////////////////////////

  static STATIC_NOW_SELETEION_POLYGON: any;

  //Main
  DRAW_SELETEION_ELEMENT(POLYGON: any){
    this.DRAW_REMOVEALL_SELETE();
    POLYGON.setEditable(true);
    POLYGON.setDraggable(true);
    GooglemaphomeComponent.STATIC_NOW_SELETEION_POLYGON = POLYGON
    this.onNodeSelect();
  }
  DRAW_REMOVEALL_SELETE(){
    var IN_FUNCION_SELETEION = GooglemaphomeComponent.STATIC_NOW_SELETEION_POLYGON
    if (IN_FUNCION_SELETEION) {
      IN_FUNCION_SELETEION.setEditable(false);
      IN_FUNCION_SELETEION.setDraggable(false);
      IN_FUNCION_SELETEION = null;
      this._LAYER_SELETEION_ARRAY = []
    }

  }
  DRAW_DELETE_POLYGON() {
    console.log("DRAW_DELETE_POLYGON");
    var IN_FUNCION_SELETEION = GooglemaphomeComponent.STATIC_NOW_SELETEION_POLYGON
    if (IN_FUNCION_SELETEION) {
      IN_FUNCION_SELETEION.setMap(null);
    }
  }
  DRAW_DELETE_NOTE(mev: any) {
    var IN_FUNCION_SELETEION = GooglemaphomeComponent.STATIC_NOW_SELETEION_POLYGON
    if (mev.vertex != null) {
      IN_FUNCION_SELETEION.getPath().removeAt(mev.vertex);
    }
  }


  /////////////////////////////Digilog/////////////////////////////////////////

  _DIGILOG_MODE = "-";
  _DISPLAY: boolean = false; 
  _MARKER_LIST: any
  value: any;

  
  MARKER_BUTTON_DETEIL(Type_Road : any){
    this._DISPLAY = true;
    this._MARKER_LIST  =  Type_Road 
  }


  _DISPLAY_UPLOAD: boolean = false; 
  UPLOAD_DIGILOG_TEXT(){
    this._DISPLAY_UPLOAD = true;
  }

  _DISPLAY_ROAD_DETECTOR: boolean = false; 
  UPLOAD_DIGILOG_ROAD_DETECTOR(){
    this._DISPLAY_ROAD_DETECTOR = true;
  }

  _DISPLAY_OPTIONS: boolean = false; 
  DISPLAY_OPTIONS(){
    this._DISPLAY_OPTIONS = true;
  }

  _DISPLAY_DETEIL: boolean = false; 
  DISPLAY_DETEIL(){
    this._DISPLAY_DETEIL = true;
  }


  _DISPLAY_ACCOUNT: boolean = false; 
  DISPLAY_ACCOUNT(){
    this._DISPLAY_ACCOUNT = true;
    
  }

  _DISPLAY_REGISTER: boolean = false; 
  DISPLAY_REGISTER(){
    this._DISPLAY_REGISTER = true;
  }


  /////////////////////////////ngStyte/////////////////////////////////////////

  windowsSizeH: any;
  windowsSizeW: any;

  F_autoSelectSizeWindows(){
    window.onresize = (e) =>
    {
        this.ngZone.run(() => {
          this.windowsSizeH = window.innerHeight;
          this.windowsSizeW = window.innerWidth;
        });
    };
  }
  S_setHeighwindowsW() {
    let styles = {
      'width': Math.round(window.innerWidth-(window.innerWidth*0.25)) +'px',
      'height': window.innerHeight-65 +'px',
    };
    
    return styles;
  }
  S_setHeighMarker(){
    let styles = {
      'height': (window.innerHeight-320)-65 +'px',
    };
    return styles;
  }
  STYTE_MARKER(Color : any){
    let styles = {
      'font-size': '50px',
      'color': Color,
    };
    return styles;
  }

}
