// Generated by CoffeeScript 1.9.0
(function() {
  var Adc, Controller, Event, View, breakFilter, jCanvasHelper,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  breakFilter = function(arr, condition, startIndex) {
    var i, _i, _ref;
    if (startIndex == null) {
      startIndex = 0;
    }
    for (i = _i = startIndex, _ref = arr.length; startIndex <= _ref ? _i < _ref : _i > _ref; i = startIndex <= _ref ? ++_i : --_i) {
      if (condition(arr[i])) {
        return i;
      }
    }
  };

  View = (function() {
    View.MAX_SCALE = 200;

    View.MIN_SCALE = 20;

    View.SCALE_STEP = 10;

    View.NUMBER_OF_DECIMALS_MIN = 1;

    View.NUMBER_OF_DECIMALS_MAX = 10;

    function View(_at_adc, _at_elements) {
      var levelRangeSlide, numberOfDecimalsRangeSlide, timeRangeSlide, timeStepSlide, voltageRangeSlide;
      this.adc = _at_adc;
      this.elements = _at_elements;
      this.fillRestoredSignalInfo = __bind(this.fillRestoredSignalInfo, this);
      this.fillDigitalSignalInfo = __bind(this.fillDigitalSignalInfo, this);
      this.fillQuantizedSignalInfo = __bind(this.fillQuantizedSignalInfo, this);
      this.drawLevels = __bind(this.drawLevels, this);
      this.drawGrid = __bind(this.drawGrid, this);
      this.scaleCoords = __bind(this.scaleCoords, this);
      this.drawSignal = __bind(this.drawSignal, this);
      this.showOutput = __bind(this.showOutput, this);
      this.validateInput = __bind(this.validateInput, this);
      this.exprEntered = new Event(this);
      this.goClicked = new Event(this);
      this.data = new Object;
      this.scale = 40;
      this.wantGrid = true;
      this.wantAnalogSignal = true;
      this.wantQuantizedSignal = true;
      this.wantRestoredSignal = true;
      this.wantLevels = false;
      this.calculated = false;
      this.canvasWidth = this.elements.$canvas.attr("width");
      this.canvasHeight = this.elements.$canvas.attr("height");
      this.validated = false;
      this.ctrlKeyDown = false;
      this.mouseOverCanvas = false;
      this.canvasOldCursorPos = {
        x: 0,
        y: 0
      };
      this.canvasTranslate = {
        x: 0,
        y: 0
      };
      this.numberOfDecimals = 3;
      this.adc.expressionChecked.attach((function(_this) {
        return function(sender, _at_validated) {
          _this.validated = _at_validated;
          return _this.validateInput(_this.validated);
        };
      })(this));
      this.adc.signalsCalculated.attach((function(_this) {
        return function() {
          _this.calculated = true;
          _this.elements.$body.addClass("ready");
          setTimeout((function() {
            return _this.elements.$body.removeClass("ready");
          }), 500);
          return _this.showOutput();
        };
      })(this));
      this.elements.$exprInput.keyup((function(_this) {
        return function() {
          return _this.exprEntered.notify(_this.elements.$exprInput.val());
        };
      })(this));
      this.elements.$go.click((function(_this) {
        return function() {
          return _this.goClicked.notify({
            expr: _this.elements.$exprInput.val(),
            startTime: _this.elements.$timeRange.slider("values")[0],
            endTime: _this.elements.$timeRange.slider("values")[1],
            timeStep: parseFloat(_this.elements.$analogStep.text()),
            bitDepth: parseInt(_this.elements.$bitDepth.text()),
            levelCount: parseInt(_this.elements.$level.text()),
            discretePeriod: parseFloat(_this.elements.$discretePeriod.text()),
            maxVoltage: parseInt(_this.elements.$voltage.text())
          });
        };
      })(this));
      this.elements.$drawGrid.click((function(_this) {
        return function() {
          _this.wantGrid = _this.elements.$drawGrid.is(":checked");
          return _this.showOutput();
        };
      })(this));
      this.elements.$drawAnalogSignal.click((function(_this) {
        return function() {
          _this.wantAnalogSignal = _this.elements.$drawAnalogSignal.is(":checked");
          return _this.showOutput();
        };
      })(this));
      this.elements.$drawQuantizedSignal.click((function(_this) {
        return function() {
          _this.wantQuantizedSignal = _this.elements.$drawQuantizedSignal.is(":checked");
          return _this.showOutput();
        };
      })(this));
      this.elements.$drawRestoredSignal.click((function(_this) {
        return function() {
          _this.wantRestoredSignal = _this.elements.$drawRestoredSignal.is(":checked");
          return _this.showOutput();
        };
      })(this));
      this.elements.$drawLevels.click((function(_this) {
        return function() {
          _this.wantLevels = _this.elements.$drawLevels.is(":checked");
          return _this.showOutput();
        };
      })(this));
      this.elements.$zoomIn.click((function(_this) {
        return function() {
          if (_this.scale < View.MAX_SCALE) {
            _this.scale += View.SCALE_STEP;
            return _this.showOutput();
          }
        };
      })(this));
      this.elements.$zoomOut.click((function(_this) {
        return function() {
          if (_this.scale > View.MIN_SCALE) {
            _this.scale -= View.SCALE_STEP;
            return _this.showOutput();
          }
        };
      })(this));
      this.elements.$centered.click((function(_this) {
        return function() {
          _this.elements.$canvas.translateCanvas({
            translateX: -_this.canvasTranslate.x,
            translateY: -_this.canvasTranslate.y
          });
          _this.canvasTranslate = {
            x: 0,
            y: 0
          };
          return _this.showOutput();
        };
      })(this));
      this.elements.$canvas.mouseover((function(_this) {
        return function() {
          return _this.mouseOverCanvas = true;
        };
      })(this));
      this.elements.$canvas.mouseout((function(_this) {
        return function() {
          return _this.mouseOverCanvas = false;
        };
      })(this));
      this.elements.$body.keydown((function(_this) {
        return function() {
          if (event.ctrlKey) {
            return _this.ctrlKeyDown = true;
          }
        };
      })(this));
      this.elements.$body.keyup((function(_this) {
        return function() {
          if (_this.ctrlKeyDown) {
            return _this.ctrlKeyDown = false;
          }
        };
      })(this));
      this.elements.$canvas.mousemove((function(_this) {
        return function(event) {
          var deltaX, deltaY;
          if (!_this.ctrlKeyDown) {
            _this.canvasOldCursorPos = {
              x: event.pageX,
              y: event.pageY
            };
          }
          if (_this.mouseOverCanvas && _this.ctrlKeyDown) {
            deltaX = event.pageX - _this.canvasOldCursorPos.x;
            deltaY = event.pageY - _this.canvasOldCursorPos.y;
            _this.canvasTranslate.x += deltaX;
            _this.canvasTranslate.y += deltaY;
            _this.elements.$canvas.translateCanvas({
              translateX: deltaX,
              translateY: deltaY
            });
            _this.canvasOldCursorPos.x = event.pageX;
            _this.canvasOldCursorPos.y = event.pageY;
            return _this.showOutput();
          }
        };
      })(this));
      timeRangeSlide = (function(_this) {
        return function(values) {
          return _this.elements.$time.text(values[0] + " .. " + values[1]);
        };
      })(this);
      this.elements.$timeRange.slider({
        range: true,
        min: Adc.MIN_TIME,
        max: Adc.MAX_TIME,
        values: [this.adc.data.startTime, this.adc.data.endTime],
        slide: (function(_this) {
          return function(event, ui) {
            return timeRangeSlide(ui.values);
          };
        })(this)
      });
      timeRangeSlide(this.elements.$timeRange.slider("values"));
      timeStepSlide = (function(_this) {
        return function(values) {
          _this.elements.$analogStep.text(values[0]);
          return _this.elements.$discretePeriod.text(values[1]);
        };
      })(this);
      this.elements.$timeStep.slider({
        range: true,
        min: Adc.MIN_STEP_TIME,
        max: Adc.MAX_STEP_TIME,
        step: Adc.DELTA_TIME_STEP,
        values: [this.adc.data.timeStep, this.adc.data.discretePeriod],
        slide: (function(_this) {
          return function(event, ui) {
            return timeStepSlide(ui.values);
          };
        })(this)
      });
      timeStepSlide(this.elements.$timeStep.slider("values"));
      levelRangeSlide = (function(_this) {
        return function(value) {
          _this.elements.$bitDepth.text(value);
          return _this.elements.$level.text(Adc.getLevelCount(value));
        };
      })(this);
      this.elements.$levelRange.slider({
        min: Adc.MIN_BIT_DEPTH,
        max: Adc.MAX_BIT_DEPTH,
        value: this.adc.data.bitDepth,
        slide: (function(_this) {
          return function(event, ui) {
            return levelRangeSlide(ui.value);
          };
        })(this)
      });
      levelRangeSlide(this.elements.$levelRange.slider("value"));
      numberOfDecimalsRangeSlide = (function(_this) {
        return function(value) {
          _this.elements.$numberOfDecimals.text(value);
          return _this.numberOfDecimals = value;
        };
      })(this);
      this.elements.$numberOfDecimalsRange.slider({
        min: this.NUMBER_OF_DECIMALS_MIN,
        max: this.NUMBER_OF_DECIMALS_MAX,
        value: this.numberOfDecimals,
        slide: (function(_this) {
          return function(event, ui) {
            return numberOfDecimalsRangeSlide(ui.value);
          };
        })(this)
      });
      numberOfDecimalsRangeSlide(this.elements.$numberOfDecimalsRange.slider("value"));
      voltageRangeSlide = (function(_this) {
        return function(value) {
          return _this.elements.$voltage.text(value);
        };
      })(this);
      this.elements.$voltageRange.slider({
        min: Adc.MIN_VOLTAGE,
        max: Adc.MAX_VOLTAGE,
        value: this.adc.data.maxVoltage,
        slide: (function(_this) {
          return function(event, ui) {
            return voltageRangeSlide(ui.value);
          };
        })(this)
      });
      voltageRangeSlide(this.elements.$voltageRange.slider("value"));
      this.elements.$canvas.translateCanvas({
        translateX: this.canvasWidth / 2,
        translateY: this.canvasHeight / 2
      });
    }

    View.prototype.validateInput = function(validated) {
      var hasDangerClass;
      hasDangerClass = this.elements.$exprInput.hasClass("input-bg-danger");
      if (!validated && !hasDangerClass) {
        return this.elements.$exprInput.addClass("input-bg-danger");
      } else if (validated && hasDangerClass) {
        return this.elements.$exprInput.removeClass("input-bg-danger");
      }
    };

    View.prototype.showOutput = function() {
      if (this.calculated) {
        this.elements.$canvas.clearCanvas();
        if (this.wantLevels) {
          this.drawLevels();
        }
        if (this.wantGrid) {
          this.drawGrid();
        }
        if (this.wantAnalogSignal) {
          this.drawSignal(this.adc.data.analog.coords, "red");
        }
        if (this.wantQuantizedSignal) {
          this.drawSignal(this.adc.data.quantized.coords, "blue");
        }
        if (this.wantRestoredSignal) {
          this.drawSignal(this.adc.data.restored.coords, "green");
        }
        this.elements.$quantizedSignalInfo.find("tr").not(":first").remove();
        this.elements.$digitalSignalInfo.find("tr").not(":first").remove();
        this.elements.$restoredSignalInfo.find("tr").not(":first").remove();
        this.fillQuantizedSignalInfo();
        this.fillDigitalSignalInfo();
        return this.fillRestoredSignalInfo();
      }
    };

    View.prototype.drawSignal = function(coords, color) {
      var scaledCoords;
      scaledCoords = this.scaleCoords(coords);
      return this.elements.$canvas.drawLine(jCanvasHelper.newLine(scaledCoords, color, 1));
    };

    View.prototype.scaleCoords = function(coords) {
      var coord, copy, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = coords.length; _i < _len; _i++) {
        coord = coords[_i];
        copy = $.extend(true, {}, coord);
        copy.x *= this.scale;
        copy.y *= -this.scale;
        _results.push(copy);
      }
      return _results;
    };

    View.prototype.drawGrid = function() {
      var begin, end, step, x, xEnd, xStart, y, yEnd, yStart, _i, _j;
      step = 0.5 * this.scale;
      x = 0;
      yStart = parseInt(this.adc.data.analog.minValue * this.scale / step) * step - step * 2;
      yEnd = parseInt(this.adc.data.analog.maxValue * this.scale / step) * step + step * 2;
      for (y = _i = yStart; step > 0 ? _i <= yEnd : _i >= yEnd; y = _i += step) {
        begin = {
          x: x - 3,
          y: y
        };
        end = {
          x: x + 3,
          y: y
        };
        this.elements.$canvas.drawLine(jCanvasHelper.newLine([begin, end], "#6C6C6C", 1));
      }
      this.elements.$canvas.drawLine(jCanvasHelper.newLine([
        {
          x: x,
          y: yStart
        }, {
          x: x,
          y: yEnd
        }
      ], "#6C6C6C", 1));
      y = 0;
      xStart = parseInt(this.adc.data.startTime * this.scale / step) * step - step * 2;
      xEnd = parseInt(this.adc.data.endTime * this.scale / step) * step + step * 2;
      for (x = _j = xStart; step > 0 ? _j <= xEnd : _j >= xEnd; x = _j += step) {
        begin = {
          x: x,
          y: y + 3
        };
        end = {
          x: x,
          y: y - 3
        };
        this.elements.$canvas.drawLine(jCanvasHelper.newLine([begin, end], "#6C6C6C", 1));
      }
      return this.elements.$canvas.drawLine(jCanvasHelper.newLine([
        {
          x: xStart,
          y: y
        }, {
          x: xEnd,
          y: y
        }
      ], "#6C6C6C", 1));
    };

    View.prototype.drawLevels = function() {
      var begin, end, step, xEnd, xStart, y, yEnd, yStart, _i, _ref, _results;
      xStart = this.adc.data.startTime * this.scale;
      xEnd = this.adc.data.endTime * this.scale;
      yStart = this.adc.data.analog.minValue * this.scale;
      yEnd = this.adc.data.analog.maxValue * this.scale;
      step = this.adc.data.quantized.step * this.scale;
      _results = [];
      for (y = _i = yStart, _ref = yEnd + 0.1; step > 0 ? _i <= _ref : _i >= _ref; y = _i += step) {
        begin = {
          x: xStart,
          y: y
        };
        end = {
          x: xEnd,
          y: y
        };
        _results.push(this.elements.$canvas.drawLine(jCanvasHelper.newLine([begin, end], "#A1A1A1", 1)));
      }
      return _results;
    };

    View.prototype.fillQuantizedSignalInfo = function() {
      var c, cellInput, cellPeriod, cellQuantized, i, quantizedValues, row, _i, _ref, _results;
      quantizedValues = (function() {
        var _i, _len, _ref, _results;
        _ref = this.adc.data.quantized.coords;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = _i += 2) {
          c = _ref[i];
          _results.push(c);
        }
        return _results;
      }).call(this);
      _results = [];
      for (i = _i = 0, _ref = quantizedValues.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        cellPeriod = $("<td/>", {
          text: (quantizedValues[i].x.toFixed(2)) + " : " + ((quantizedValues[i].x + this.adc.data.discretePeriod).toFixed(2))
        });
        cellInput = $("<td/>", {
          text: parseFloat(this.adc.data.discrete.coords[i].y.toFixed(this.numberOfDecimals))
        });
        cellQuantized = $("<td/>", {
          text: parseFloat(quantizedValues[i].y.toFixed(this.numberOfDecimals))
        });
        row = $("<tr/>");
        row.append(cellPeriod);
        row.append(cellInput);
        row.append(cellQuantized);
        _results.push(this.elements.$quantizedSignalInfo.append(row));
      }
      return _results;
    };

    View.prototype.fillDigitalSignalInfo = function() {
      var cellCode, cellDecode, cellInput, cellPeriod, digit, row, _i, _len, _ref, _results;
      _ref = this.adc.data.digitalOutput;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        digit = _ref[_i];
        cellPeriod = $("<td/>", {
          text: (digit.time.toFixed(2)) + " : " + ((digit.time + this.adc.data.discretePeriod).toFixed(2))
        });
        cellInput = $("<td/>", {
          text: parseFloat(digit.input.toFixed(this.numberOfDecimals))
        });
        cellCode = $("<td/>", {
          text: digit.binaryOutput
        });
        cellDecode = $("<td/>", {
          text: parseFloat(Adc.decodeBinaryOutput(digit.binaryOutput, this.adc.data.quantized.step).toFixed(this.numberOfDecimals))
        });
        row = $("<tr/>");
        row.append(cellPeriod);
        row.append(cellInput);
        row.append(cellCode);
        row.append(cellDecode);
        _results.push(this.elements.$digitalSignalInfo.append(row));
      }
      return _results;
    };

    View.prototype.fillRestoredSignalInfo = function() {
      var cellAnalog, cellCode, cellPeriod, cellRestore, i, row, _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.adc.data.restored.coords.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        cellPeriod = $("<td/>", {
          text: (this.adc.data.digitalOutput[i].time.toFixed(2)) + " : " + ((this.adc.data.digitalOutput[i].time + this.adc.data.discretePeriod).toFixed(2))
        });
        cellAnalog = $("<td/>", {
          text: parseFloat(this.adc.data.discrete.coords[i].y.toFixed(this.numberOfDecimals))
        });
        cellCode = $("<td/>", {
          text: this.adc.data.digitalOutput[i].binaryOutput
        });
        cellRestore = $("<td/>", {
          text: parseFloat(this.adc.data.restored.coords[i].y.toFixed(this.numberOfDecimals))
        });
        row = $("<tr/>");
        row.append(cellPeriod);
        row.append(cellAnalog);
        row.append(cellCode);
        row.append(cellRestore);
        _results.push(this.elements.$restoredSignalInfo.append(row));
      }
      return _results;
    };

    return View;

  })();

  Controller = (function() {
    function Controller(_at_view, _at_adc) {
      this.view = _at_view;
      this.adc = _at_adc;
      this.view.exprEntered.attach((function(_this) {
        return function(sender, expr) {
          return _this.adc.checkExpression(expr);
        };
      })(this));
      this.view.goClicked.attach((function(_this) {
        return function(sender, data) {
          if (_this.view.validated) {
            return _this.adc.calculateSignals(data);
          }
        };
      })(this));
    }

    return Controller;

  })();

  Adc = (function() {
    Adc.MIN_TIME = -100;

    Adc.MAX_TIME = 100;

    Adc.MIN_STEP_TIME = 0.01;

    Adc.MAX_STEP_TIME = 0.5;

    Adc.MIN_BIT_DEPTH = 2;

    Adc.MAX_BIT_DEPTH = 16;

    Adc.DELTA_TIME_STEP = 0.01;

    Adc.MIN_VOLTAGE = 1;

    Adc.MAX_VOLTAGE = 100;

    Adc.getLevelCount = function(bitDepth) {
      return Math.pow(2, bitDepth);
    };

    Adc.decodeBinaryOutput = function(binary, stepOfQuantization) {
      var digit, numBinary, sign, _i, _len, _ref;
      sign = binary[0] === "0" ? -1 : 1;
      numBinary = new String;
      if (binary[0] === "0") {
        sign = -1;
        _ref = binary.substring(1);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          digit = _ref[_i];
          numBinary += digit === "1" ? "0" : "1";
        }
      } else {
        sign = 1;
        numBinary = binary.substring(1);
      }
      return parseInt(numBinary, 2) * stepOfQuantization * sign;
    };

    function Adc() {
      this.calculateSignals = __bind(this.calculateSignals, this);
      this.checkExpression = __bind(this.checkExpression, this);
      this.expressionChecked = new Event(this);
      this.signalsCalculated = new Event(this);
      this.reg = new RegExp(/^(?:\s*\*?\s*(?:(\-?\d+\.?\d*)\s*\*\s*)?(cos|sin)\s*\((?:\s*(\-?\d+\.?\d*)\s*\*\s*)?(?:\s*(pi)\s*\*)?\s*t\s*(?:\+\s*(\-?\d+\.?\d*))?\s*\)\s*)+$/);
      this.data = new Object;
      this.data.startTime = 0;
      this.data.endTime = 10;
      this.data.timeStep = 0.01;
      this.data.bitDepth = 5;
      this.data.levelCount = Adc.getLevelCount(this.data.bitDepth);
      this.data.discretePeriod = 0.5;
      this.data.maxVoltage = 5;
    }

    Adc.prototype.checkExpression = function(expr) {
      return this.expressionChecked.notify(this.reg.test(expr.toLowerCase()));
    };

    Adc.prototype.calculateSignals = function(_at_data) {
      this.data = _at_data;
      this.data.values = this.getValues(this.data.expr);
      this.data.analog = this.calculateAnalogSignal(this.data.values, this.data.startTime, this.data.endTime, this.data.timeStep);
      this.data.discrete = this.calculateDiscreteSignal(this.data.analog, this.data.startTime, this.data.endTime, this.data.discretePeriod);
      this.data.quantized = this.calculateQuantizedSignal(this.data.analog, this.data.discrete, this.data.levelCount, this.data.discretePeriod);
      this.data.digitalOutput = this.formDigitalOutput(this.data.analog, this.data.discrete, this.data.bitDepth);
      this.data.restored = this.calculateRestoredSignal(this.data.digitalOutput, this.data.maxVoltage);
      return this.signalsCalculated.notify();
    };

    Adc.prototype.getValues = function(expr) {
      var e, matches, res, value, _i, _len, _ref, _results;
      expr = expr.toLowerCase();
      res = expr.replace(")", "),");
      _ref = res.split(",", res.match(/\)/g).length);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        matches = e.match(this.reg);
        value = new Object;
        value.k = matches[1] ? parseFloat(matches[1]) : 1;
        value.pi = matches[4] ? Math.PI : 1;
        value.freq = matches[3] ? matches[3] * value.pi : value.pi;
        value.freqShift = matches[5] ? parseFloat(matches[5]) : 0;
        value.func = (function() {
          switch (matches[2]) {
            case "cos":
              return Math.cos;
            case "sin":
              return Math.sin;
          }
        })();
        _results.push(value);
      }
      return _results;
    };

    Adc.prototype.calculateAnalogSignal = function(values, startTime, endTime, timeStep) {
      var analogCoords, formula, max, min, time;
      formula = (function(_this) {
        return function(t) {
          var res, v, _i, _len;
          res = 1;
          for (_i = 0, _len = values.length; _i < _len; _i++) {
            v = values[_i];
            res *= v.k * v.func(v.freq * t + v.freqShift);
          }
          return res;
        };
      })(this);
      analogCoords = (function() {
        var _i, _results;
        _results = [];
        for (time = _i = startTime; timeStep > 0 ? _i < endTime : _i > endTime; time = _i += timeStep) {
          _results.push({
            x: time,
            y: formula(time)
          });
        }
        return _results;
      })();
      max = Math.max.apply(Math, analogCoords.map(function(c) {
        return c.y;
      }));
      min = Math.min.apply(Math, analogCoords.map(function(c) {
        return c.y;
      }));
      return {
        coords: analogCoords,
        maxValue: max,
        minValue: min
      };
    };

    Adc.prototype.calculateDiscreteSignal = function(analog, startTime, endTime, period) {
      var discreteCoords, index, time;
      index = 0;
      discreteCoords = (function() {
        var _i, _results;
        _results = [];
        for (time = _i = startTime; period > 0 ? _i < endTime : _i > endTime; time = _i += period) {
          index = breakFilter(analog.coords, (function(c) {
            return parseFloat(c.x.toFixed(2)) === parseFloat(time.toFixed(2));
          }), index);
          _results.push($.extend(true, {}, analog.coords[index]));
        }
        return _results;
      })();
      return {
        coords: discreteCoords
      };
    };

    Adc.prototype.calculateQuantizedSignal = function(analog, discrete, levelCount, period) {
      var coord, delta, discreteCoord, max, min, quantizedCoords, _i, _len, _ref;
      max = analog.maxValue;
      min = analog.minValue;
      delta = (max - min) / (levelCount - 1);
      quantizedCoords = [];
      _ref = discrete.coords;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        discreteCoord = _ref[_i];
        coord = $.extend(true, {}, discreteCoord);
        coord.y = min + Math.round((coord.y - min) / delta) * delta;
        quantizedCoords.push(coord);
        quantizedCoords.push({
          x: coord.x + period,
          y: coord.y
        });
      }
      return {
        coords: quantizedCoords,
        step: delta
      };
    };

    Adc.prototype.formDigitalOutput = function(analog, discrete, bitDepth) {
      var coord, delta, digit, i, max, min, _i, _j, _len, _ref, _results;
      max = analog.maxValue;
      min = analog.minValue;
      _ref = discrete.coords;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        coord = _ref[_i];
        digit = new Object;
        digit.time = coord.x;
        digit.input = coord.y;
        digit.decimalOutput = (max + min) / 2;
        digit.binaryOutput = new String;
        for (i = _j = 0; 0 <= bitDepth ? _j < bitDepth : _j > bitDepth; i = 0 <= bitDepth ? ++_j : --_j) {
          delta = (max - min) / Math.pow(2, i + 2);
          if (digit.input < digit.decimalOutput) {
            digit.binaryOutput += "0";
            digit.decimalOutput -= delta;
          } else {
            digit.binaryOutput += "1";
            digit.decimalOutput += delta;
          }
        }
        _results.push(digit);
      }
      return _results;
    };

    Adc.prototype.calculateRestoredSignal = function(digital, maxVoltage) {
      var digit, i, outVoltage, restoredCoords;
      console.log(maxVoltage);
      restoredCoords = (function() {
        var _i, _j, _len, _ref, _results;
        _results = [];
        for (_i = 0, _len = digital.length; _i < _len; _i++) {
          digit = digital[_i];
          outVoltage = 0;
          for (i = _j = 0, _ref = digit.binaryOutput.length; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
            outVoltage += maxVoltage * parseInt(digit.binaryOutput[i]) / Math.pow(2, i);
          }
          console.log('t = ' + digit.time + ' v = ' + outVoltage);
          _results.push({
            x: digit.time,
            y: outVoltage
          });
        }
        return _results;
      })();
      return {
        coords: restoredCoords
      };
    };

    return Adc;

  })();

  jCanvasHelper = (function() {
    function jCanvasHelper() {}

    jCanvasHelper.newLine = function(coords, strokeStyle, strokeWidth) {
      var coord, i, line, _i, _len;
      if (strokeWidth == null) {
        strokeWidth = 1;
      }
      line = {
        strokeStyle: strokeStyle,
        strokeWidth: strokeWidth
      };
      for (i = _i = 0, _len = coords.length; _i < _len; i = ++_i) {
        coord = coords[i];
        line["x" + (i + 1)] = coord.x;
        line["y" + (i + 1)] = coord.y;
      }
      return line;
    };

    return jCanvasHelper;

  })();

  Event = (function() {
    function Event(_at_sender) {
      this.sender = _at_sender;
      this.listeners = [];
    }

    Event.prototype.attach = function(listener) {
      return this.listeners.push(listener);
    };

    Event.prototype.detach = function(listener) {
      return this.listeners.remove(listener);
    };

    Event.prototype.notify = function(args) {
      var listener, _i, _len, _ref;
      _ref = this.listeners;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        listener(this.sender, args);
      }
    };

    return Event;

  })();

  $(function() {
    var adc, view;
    adc = new Adc;
    view = new View(adc, {
      $body: $("body"),
      $time: $("#time"),
      $timeRange: $("#time-range"),
      $timeStep: $("#time-step"),
      $discretePeriod: $("#quantized-step"),
      $analogStep: $("#analog-step"),
      $levelRange: $("#level-range"),
      $numberOfDecimals: $("#number-of-decimals"),
      $numberOfDecimalsRange: $("#number-of-decimals-range"),
      $levelRange: $("#level-range"),
      $level: $("#level"),
      $voltageRange: $("#voltage-range"),
      $voltage: $("#voltage"),
      $bitDepth: $("#bit-depth"),
      $exprInput: $("#expression"),
      $canvas: $("#canvas"),
      $go: $("#go"),
      $drawGrid: $("#draw-grid"),
      $drawAnalogSignal: $("#draw-analog"),
      $drawLevels: $("#draw-levels"),
      $drawQuantizedSignal: $("#draw-quantized"),
      $drawRestoredSignal: $("#draw-restored"),
      $digitalSignalInfo: $("#digital-signal-info"),
      $quantizedSignalInfo: $("#quantized-signal-info"),
      $restoredSignalInfo: $("#restored-signal-info"),
      $zoomIn: $("#zoom-in"),
      $zoomOut: $("#zoom-out"),
      $centered: $("#centered")
    });
    return new Controller(view, adc);
  });

}).call(this);

//# sourceMappingURL=digital-control-systems-1.js.map
