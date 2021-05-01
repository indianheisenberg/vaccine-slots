
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class CommonService {
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(private http: HttpClient) {}




  async getStates(){
    return this.http
    .get<any>("https://cdn-api.co-vin.in/api/v2/admin/location/states")
    .toPromise();
  }

  async getDistricts(stateId){
    return this.http
    .get<any>("https://cdn-api.co-vin.in/api/v2/admin/location/districts/"+stateId)
    .toPromise();
  }

  async getSlotsByDistrict(districtId,date){
    return this.http
    .get<any>("https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id="+districtId+"&date="+date)
    .toPromise();
  }

  async getSlotsByPinCode(pincode,date){
    return this.http
    .get<any>("https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode="+pincode+"&date="+date)
    .toPromise();
  }
}
