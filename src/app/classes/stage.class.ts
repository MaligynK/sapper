import {GraphicHelper} from './graphic_helper.class';

import * as PIXI from 'pixi.js';

export interface Button {
  name: string;
  x: number;
  y: number;
  callback: () => void;
  texture: any;
}

/**
 * Экран состояния приложения
 * **/
export class Stage {

  // основной блок состояния
  protected _container: PIXI.Container;
  // PIXI Application
  protected _app: PIXI.Application;
  // цвет фона
  private _background_color = 0x1099bb;

  constructor(app: PIXI.Application, buttons?: Array<Button>){
    this._app = app;
    // создание блока и фона
    this._container = new PIXI.Container();
    const background = GraphicHelper.create_rectangle(app.view.width, app.view.height, this._background_color);
    this._container.addChild(background);

    // создание кнопок
    for(let i = 0; i < buttons.length; i++){
      const button = buttons[i];
      const texture = button.texture;
      const button_elem = GraphicHelper.create_button(texture);
      // подписываемся на нажатие
      button_elem.on('mouseup', button.callback);
      // положение относительно экрана
      button_elem.x = app.view.width * button.x - texture.width/2;
      button_elem.y = app.view.height * button.y - texture.height/2;
      this._container.addChild(button_elem);
    }
    this._container.visible = false;
    app.stage.addChild(this._container);
  }

  /**
   * Отобразить экран
   * **/
  public show(){
    this._container.visible = true;
  }

  /**
   * Скрыть экран
   * **/
  public hide(){
    this._container.visible = false;
  }

}
