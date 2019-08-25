export interface Cell {
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
}

/**
 * Логика игры
 * **/
export class Field {
  // данные о клетках
  private _cells: Array<Array<Cell>>;
  // количество мин
  private _mines_count: number;
  // ширина поля
  private _field_width: number;
  // высота поля
  private _field_height: number;
  // количество ходов
  private _turn_count = 0;

  constructor(width: number, height: number, mines_count: number) {
    this._mines_count = mines_count;
    this._field_width = width;
    this._field_height = height;
    // создание клеток без мин
    this._cells = [];
    let id = 1;
    for (let i = 0; i < height; i++) {
      const row = [];
      this._cells.push(row);
      for (let j = 0; j < width; j++) {
        row.push({
          id: id,
          row: i,
          col: j,
          around: 0,
          mine: false,
          opened: false
        });
        id++;
      }
    }
  }

  /**
   * Нужно проверить открывается ли клетка
   * **/
  private _open_cell(i: number, j: number) {
    if (!this._cells[i] || !this._cells[i][j]) {
      // нет клетки
      return;
    }
    const cell = this._cells[i][j];
    if (cell.opened) {
      // уже открыта
      return;
    }
    if (cell.mine) {
      // мина
      return;
    }
    // мины нет, открываем клетку
    cell.opened = true;
    if (!cell.around) {
      // если нет мин вокруг, нужно открыть участок поля
      this._open_cell(i - 1, j - 1);
      this._open_cell(i - 1, j);
      this._open_cell(i - 1, j + 1);
      this._open_cell(i, j - 1);
      this._open_cell(i, j + 1);
      this._open_cell(i + 1, j - 1);
      this._open_cell(i + 1, j);
      this._open_cell(i + 1, j + 1);
    }
  }

  /**
   * Установка мин на поле
   * Параметры:
   *  i, j - местоположение открытой на первом ходу клетки, в нее нельзя ставить мину
   * **/
  private _set_mines(i: number, j: number) {
    let mines = this._mines_count;
    while (mines > 0) {
      const row = Math.floor(Math.random() * this._field_height);
      const col = Math.floor(Math.random() * this._field_width);
      if (row === i && col === j) {
        // первая выбранная пользователем клетка всегда пуста
        continue;
      }
      if (this._cells[row][col].mine) {
        // мина уже установлена
        continue;
      }
      this._cells[row][col].mine = true;
      mines--;
    }
    // подсчет окружающих клетки мин
    for (let i = 0; i < this._cells.length; i++) {
      const row = this._cells[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        cell.around = this._set_mines_around(i, j);
      }
    }
  }

  /**
   * Количество мин вокруг определенной клетки
   * Параметры:
   *  i, j - местоположение клетки
   * **/
  private _set_mines_around(i: number, j: number): number {
    // количество мин
    let count = 0;
    const row = this._cells[i];
    // если в соседней клетке есть мина, увеличиваем счетчик
    if (row[j + 1] && row[j + 1].mine) {
      count++;
    }
    if (row[j - 1] && row[j - 1].mine) {
      count++;
    }
    // следующая строка
    if (this._cells[i + 1]) {
      const next_row = this._cells[i + 1];
      if (next_row[j] && next_row[j].mine) {
        count++;
      }
      if (next_row[j + 1] && next_row[j + 1].mine) {
        count++;
      }
      if (next_row[j - 1] && next_row[j - 1].mine) {
        count++;
      }
    }
    // предыдущая строка
    if (this._cells[i - 1]) {
      const prev_row = this._cells[i - 1];
      if (prev_row[j] && prev_row[j].mine) {
        count++;
      }
      if (prev_row[j + 1] && prev_row[j + 1].mine) {
        count++;
      }
      if (prev_row[j - 1] && prev_row[j - 1].mine) {
        count++;
      }
    }
    return count;
  }

  /**
   * Игрок открыл клетку, нужно обновить поле
   * Параметры:
   *  i, j - местоположение открытой клетки
   * **/
  field_update(i: number, j: number): number {
    if (!this._turn_count) {
      // это был первый ход, теперь можно расставить мины
      this._set_mines(i, j);
    }
    // счетчик ходов
    this._turn_count++;
    if (!this._cells[i] || !this._cells[i][j]) {
      // ошибка
      return 3;
    }
    const cell = this._cells[i][j];
    if (cell.mine) {
      // мина, завершаем игру
      cell.opened = true;
      return 2;
    }
    // мины нет, открываем клетку
    this._open_cell(i, j);
    return this._check_status();
  }

  /**
   * Игрок открыл кклетку, остались ли на поле клетки, которые ему необходимо открыть?
   * Если нет, игра завершена
   * **/
  private _check_status(): number {
    // если 1, игрок выиграл
    let status = 1;
    for (let i = 0; i < this._cells.length; i++) {
      const row = this._cells[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell.opened && cell.mine) {
          // игрок проиграл
          return 2;
        }
        if (!cell.opened && !cell.mine) {
          // есть нераскрытая клетка, игра продолжается
          status = 0;
        }
      }
    }
    return status;
  }

  /**
   * Данные о клетках
   * **/
  get cells(): Array<Array<Cell>> {
    // копируем все доступные для чтения извне данные в новый массив
    const field = [];
    for (let i = 0; i < this._cells.length; i++) {
      const row = this._cells[i];
      field[i] = [];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        field[i][j] = {
          id: cell.id,
          row: i,
          col: j,
          around: cell.around,
          mine: cell.mine,
          opened: cell.opened
        };
      }
    }
    return field;
  }

}
