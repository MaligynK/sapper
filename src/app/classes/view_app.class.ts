import {Stage} from './stage.class';
import {GameStage} from './game_stage.class';
import {GraphicHelper} from './graphic_helper.class';
import {ResourcesKeeper, Resources} from './resources_keeper';

import * as PIXI from 'pixi.js';

interface Modal {
  visible: boolean;
  text: PIXI.Text;
  button: PIXI.Sprite;
  elem: PIXI.Container;
}

export interface Stages {
  menu: Stage;
  pause: Stage;
  game: GameStage;
}

/**
 * Pixi: создание отображения основных элементов: состояний, модального окна
 * **/
export class ViewApp {
  // Pixi Application
  private _app: PIXI.Application;
  // Размеры холста
  private _canvas_width = 800;
  private _canvas_height = 600;
  // модальное окно
  private _modal: Modal;
  private _resources: Resources;

  constructor(elem: HTMLElement) {
    // инициализация Pixi
    this._app = new PIXI.Application({
      width: this._canvas_width,
      height: this._canvas_height,
      backgroundColor: 0xFFFFFF
    });
    // вставка холста в контейнер
    elem.appendChild(this._app.view as HTMLElement);
    // не открывать контекстное меню в игре
    elem.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  /**
   * Загрузка используемых изображений
   * **/
  private _load_resources(): Promise<any> {
    return ResourcesKeeper.load_resources().then(
      (resources) => {
        this._resources = resources;
      }
    );
    // return new Promise(
    //   (resolve, reject) => {
    //     const options = {crossOrigin: true};
    //     this._app.loader
    //       .add('start', 'assets/images/buttons/start.png', options)
    //       .add('menu', 'assets/images/buttons/menu.png', options)
    //       .add('close', 'assets/images/buttons/close.png', options)
    //       .add('pause', 'assets/images/buttons/pause.png', options)
    //       .add('back', 'assets/images/buttons/back.png', options)
    //       .load((loader, resources) => {
    //         // создание модального окна
    //         this._create_modal();
    //         resolve();
    //       });
    //   }
    // );
  }

  /**
   * Создание состояний игры
   * **/
  public create_stages(start_game: () => void,
                       back_to_game: () => void,
                       back_to_menu: () => void,
                       pause: () => void): Promise<Stages> {
    return this._load_resources().then(
      () => {
        // создание модального окна
        this._create_modal();
        return {
          menu: this._create_main_menu(start_game),
          pause: this._create_pause_menu(back_to_game, back_to_menu),
          game: this._create_game_stage(pause)
        };
      }
    );
  }

  /**
   * Создание "модального" окна для отображения сообщений
   * **/
  private _create_modal() {
    // контейнер в котором будут находится все части окна
    const container = new PIXI.Container();
    // фон
    const block = GraphicHelper.create_rectangle(
      Math.floor(this._canvas_width / 2),
      Math.floor(this._canvas_height / 2),
      0x1099bb,
      0x111111
    );
    container.addChild(block);
    this._app.stage.addChild(container);
    // модальное окно должно располагаться над другими элементами
    container.zIndex = 10;
    // располагаем по центру холста
    container.x = (this._canvas_width - container.width) / 2;
    container.y = (this._canvas_height - container.height) / 2;
    // не отображаем
    container.visible = false;
    // кнопка закрытия окна
    const texture = this._resources.close;
    // const texture = this._resources.close.texture;
    const button = GraphicHelper.create_button(texture);
    button.x = (container.width - texture.width) / 2;
    button.y = (container.height - texture.height) * 4 / 5;
    container.addChild(button);
    // текст сообщения
    const text = GraphicHelper.create_text('', {
      fontFamily: 'Arial',
      fontSize: 14,
      wordWrap: true,
      wordWrapWidth: container.width - 20,
      // fontStyle: 'italic',
      // fontWeight: 'bold',
      fill: '#FFFFFF',
    });
    text.y = 10;
    text.x = 10;
    container.addChild(text);
    // собираем данные о модальном окне
    this._modal = {
      // отображается или нет
      visible: false,
      // текст
      text: text,
      // кнопка
      button: button,
      // весь элемент
      elem: container
    };
  }

  /**
   * Закрытие модального окна
   * **/
  public close_message() {
    // скрываем элемент
    this._modal.elem.visible = false;
    this._modal.visible = false;
    // отписываемся от события нажатия на кнопку
    this._modal.button.off('mouseup');
  }

  /**
   * Отобразить сообщение в модальном окне
   * **/
  public show_message(text: string, callback?: () => void) {
    // zIndex не работает как должен, переммещаем модальное окно наверх
    this._app.stage.children.sort((itemA, itemB) => itemA.zIndex - itemB.zIndex);
    // меняем текст сообщения
    this._modal.text.text = text;
    // отображаем
    this._modal.elem.visible = true;
    this._modal.visible = true;
    // подписываемся на нажатие на кнопку
    this._modal.button.on('mouseup', () => {
      // отписываемся от события нажатия на кнопку
      this._modal.button.off('mouseup');
      // закрываем модальное окно
      this.close_message();
      if (callback) {
        // если есть калбек, вызываем
        callback();
      }
    });
  }

  /**
   * Создание экрана главного меню
   * **/
  private _create_main_menu(callback: () => void): Stage {
    // кнопки в меню
    const menu_buttons = [
      {
        name: 'start',
        x: 0.5,
        y: 0.5,
        callback: callback,
        // texture: this._resources.start.texture
        texture: this._resources.start
      }
    ];
    return new Stage(this._app, menu_buttons);
  }

  /**
   * Создание экрана меню паузы
   * **/
  private _create_pause_menu(back_to_game: () => void, back_to_menu: () => void): Stage {
    // кнопки в меню
    const pause_buttons = [
      {
        name: 'back',
        x: 0.5,
        y: 1 / 3,
        callback: back_to_game,
        // texture: this._resources.back.texture
        texture: this._resources.back
      },
      {
        name: 'menu',
        x: 0.5,
        y: 2 / 3,
        callback: back_to_menu,
        // texture: this._resources.menu.texture
        texture: this._resources.menu
      }
    ];
    return new Stage(this._app, pause_buttons);
  }

  /**
   * Создание экрана игры
   * **/
  private _create_game_stage(callback: () => void): GameStage {
    // кнопки в меню
    const game_buttons = [
      {
        name: 'pause',
        x: 0.2,
        y: 0.07,
        callback: callback,
        // texture: this._resources.pause.texture
        texture: this._resources.pause
      }
    ];
    return new GameStage(this._app, game_buttons);
  }

}
