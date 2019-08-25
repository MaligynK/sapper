import {Stage, Button} from './stage.class';
import {Field, Cell} from './field.class';
import {GraphicHelper} from './graphic_helper.class';

export interface GameCell {
  // идентификатор
  id: number;
  // строка
  row: number;
  // столбец
  col: number;
  // есть ли мина?
  mine: boolean;
  // сколько мин вокруг
  around: number;
  // клетка открыта?
  opened: boolean;
  // элемент на холсте
  elem: PIXI.Container;
  // фон
  square: PIXI.Graphics;
  // элемент текста на холсте
  text: PIXI.Text;
  // флаг поставлен?
  flag_exist: boolean;
  // элемент флага, если поставлен
  flag: PIXI.Graphics;
}

import * as PIXI from 'pixi.js';

/**
 * Экран состояния приложения во время игры
 * **/
export class GameStage extends Stage {

  // данные о клетках поля
  private _game_cells: Array<Array<GameCell>>;
  // размер клетки на холсте
  private _cell_size: number;
  // блок поля
  private _field_elem: PIXI.Container;
  // статус игры:
  // 0 - игра в процессе
  // 1 - игрок выиграл
  // 2 - игрок проиграл
  // 3 - игра завершена
  private _game_status: number;
  // стили для значения мин в клетках
  private _text_style = {
    fontFamily: 'Arial',
    fontSize: 14,
    // fontStyle: 'italic',
    // fontWeight: 'bold',
    fill: '#000000',
    wordWrap: false,
  };

  /**
   * Начало игры
   * Параметры:
   *  field - объект логики игры
   *  callback - калбек при завершении
   * **/
  start(field: Field, callback: (result: number) => void) {
    // определяем размеры поля относительно холста
    let field_width = this._app.screen.width * 0.8;
    let field_height = this._app.screen.height * 0.7;
    // элемент поля
    const field_elem = new PIXI.Container();
    field_elem.width = field_width;
    field_elem.height = field_height;
    // получение данных об клетках
    const cells: Array<Array<Cell>> = field.cells;
    // расчет размеров клеток
    this._cell_size = field_width / cells.length;
    let alternative_cell_size = field_height / cells[0].length;
    if(this._cell_size > alternative_cell_size){
      this._cell_size = alternative_cell_size;
    }
    // расчет положения текста в клетках
    this._text_style.fontSize = Math.floor(this._cell_size * 0.9);
    const text_metrics = PIXI.TextMetrics.measureText('0', new PIXI.TextStyle(this._text_style));
    const text_x = (this._cell_size - text_metrics.width) / 2;
    const text_y = (this._cell_size - text_metrics.height) / 2;
    // создание клеток поля
    this._game_cells = [];
    for(let i = 0; i < cells.length; i++){
      const row = cells[i];
      this._game_cells[i] = [];
      for(let j = 0; j < row.length; j++){
        const cell = row[j];
        // переносим полученные из логики данные
        const game_cell = {
          id: cell.id,
          row: cell.row,
          col: cell.col,
          mine: cell.mine,
          around: cell.around,
          opened: cell.opened,
          elem: undefined,
          square: undefined,
          text: undefined,
          flag_exist: false,
          flag: undefined
        };
        this._game_cells[i][j] = game_cell;
        // создаем элемент клеки
        this._create_cell_elem(game_cell, text_x, text_y);
        const elem = game_cell.elem;
        elem.x = this._cell_size * j;
        elem.y = this._cell_size * i;
        field_elem.addChild(elem);
        // подписываемся на нажатие левой кнопки мыши (вскрытие клетки)
        elem.on('mouseup', () => {
          if(this._game_status){
            // игра завершена
            return;
          }
          if(game_cell.opened || game_cell.flag_exist){
            // клетка открыта или на ней стоит флаг
            return;
          }
          // обновление данных поля
          let result = field.field_update(game_cell.row, game_cell.col);
          if(result){
            // игра завершена
            this._game_status = result;
            callback(result);
            return;
          }
          // открываем клетки
          this._update_cells(field);
        });
        // подписываемся на нажатие левой кнопки мыши
        elem.on('rightup', () => {
          // ставим флаг
          this._set_flag (game_cell);
        });
      }
    }
    // положение поля по центру холста
    field_elem.x = this._app.screen.width / 2 - field_elem.width / 2;
    field_elem.y = this._app.screen.height / 2 - field_elem.height / 2;
    this._field_elem = field_elem;
    this._container.addChild(field_elem);
    // игра началась
    this._game_status = 0;
    // отображаем экран
    this.show();
  }

  /**
   * Пытаемся поставить флаг на клетку
   * **/
  private _set_flag (game_cell: GameCell){
    if(this._game_status){
      // игра заврешена
      return;
    }
    if(game_cell.opened){
      // клетка открыта
      return;
    }
    if(game_cell.flag_exist){
      // снимаем флаг
      game_cell.flag_exist = false;
      game_cell.flag.visible = false;
      return;
    }
    // ставим флаг
    game_cell.flag_exist = true;
    if(game_cell.flag){
      // флаг был поставлен ранее, отображаем
      game_cell.flag.visible = true;
      return;
    }
    // создаем элемент флага
    const size = Math.floor(this._cell_size * 0.8);
    const margin = Math.ceil(this._cell_size * 0.1);
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xFF3300);
    graphics.moveTo(margin, margin);
    graphics.lineTo(margin, margin + size);
    graphics.lineTo(margin + size, Math.floor(margin + size / 2));
    graphics.lineTo(margin, margin);
    graphics.closePath();
    graphics.name = 'flag';
    graphics.endFill();
    game_cell.flag = graphics;
    game_cell.elem.addChild(game_cell.flag);
  }

  /**
   * "Открытие" элементов клеток
   * **/
  private _update_cells(field: Field){
    // получение текущего состояния клеток из логики
    const cells = field.cells;
    for(let i = 0; i < cells.length; i++){
      const row = cells[i];
      for(let j = 0; j < row.length; j++) {
        const cell = row[j];
        const game_cell = this._game_cells[i][j];
        if(cell.opened && !game_cell.opened){
          // в логике клетка открыта, а в отображении нет, исправляем
          game_cell.opened = true;
          game_cell.square.clear();
          game_cell.square.lineStyle(2, 0x101010, 1);
          game_cell.square.beginFill(0xFFFFFF);
          game_cell.square.drawRect(0, 0, this._cell_size, this._cell_size);
          if(cell.around > 0){
            game_cell.text.visible = true;
            game_cell.text.text = cell.around.toString();
          }else{
            // элемент тексста больше не нужен, удаляем
            game_cell.text.destroy();
            delete game_cell.text;
          }
          if(game_cell.flag){
            // флаг больше не нужен
            game_cell.flag.destroy();
            delete game_cell.flag;
          }
        }
      }
    }
  };

  /**
   * Создание элемента клетки - контейнера, фона и текста для отображения окружающего количества мин
   * **/
  private _create_cell_elem(cell: GameCell, text_x: number, text_y: number) {
    const elem = new PIXI.Container();
    const square = GraphicHelper.create_rectangle(this._cell_size, this._cell_size, 0xAAEEAA, 0x101010);
    elem.buttonMode = true;
    elem.interactive = true;
    elem.addChild(square);
    elem.on('pointerover', () => {
      if(this._game_status){
        return;
      }
      if(cell.opened){
        return;
      }
      square.alpha = 0.5;
    });
    elem.on('pointerout', () => {
      square.alpha = 1;
    });
    cell.square = square;
    cell.elem = elem;
    const text = GraphicHelper.create_text('0', this._text_style);
    text.x = text_x;
    text.y = text_y;
    text.visible = false;
    cell.text = text;
    cell.elem.addChild(text);
  }

  /**
   * Игра завершена, нужно очистить данные
   * **/
  close() {
    this._game_status = 3;
    this._game_cells = [];
    this._field_elem.destroy();
    delete this._field_elem;
    this.hide();
  }
}
