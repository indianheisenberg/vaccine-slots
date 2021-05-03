import { Component, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonService } from './services/common.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  formName: FormGroup;
  statesList: any;
  districtList: any;
  slotsList: any;
  slotsListFinal: Slots[] = [];
  slot: Slots;
  noSlotsAvailable: any;
  districtRequired: any;
  stateRequired: any;

  constructor(
    private commonService: CommonService,
    private fb: FormBuilder,
    private analytics: AngularFireAnalytics
  ) {}

  async ngOnInit(): Promise<void> {
    this.formName = this.fb.group({
      states: [''],
      districts: [''],
      pincode: ['', [Validators.pattern('^[1-9][0-9]{5}$')]],
    });

    try {
      this.statesList = await this.commonService.getStates();
    } catch (error) {
      console.log(error);
    }
  }

  async stateSelected(stateId) {
    this.formName.controls.districts.setValue(null);
    try {
      this.districtList = await this.commonService.getDistricts(stateId);
    } catch (error) {
      console.log(error);
    }
  }

  async getSlots() {
    this.analytics.logEvent('slots search event', {
      state: this.formName.controls.states.value,
      district: this.formName.controls.districts.value,
      pincode: this.formName.controls.pincode.value,
    });
    this.slotsListFinal = [];
    this.noSlotsAvailable = false;
    if (this.checkValidations()) {
      return;
    }
    try {
      const currentDate = this.getCurrentDate();

      if (
        this.formName.controls.states.value &&
        this.formName.controls.districts.value
      ) {
        this.slotsList = await this.commonService.getSlotsByDistrict(
          this.formName.controls.districts.value,
          currentDate
        );
      } else if (
        this.formName.controls.pincode.valid &&
        this.formName.controls.pincode.value
      ) {
        this.slotsList = await this.commonService.getSlotsByPinCode(
          this.formName.controls.pincode.value,
          currentDate
        );
      } else {
        this.slotsList = null;
      }

      if (
        this.slotsList &&
        this.slotsList.centers &&
        this.slotsList.centers.length > 0
      ) {
        for (let i = 0; i < this.slotsList.centers.length; i++) {
          let slot: Slots = new sampleSlot();
          slot.center_name = this.slotsList.centers[i].name;
          slot.pincode = this.slotsList.centers[i].pincode;
          slot.state_name = this.slotsList.centers[i].state_name;
          slot.district_name = this.slotsList.centers[i].district_name;
          slot.from = this.slotsList.centers[i].from;
          slot.to = this.slotsList.centers[i].to;
          if (
            this.slotsList.centers[i].sessions &&
            this.slotsList.centers[i].sessions.length > 0
          ) {
            for (
              let y = 0;
              y < this.slotsList.centers[i].sessions.length;
              y++
            ) {
              if (
                this.slotsList.centers[i].sessions[y].available_capacity > 0
              ) {
                slot.earliestDate = this.slotsList.centers[i].sessions[y].date;
                slot.numberOfSlots = this.slotsList.centers[i].sessions[
                  y
                ].available_capacity;
                slot.vaccineType = this.slotsList.centers[i].sessions[
                  y
                ].vaccine;
                slot.minAge = this.slotsList.centers[i].sessions[
                  y
                ].min_age_limit;
                break;
              }
              slot.earliestDate = this.slotsList.centers[i].sessions[y].date;
              slot.numberOfSlots = this.slotsList.centers[i].sessions[
                y
              ].available_capacity;
              slot.vaccineType = this.slotsList.centers[i].sessions[y].vaccine;
              slot.minAge = this.slotsList.centers[i].sessions[y].min_age_limit;
            }
          }
          if (slot.numberOfSlots > 0) {
            this.slotsListFinal.push(slot);
          }
        }
      } else {
        this.noSlotsAvailable = true;
      }
    } catch (error) {
      console.log(error);
    }
  }

  checkValidations() {
    if (
      this.formName.controls.states.value &&
      !this.formName.controls.districts.value
    ) {
      this.districtRequired = true;
      this.formName.controls.districts.setErrors({ invalid: true });
      return true;
    } else if (
      !this.formName.controls.states.value &&
      this.formName.controls.districts.value
    ) {
      this.stateRequired = true;
      return true;
    }
    return false;
  }

  getCurrentDate() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    const currentDate = dd + '-' + mm + '-' + yyyy;
    return currentDate;
  }
}

export interface Slots {
  center_name: string;
  state_name: string;
  district_name: string;
  block_name: string;
  pincode: string;
  from: string;
  to: string;
  earliestDate: string;
  numberOfSlots: number;
  vaccineType: string;
  minAge: number;
}

export class sampleSlot {
  center_name: '';
  state_name: '';
  district_name: '';
  block_name: '';
  pincode: '';
  from: '09:00:00';
  to: '18:00:00';
  earliestDate: '';
  numberOfSlots: 0;
  vaccineType: '';
  minAge: 0;
}
