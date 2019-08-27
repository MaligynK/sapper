import * as PIXI from 'pixi.js';

/**
 * Класс-помощник для создания графических элементов
 * **/
export class GraphicHelper {

  /**
   * Создание прямоугольника
   * Параметры:
   *  width - ширина
   *  height - высота
   *  color - цвет заливки
   *  border - цвет обводки
   * **/
  static create_rectangle(width: number, height: number, color: number, border?: number): PIXI.Graphics {
    const graphics = new PIXI.Graphics();
    if(border){
      // указываем обводку, если есть ее цвет
      graphics.lineStyle(2, border, 1);
    }
    // указываем цвет заливки
    graphics.beginFill(color);
    // размеры
    graphics.drawRect(0, 0, width, height);
    // завершаем создание (после этого нельзя редактировать элемент)
    graphics.endFill();
    return graphics;
  }

  /**
   * Создание текста
   * Параметры:
   *  text - текстовое сообщение
   *  style - стиль сообщения (см. https://pixijs.io/examples/#/text/text.js )
   * **/
  static create_text(text: string, style: Object): PIXI.Text {
    return new PIXI.Text(text, style);
  }

  /**
   * Создание кнопки
   * Параметры:
   *  texture - текстура изображения из app.loader.resources PixiJS
   * **/
  static create_button(texture: any): PIXI.Sprite {
    const button = new PIXI.Sprite(texture.texture);
    button.buttonMode = true;
    button.interactive = true;
    return button;
  }
}
