import { CommonService } from './services/common.service';
import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(private commonService: CommonService){

  }

  title = 'vaccineslots';
  states = new FormControl();
  districts = new FormControl();
statesList: any;
districtList: any;
slotsList: any;
slotsListFinal: Slots[];
slot : Slots;
noSlotsAvailable: any;


  async ngOnInit(): Promise<void> {
    
    try {
      this.statesList = await this.commonService.getStates();
    
    }
    catch (error) {
      console.log(error);
    }


  }

  async stateSelected(stateId){

    try {
      this.districtList = await this.commonService.getDistricts(stateId);
    
    }
    catch (error) {
      console.log(error);
    }
  }

  
  async getSlots(){

    try {
      const currentDate = this.getCurrentDate();
      this.slotsList = await this.commonService.getSlotsByDistrict(this.districts.value,currentDate);
   

      if(this.slotsList && this.slotsList.centers && this.slotsList.centers.length>0){
        for(let i=0;i<this.slotsList.centers.length;i++){
          let slot: Slots;
          slot.center_name=this.slotsList.centers[i].name;
          slot.pincode = this.slotsList.centers[i].pincode;
          slot.state_name = this.slotsList.centers[i].state_name;
          slot.district_name = this.slotsList.centers[i].district_name;
          slot.from = this.slotsList.centers[i].from;
          slot.to = this.slotsList.centers[i].to;
          if(this.slotsList.centers[i].sessions && this.slotsList.centers[i].sessions.length>0){
            slot.earliestDate = this.slotsList.centers[i].sessions[0].date;
            slot.numberOfSlots = this.slotsList.centers[i].sessions[0].available_capacity;
            slot.vaccineType = this.slotsList.centers[i].sessions[0].vaccine;
            slot.minAge = this.slotsList.centers[i].sessions[0].min_age_limit;
          }
          this.slotsListFinal.push(slot);
        }
     
       

      }else{
        this.noSlotsAvailable = true;
      }

    }
    catch (error) {
      console.log(error);
    }
  }

  getCurrentDate(){
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    
        const currentDate = mm + '-' + dd + '-' + yyyy;
        return currentDate;
  }


}

export interface Slots{

  center_name:'',
  state_name: "Maharashtra",

      district_name: "Satara",
   
      block_name: "Jaoli",
    
      pincode: "413608",
      from: "09:00:00",
      to: "18:00:00",
  earliestDate: '',
  numberOfSlots:0,
  vaccineType:'',
  minAge:0
}
