import * as PIXI from 'pixi.js';

interface ResourceImage {
  texture: PIXI.Texture,
  width: number,
  height: number
}

export interface Resources {
  start: ResourceImage,
  pause: ResourceImage,
  menu: ResourceImage,
  close: ResourceImage,
  back: ResourceImage
}

/**
 * Хранилище ресурсов
 * **/
export class ResourcesKeeper {

  private static images = [
    {
      img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQwAAAA6CAMAAAByBpelAAAAM1BMVEUAAABNTU1oaGh8fHyMjIyampqnp6eysrK9vb3Hx8fQ0NDZ2dnh4eHp6enw8PD/AAD///89ODILAAAB4UlEQVR4Ae3Y0dKbIBQEYEBEwUDP+z9tJw2u2zit1/Dv3onJmeELHoLul4L8jSEMU/5EGMIQhjCEIQxhCEMYwhCGMITxgzAcJ6RmlNaHm3FajuH92TV/FekXyX1SRsa4T2HrY5tRkkP8fsNgi/Ex3MsQf07akBocJ3ERtvDFZsBYcevA2IExWPRkxiCLalNgONxa70DJfcU3wmCLMTEA0DbCwK1wjaGjhmJWO9V2FYHFUm1wDMzeevKnheBpwJDnhROvIrAwZPSVsRu3h8UWEoos08K6v7gILIbG4GAqtU/8sxoqtc/6/yJ1Goz09X+iWcP4+eGHIvOsjKVYjz8ntqBPPGH0bLNgYG0UtIeMP5TPGNun6U6D4Qr1yob9NF49o50NdDu+ihRLWEaDb6014ZnvApyG3bTQPhvzVcSX8+lax8fgi91RsOVm7pD+usA2godqhpWBi3DDCNd6idXsWHA4oSLot22SnhHojMY5cKin3HeZFxbMDBg7Hcg4Cb87pfzr5c4+BUbgJoAfG5NdHt5noJm8BsfAiTOD5X4mWR3is90x8O3BMUJMhX7+bGcO7gNtj+EtEXGfMOjrq96OP0QYwhCGMIQhDGEIQxjCEIYwhCEMYQhDGMJQehhDcSYD5DehYn/K1ZT17QAAAABJRU5ErkJggg==",
      key: "back"
    },
    {
      img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQsAAAA4CAMAAADdEi3XAAAAM1BMVEUAAABNTU1oaGh8fHyMjIyampqnp6eysrK9vb3Hx8fQ0NDZ2dnh4eHp6enw8PD/AAD///89ODILAAAB0UlEQVR4Ae3YwY7cIAzG8Q/HkJAJ1O//tN0amjBRGLWXSu76f9pFngM/jQIZ/PB+92Uh3lf/r4VbuIVbuIVbuIVbuIVbuIVbuIVb1MwEgGI+l6A9TEad5FzH1Y0DgMBrkR7uGbFIOAvbR4sVV+lxNZq2KISx9MFiwRgV0RhjbNmC8F6eWix4j3R1hxYIrd2uRcKtUCcWK+6lLtQEavuLzVpUaLSLlAhtfbaonWoXkT1Aq8OkTgTm0cLWOZLbBkVrGPy8lz5ZRGsY+ZyMRcZMWnDfk1YpbsdsLw1qe5Ph8dHJ22HbgvCrIvegzSfL+X164SqkY3KmWrCANl+frQz/Joyt39pCXoQh/r4W2h5xtVu1oH42apXW1189L0jOjhzRWqxatA3sw+HA+dmCn8+Rodo1bN8vlvHSsHy8X9Tb/YKZCeirti0qNC4irwVa/oN7J533zvahNIwsVi1kxa3wdA7M30c2aPE4z5PN7nvqgvf2mcXkPTVMLC1ZTDCSzCwmv18cN4pi2UIizkKWDxaSbmjaQbjiIqYtpG5MAAI3ibmF1NwntypXr5WDQqyHyL+18AxauIVbuIVbuIVbuIVbuIVbuIVbuIVbuIVbuIXmucXYTx60VYqcbXmIAAAAAElFTkSuQmCC",
      key: "close"
    },
    {
      img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQsAAAA4CAMAAADdEi3XAAAAM1BMVEUAAABNTU1oaGh8fHyMjIyampqnp6eysrK9vb3Hx8fQ0NDZ2dnh4eHp6enw8PD/AAD///89ODILAAABcUlEQVR4Ae3Y4YqDMBAE4LHRRE3Nzfs/7dVNe5gehe3PhBkoyUgp+EFWLH6UVx4WfESRxcgWspCFLGQhC1nIQhaykIUsZIGatbYVNVbwnr+Lmc+8f7n50V4t5tqCz2Ia2gKv5rLAMrRFPkv2WiCPbJHOktwWUxnV4gaEswTbtrf3wW4e1SICeJbotMA2qMV+fshsW6fFVMa0IIBYxwU/zIvm4mqnZEwLGxSkjQ2PBYOdkjEtEoBSACSfxWHLMaTFHcC+A8g+C9opCSNa2BKj7XwW9ZSsQ1oswHSzeeh5jpAsU2tUKy2lb4sNls1twa21mG17v7ztzr1aFFgOvwXnxqLef8hkqVukXi14e72Le95HyOspqQ3vKd1axHONfot6Si4toU1itxb5XPevLLjg2gKuCezXwjbFb9E8PBoay8KeLQIQ+KVFbhqPNNvYmdOh/8H/RxaykIUsZCELWchCFrKQhSxkIQtZyEIWslAssmjyC6AgWVUKeLOUAAAAAElFTkSuQmCC",
      key: "menu"
    },
    {
      img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQsAAAA4CAMAAADdEi3XAAAAM1BMVEUAAABNTU1oaGh8fHyMjIyampqnp6eysrK9vb3Hx8fQ0NDZ2dnh4eHp6enw8PD/AAD///89ODILAAABxElEQVR4Ae3Y3ZKjIBCG4QZaUflZ7v9q12xau8tsdI6mCup7jyJSU5OniKj0Bx3tFm0PwQIWsIAFLIa0gAUsYAELWMACFrAgE6/NVGW0Xub+76Au7IjIcSw6+VIfFpoveibKWHy2iKRNo1iQ1zNOhtyjBZONR7GgrUmJjtKDxSZmXv/EGBbcpElX/YNFOATq+xP3bbF/KGx/EXLCy9lbC/1UiRyztehwH/n871d6lenV+hOLqTRtLAtPe+G9/v29BZPESx7DogS7kRRZEO/lUW4tEmluzua8rRsLbW7/muU2q+rgFwuZrMVhLLK5uQjHJuHuLVryZOIRLHQFbOc1c5UN85uFtE2kbUNYCIVcDuv5VMJfLbS8Hh6hf4twXvcqXat6V65T5ECrotH/nqotdG3R1ZLNFH6NMvvzaXY8C0/XvH7/kFqrohXPW/DZrJYwkEWiz9LXn46wTPncT5ben0dMM30263sKLer+a3JtEAsdK3KUzZRAtmAmaK4MZLFe3uqweUCbSJualD1pXNpAFkG++1Gyi6BE9rTHsTQtRXbv0fzL7ztRhxawgAUsYAELWMACFrCABSxgAQtYwAIWsJAQLLS/09FQhjaOzEIAAAAASUVORK5CYII=",
      key: "pause"
    },
    {
      img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQsAAAA4CAMAAADdEi3XAAAAM1BMVEUAAABNTU1oaGh8fHyMjIyampqnp6eysrK9vb3Hx8fQ0NDZ2dnh4eHp6enw8PD/AAD///89ODILAAAByklEQVR4Ae3XXW6sMAwFYCc4QMjPZf+rvZ3JYAUPgbdKrs55KmAq5RsTA/07gvxY7MgrsIAFLGABC1jAAhawgAUsYAGLP2pRV3ZE5Hgp7QRdRIqppbZDXe05Dv+FAYuFJBSeFiLVi7aQuGLWgqkPP1m4Y8VDC3JWLTZ6x3lq2e4XkuREGlrQYtRiOgRq+4vvLYKcCGMLb9FCVvLZFR0z60sX5V4uqLIyq3vUoQmLUG6ZJJFeyfRKvCozbcGya6752eLdEVN7sPx3WQ4kVwxapH4AzPneorSG+LRHGe+dNi32WS1jaCG19fPCNY9marVqsSdPXXhkIS8X0zF93Phdy5yFZAskoW28kE32zNiVKom57jYtJDkeHtN4ISxfIlV6SFtw2e1aSGp4GIiVdGpfliZ5RGxaMLOXj84Hi5V01nOZl24xaTF1E6E+PCOedPy5LMuOY9BCfuuQZZ6so4Uk+k46l60iZHK/cHoiDhcy03dmVSZtZtIiP70cqMNyvk+VFWkXk3MkezURBxZR+r8fsFGVrU3U7ExNC7s3xJJH32bS/lFtH9N1WfhVCwQWsIAFLGABC1jAAhawgAUsYAELWMACFsYsWhBYdPkPxQ5WabFktjgAAAAASUVORK5CYII=",
      key: "start"
    }
  ];

  /**
   * Создание текстуры на основе изображения в base64
   * **/
  private static _create_texture(base64: string): Promise<ResourceImage> {
    return new Promise(
      (resolve, reject) => {
        const img = new Image();
        // изображение необходимо загрузить, чтобы узнать размеры
        img.onload = function () {
          const base = new PIXI.BaseTexture(base64);
          resolve({
            texture: new PIXI.Texture(base),
            width: img.width,
            height: img.height
          });
        };
        img.src = base64;
      }
    );
  };

  /**
   * Загрузка всех изображений
   * **/
  static load_resources(): Promise<Resources> {
    const promises = [];
    const resources = {
      start: undefined,
      pause: undefined,
      menu: undefined,
      close: undefined,
      back: undefined
    };
    for (let i = 0; i < this.images.length; i++) {
      const image = this.images[i];
      promises.push(this._create_texture(image.img).then((texture) => {
          resources[image.key] = texture;
      }));
    }
    return Promise.all(promises).then(
      () => {
        return resources;
      }
    );
  }

}
