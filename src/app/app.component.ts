import {Component, ViewChild, AfterViewInit} from '@angular/core';

import {ModelService} from './services/model.service';

import {Field} from './classes/field.class';
import {ViewApp, Stages} from './classes/view_app.class';
import {GameStage} from './classes/game_stage.class';
import {Stage} from './classes/stage.class';

/**
 * Основной компонент. Занимается переключением между разными состояниями приложения
 * **/
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [ModelService],
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  // контейнер для холста
  @ViewChild('view_container', {static: false}) view_container;
  // отображение
  private _view: ViewApp;
  // Состояния игры:
  // Экран игры
  private _game_stage: GameStage;
  // Экран главного меню
  private _menu_stage: Stage;
  // Экран меню паузы
  private _pause_stage: Stage;

  constructor(private _model: ModelService) {}

  /**
   * Инициализация: создание холста, состояний
   * **/
  ngAfterViewInit() {
    console.log('!!!FFF', this.view_container)
    // создание холста
    this._view = new ViewApp(this.view_container.nativeElement);
    // создание стадий приложения
    this._view.create_stages(
      // калбек на начало игры
      () => {
        this._start_game();
      },
      // калбек на возвращение в игру
      () => {
        this._back_to_game();
      },
      // калбек на возвращение в меню
      () => {
        this._back_to_menu();
      },
      // калбек на открытие окна меню
      () => {
        this._pause();
      }
    ).then(
      (stages: Stages) => {
        this._menu_stage = stages.menu;
        this._menu_stage.show();
        this._pause_stage = stages.pause;
        this._game_stage = stages.game;
      }
    ).catch(
      (err) => {
        console.debug('Error:', err);
        this._view.show_message('Error :(');
      }
    );
  }

  /**
   * Пользователь нажал на паузу: открываем меню паузы, скрываем поле
   * **/
  private _pause() {
    this._pause_stage.show();
    this._game_stage.hide();
  };

  /**
   * Пользователь нажал на "вернуться в игру": скрываем меню паузы, открываем поле
   * **/
  private _back_to_game() {
    this._pause_stage.hide();
    this._game_stage.show();
  };

  /**
   * Пользователь нажал на "вернуться в меню": скрываем меню паузы, открываем главное меню, завершаем игру
   * **/
  private _back_to_menu() {
    this._menu_stage.show();
    this._pause_stage.hide();
    this._game_stage.close();
  };

  /**
   * Старт игры
   * **/
  private _start_game() {
    // создание логики поля
    const field = new Field(this._model.field_width, this._model.field_height, this._model.mines_count);
    // запуск игры
    this._game_stage.start(
      field,
      // калбек при завершении игры
      (result) => {
        if (result === 2) {
          // игрок проиграл
          this._view.show_message('You lose!', () => {
            this._back_to_menu();
          });
          return;
        }
        if (result === 1) {
          // игрок выиграл
          this._view.show_message('You win!', () => {
            this._back_to_menu();
          });
          return;
        }
        // Не выиграл и не проиграл? Ошибка!
        this._view.show_message('Error :(', () => {
          this._back_to_menu();
        });
      }
    );
    // скрываем главное меню
    this._menu_stage.hide();
  };

}
