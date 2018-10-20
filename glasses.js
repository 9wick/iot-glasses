var Obniz = require("obniz");

class glasses {

  setup() {
    this.MODE_TYPES = {
      STAY: 0,
      RGBCOLOR: 1,
      GRADATION: 2,
      IOTLT: 3,
    };

    this.EYE_TYPES = {
      L: 0,
      R: 1,
    };

    this.COLOR = {
      WHITE: () => {
        return [180, 0]
      },
      RED: () => {
        return [0, 1]
      },
      BLUE: () => {
        return [240, 1]
      },
      GREEN: () => {
        return [120, 1]
      }
    };

  }

  constructor(obniz_id) {
    this.setup();
    this.mode = this.MODE_TYPES.STAY;
    this.frameCount = 0;
    this.leds1 = undefined;
    this.leds2 = undefined;
    this.ready = false;
    this._data = [[], []];
    this.changeAllColor(this.COLOR.WHITE());
    this.obniz = new Obniz(obniz_id);
    this.color = this.COLOR.WHITE();
    this.contrast = 0.1;

    this.obniz.onconnect = async () => {
      this.obniz.display.clear();
      this.obniz.display.print("COLORFUL GLASSES");

      this.leds1 = this.obniz.wired("WS2812", {gnd: 0, vcc: 2, din: 1});
      this.leds2 = this.obniz.wired("WS2812", {gnd: 7, vcc: 9, din: 8});
      await this.obniz.wait(500);
      this.flush();
      this.changeMode(this.MODE_TYPES.IOTLT);
      this.ready = true;
    };

    this.obniz.repeat(() => {
      if (!this.ready) {
        return
      }

      if (this.mode === this.MODE_TYPES.STAY) {
        this.stayUpdate();
      } else if (this.mode === this.MODE_TYPES.RGBCOLOR) {
        this.RGBupdate();
      } else if (this.mode === this.MODE_TYPES.GRADATION) {
        this.gradationUpdate();
      } else if (this.mode === this.MODE_TYPES.IOTLT) {
        this.iotltUpdate();
      }
      this.flush();

      this.frameCount++;
    }, 100)

  }


  changeMode(newMode) {
    if (this.mode === newMode) {
      return;
    }
    this.contrast = Math.max(this.contrast, 0.1);
    this.mode = newMode;
    this.frameCount = 0;
  }


  changeAllColor(color) {
    this._data = [
      [color, color, color, color, color, color, color, color, color, color, color, color, color, color, color, color],
      [color, color, color, color, color, color, color, color, color, color, color, color, color, color, color, color],
    ]
  }

  flush() {
    let sendData0 = this._data[0].map((e) => {
      return hsv2rgb(e[0], e[1], this.contrast);
    });
    let sendData1 = this._data[1].map((e) => {
      return hsv2rgb(e[0], e[1], this.contrast);

    });
    this.leds1.rgbs(sendData0);
    this.leds2.rgbs(sendData1);

  }


  setColor(eye, line, pos, color) {
    let lineIndex = line === 0 ? 0 : 1;
    let index = eye === this.EYE_TYPES.L ? 7 - pos : 8 + pos;
    this._data[lineIndex][index] = color;
  }

  stayUpdate() {
    this.changeAllColor(this.color);
  }

  gradationUpdate() {

    for (let i = 0; i < 8; i++) {
      let c = [((this.frameCount + i) * 20) % 360, 1]
      this.setColor(this.EYE_TYPES.L, 0, i, c);
      this.setColor(this.EYE_TYPES.R, 0, i, c);
      this.setColor(this.EYE_TYPES.L, 1, i, c);
      this.setColor(this.EYE_TYPES.R, 1, i, c);

    }


  }

  iotltUpdate() {
    this.iotltCount = this.iotltCount || 0;
    this.changeAllColor(this.COLOR.WHITE());
    if (this.frameCount % (4) === 0) {
      if (this.iotltCount === 0) {
        this.contrast = 0;
      } else {
        this.contrast = 0.1;
        this.iotltCount = -1;
      }
      this.iotltCount++;
    }
  }

  RGBupdate() {

    this.RGBCount = this.RGBCount || 0;
    this.setColor(this.EYE_TYPES.L, 0, (this.frameCount - 1) % 8, this.color);
    this.setColor(this.EYE_TYPES.R, 0, (this.frameCount - 1) % 8, this.color);
    this.setColor(this.EYE_TYPES.L, 1, (this.frameCount - 1) % 8, this.color);
    this.setColor(this.EYE_TYPES.R, 1, (this.frameCount - 1) % 8, this.color);


    if (this.frameCount % (8 * 2) === 0) {
      this.RGBCount++;
      if (this.RGBCount === 0) {
        this.color = this.COLOR.RED();
      } else if (this.RGBCount === 1) {
        this.color = this.COLOR.BLUE();
      } else if (this.RGBCount === 2) {
        this.color = this.COLOR.GREEN();
      } else {
        this.color = this.COLOR.WHITE();
        this.RGBCount = -1;
      }
    }
  }


}


function hsv2rgb(h, s, v) {
  let C = v * s;
  let Hp = h / 60;
  let X = C * (1 - Math.abs((Hp % 2) - 1));

  let R, G, B;
  if (0 <= Hp && Hp < 1) {
    [R, G, B] = [C, X, 0];
  }
  if (1 <= Hp && Hp < 2) {
    [R, G, B] = [X, C, 0];
  }
  if (2 <= Hp && Hp < 3) {
    [R, G, B] = [0, C, X];
  }
  if (3 <= Hp && Hp < 4) {
    [R, G, B] = [0, X, C];
  }
  if (4 <= Hp && Hp < 5) {
    [R, G, B] = [X, 0, C];
  }
  if (5 <= Hp && Hp < 6) {
    [R, G, B] = [C, 0, X];
  }

  let m = v - C;
  [R, G, B] = [R + m, G + m, B + m];

  R = Math.floor(R * 255);
  G = Math.floor(G * 255);
  B = Math.floor(B * 255);
  return [R, G, B];
}


function colorCompare(c1, c2) {
  return c1[0] == c2[0]
      && c1[1] == c2[1]
      && c1[2] == c2[2];
}


module.exports = glasses