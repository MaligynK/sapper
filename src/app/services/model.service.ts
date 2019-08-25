import {OnInit} from '@angular/core';

/**
 * Изначальные данные игры
 * **/
export class ModelService implements OnInit {

  // количество мин
  private _mines_count = 10;
  // ширина поля
  private _field_width = 9;
  // высота поля
  private _field_height = 9;

  constructor() {
  }

  ngOnInit() {
  }

  get field_height(): number {
    return this._field_height;
  }

  get field_width(): number {
    return this._field_width;
  }

  get mines_count(): number {
    return this._mines_count;
  }

}
