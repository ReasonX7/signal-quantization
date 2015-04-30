breakFilter = (arr, condition, startIndex = 0) ->
  for i in [startIndex...arr.length] then if condition arr[i] then return i

#region View

class View
  @MAX_SCALE = 200
  @MIN_SCALE = 20
  @SCALE_STEP = 10
  @NUMBER_OF_DECIMALS_MIN = 1
  @NUMBER_OF_DECIMALS_MAX = 10

  constructor: (@adc, @elements) ->
    @exprEntered = new Event this
    @goClicked = new Event this

    @data = new Object
    @scale = 40
    @wantGrid = true
    @wantAnalogSignal = true
    @wantQuantizedSignal = true
    @wantRestoredSignal = true
    @wantLevels = false
    @calculated = false
    @canvasWidth = @elements.$canvas.attr "width"
    @canvasHeight = @elements.$canvas.attr "height"
    @validated = false
    @ctrlKeyDown = false
    @mouseOverCanvas = false
    @canvasOldCursorPos = x: 0, y: 0
    @canvasTranslate = x: 0, y: 0
    @numberOfDecimals = 3

    @adc.expressionChecked.attach (sender, @validated) => @validateInput @validated
    @adc.signalsCalculated.attach =>
      @calculated = true
      @elements.$body.addClass "ready"
      setTimeout ( => @elements.$body.removeClass("ready")), 500
      do @showOutput

    @elements.$exprInput.keyup => @exprEntered.notify @elements.$exprInput.val()
    @elements.$go.click =>
      @goClicked.notify
        expr: @elements.$exprInput.val()
        startTime: @elements.$timeRange.slider("values")[0]
        endTime: @elements.$timeRange.slider("values")[1]
        timeStep: parseFloat @elements.$analogStep.text()
        bitDepth: parseInt @elements.$bitDepth.text()
        levelCount: parseInt @elements.$level.text()
        discretePeriod: parseFloat @elements.$discretePeriod.text()
        maxVoltage: parseInt @elements.$voltage.text()

    @elements.$drawGrid.click =>
      @wantGrid = @elements.$drawGrid.is ":checked"
      do @showOutput
    @elements.$drawAnalogSignal.click =>
      @wantAnalogSignal = @elements.$drawAnalogSignal.is ":checked"
      do @showOutput
    @elements.$drawQuantizedSignal.click =>
      @wantQuantizedSignal = @elements.$drawQuantizedSignal.is ":checked"
      do @showOutput
    @elements.$drawRestoredSignal.click =>
      @wantRestoredSignal = @elements.$drawRestoredSignal.is ":checked"
      do @showOutput
    @elements.$drawLevels.click =>
      @wantLevels = @elements.$drawLevels.is ":checked"
      do @showOutput
    @elements.$zoomIn.click =>
      if @scale < View.MAX_SCALE
        @scale += View.SCALE_STEP
        do @showOutput
    @elements.$zoomOut.click =>
      if @scale > View.MIN_SCALE
        @scale -= View.SCALE_STEP
        do @showOutput
    @elements.$centered.click =>
      @elements.$canvas.translateCanvas
        translateX: -@canvasTranslate.x
        translateY: -@canvasTranslate.y
      @canvasTranslate = x: 0, y: 0
      do @showOutput

    @elements.$canvas.mouseover => @mouseOverCanvas = true
    @elements.$canvas.mouseout => @mouseOverCanvas = false
    @elements.$body.keydown => if event.ctrlKey then @ctrlKeyDown = true
    @elements.$body.keyup => if @ctrlKeyDown then @ctrlKeyDown = false
    @elements.$canvas.mousemove (event) =>
      if not @ctrlKeyDown then @canvasOldCursorPos = x: event.pageX, y: event.pageY
      if @mouseOverCanvas and @ctrlKeyDown
        deltaX = event.pageX - @canvasOldCursorPos.x
        deltaY = event.pageY - @canvasOldCursorPos.y
        @canvasTranslate.x += deltaX
        @canvasTranslate.y += deltaY
        @elements.$canvas.translateCanvas translateX: deltaX, translateY: deltaY
        @canvasOldCursorPos.x = event.pageX
        @canvasOldCursorPos.y = event.pageY
        do @showOutput

    timeRangeSlide = (values) => @elements.$time.text "#{values[0]} .. #{values[1]}"
    @elements.$timeRange.slider
      range: true
      min: Adc.MIN_TIME
      max: Adc.MAX_TIME
      values: [@adc.data.startTime, @adc.data.endTime]
      slide: (event, ui) => timeRangeSlide ui.values
    timeRangeSlide @elements.$timeRange.slider "values"

    timeStepSlide = (values) =>
      @elements.$analogStep.text values[0]
      @elements.$discretePeriod.text values[1]
    @elements.$timeStep.slider
      range: true
      min: Adc.MIN_STEP_TIME
      max: Adc.MAX_STEP_TIME
      step: Adc.DELTA_TIME_STEP
      values: [@adc.data.timeStep, @adc.data.discretePeriod]
      slide: (event, ui) => timeStepSlide ui.values
    timeStepSlide @elements.$timeStep.slider "values"

    levelRangeSlide = (value) =>
      @elements.$bitDepth.text value
      @elements.$level.text Adc.getLevelCount value
    @elements.$levelRange.slider
      min: Adc.MIN_BIT_DEPTH
      max: Adc.MAX_BIT_DEPTH
      value: @adc.data.bitDepth
      slide: (event, ui) => levelRangeSlide ui.value
    levelRangeSlide @elements.$levelRange.slider "value"

    numberOfDecimalsRangeSlide = (value) =>
      @elements.$numberOfDecimals.text value
      @numberOfDecimals = value
    @elements.$numberOfDecimalsRange.slider
      min: @NUMBER_OF_DECIMALS_MIN
      max: @NUMBER_OF_DECIMALS_MAX
      value: @numberOfDecimals
      slide: (event, ui) => numberOfDecimalsRangeSlide ui.value
    numberOfDecimalsRangeSlide @elements.$numberOfDecimalsRange.slider "value"

    voltageRangeSlide = (value) =>
      @elements.$voltage.text value
    @elements.$voltageRange.slider
      min: Adc.MIN_VOLTAGE
      max: Adc.MAX_VOLTAGE
      value: @adc.data.maxVoltage
      slide: (event, ui) => voltageRangeSlide ui.value
    voltageRangeSlide @elements.$voltageRange.slider "value"

    @elements.$canvas.translateCanvas translateX: @canvasWidth / 2, translateY: @canvasHeight / 2


  validateInput: (validated) =>
    hasDangerClass = @elements.$exprInput.hasClass("input-bg-danger")
    if not validated and not hasDangerClass then @elements.$exprInput.addClass("input-bg-danger")
    else if validated and hasDangerClass then @elements.$exprInput.removeClass("input-bg-danger")


#  showError: (error) =>
#    @elements.$error.find("span").text error
#    @elements.$error.show 200


  showOutput: =>
    if @calculated
      do @elements.$canvas.clearCanvas
      do @drawLevels if @wantLevels
      do @drawGrid if @wantGrid
      @drawSignal @adc.data.analog.coords, "red" if @wantAnalogSignal
      @drawSignal @adc.data.quantized.coords, "blue" if @wantQuantizedSignal
      @drawSignal @adc.data.restored.coords, "green" if @wantRestoredSignal
      do @elements.$quantizedSignalInfo.find("tr").not(":first").remove
      do @elements.$digitalSignalInfo.find("tr").not(":first").remove
      do @elements.$restoredSignalInfo.find("tr").not(":first").remove
      do @fillQuantizedSignalInfo
      do @fillDigitalSignalInfo
      do @fillRestoredSignalInfo


  drawSignal: (coords, color) =>
    scaledCoords = @scaleCoords coords
    @elements.$canvas.drawLine jCanvasHelper.newLine scaledCoords, color, 1


  scaleCoords: (coords) =>
    for coord in coords
      copy = $.extend true, {}, coord
      copy.x *= @scale
      copy.y *= -@scale
      copy


  drawGrid: =>
    step = 0.5 * @scale

    # Vertical grid
    x = 0
    yStart = parseInt(@adc.data.analog.minValue * @scale / step) * step - step * 2
    yEnd = parseInt(@adc.data.analog.maxValue * @scale / step) * step + step * 2
    for y in [yStart..yEnd] by step
      begin = x: x - 3, y: y
      end = x: x + 3, y: y
      @elements.$canvas.drawLine jCanvasHelper.newLine [begin, end], "#6C6C6C", 1
    @elements.$canvas.drawLine jCanvasHelper.newLine [{ x: x, y: yStart }, { x: x, y: yEnd }], "#6C6C6C", 1

    # Horizontal grid
    y = 0
    xStart = parseInt(@adc.data.startTime * @scale / step) * step - step * 2
    xEnd = parseInt(@adc.data.endTime * @scale / step) * step + step * 2
    for x in [xStart..xEnd] by step
      begin = x: x, y: y + 3
      end = x: x, y: y - 3
      @elements.$canvas.drawLine jCanvasHelper.newLine [begin, end], "#6C6C6C", 1
    @elements.$canvas.drawLine jCanvasHelper.newLine [{ x: xStart, y: y }, { x: xEnd, y: y }], "#6C6C6C", 1


  drawLevels: =>
    xStart = @adc.data.startTime * @scale
    xEnd = @adc.data.endTime * @scale
    yStart = @adc.data.analog.minValue * @scale
    yEnd = @adc.data.analog.maxValue * @scale
    step = @adc.data.quantized.step * @scale
    for y in [yStart..yEnd + 0.1] by step
      begin = x: xStart, y: y
      end = x: xEnd, y: y
      @elements.$canvas.drawLine jCanvasHelper.newLine [begin, end], "#A1A1A1", 1


  fillQuantizedSignalInfo: =>
    quantizedValues = (c for c, i in @adc.data.quantized.coords by 2)
    for i in [0...quantizedValues.length]
      cellPeriod = $ "<td/>", text: "#{quantizedValues[i].x.toFixed 2} : #{(quantizedValues[i].x + @adc.data.discretePeriod).toFixed 2}"
      cellInput = $ "<td/>", text: parseFloat @adc.data.discrete.coords[i].y.toFixed @numberOfDecimals
      cellQuantized = $ "<td/>", text: parseFloat quantizedValues[i].y.toFixed @numberOfDecimals
      row = $ "<tr/>"
      row.append cellPeriod
      row.append cellInput
      row.append cellQuantized
      @elements.$quantizedSignalInfo.append row


  fillDigitalSignalInfo: =>
    for digit in @adc.data.digitalOutput
      cellPeriod = $ "<td/>", text: "#{digit.time.toFixed 2} : #{(digit.time + @adc.data.discretePeriod).toFixed 2}"
      cellInput = $ "<td/>", text: parseFloat digit.input.toFixed @numberOfDecimals
      cellCode = $ "<td/>", text: digit.binaryOutput
      cellDecode = $ "<td/>", text: parseFloat Adc.decodeBinaryOutput(digit.binaryOutput, @adc.data.quantized.step).toFixed(@numberOfDecimals)
      row = $ "<tr/>"
      row.append cellPeriod
      row.append cellInput
      row.append cellCode
      row.append cellDecode
      @elements.$digitalSignalInfo.append row


  fillRestoredSignalInfo: =>
    for i in [0...@adc.data.restored.coords.length]
      cellPeriod = $ "<td/>", text: "#{@adc.data.digitalOutput[i].time.toFixed 2} : #{(@adc.data.digitalOutput[i].time + @adc.data.discretePeriod).toFixed 2}"
      cellAnalog = $ "<td/>", text: parseFloat @adc.data.discrete.coords[i].y.toFixed @numberOfDecimals
      cellCode = $ "<td/>", text: @adc.data.digitalOutput[i].binaryOutput
      cellRestore = $ "<td/>", text: parseFloat @adc.data.restored.coords[i].y.toFixed @numberOfDecimals
      row = $ "<tr/>"
      row.append cellPeriod
      row.append cellAnalog
      row.append cellCode
      row.append cellRestore
      @elements.$restoredSignalInfo.append row

#endregion

#region Controller

class Controller
  constructor: (@view, @adc) ->
    @view.exprEntered.attach (sender, expr) => @adc.checkExpression expr
    @view.goClicked.attach (sender, data) => @adc.calculateSignals data if @view.validated

#endregion

#region Model

class Adc
  @MIN_TIME: -100
  @MAX_TIME: 100
  @MIN_STEP_TIME: 0.01
  @MAX_STEP_TIME: 0.5
  @MIN_BIT_DEPTH = 2
  @MAX_BIT_DEPTH = 16
  @DELTA_TIME_STEP = 0.01
  @MIN_VOLTAGE = 1
  @MAX_VOLTAGE = 100

  @getLevelCount: (bitDepth) -> Math.pow 2, bitDepth
  @decodeBinaryOutput: (binary, stepOfQuantization) ->
    sign = if binary[0] is "0" then -1 else 1
    numBinary = new String
    if binary[0] is "0"
      sign = -1
      for digit in binary.substring 1
        numBinary += if digit is "1" then "0" else "1"
    else
      sign = 1
      numBinary = binary.substring 1
    parseInt(numBinary, 2) * stepOfQuantization * sign

  constructor: ->
    @expressionChecked = new Event this
    @signalsCalculated = new Event this

    @reg = new RegExp(/^(?:\s*\*?\s*(?:(\-?\d+\.?\d*)\s*\*\s*)?(cos|sin)\s*\((?:\s*(\-?\d+\.?\d*)\s*\*\s*)?(?:\s*(pi)\s*\*)?\s*t\s*(?:\+\s*(\-?\d+\.?\d*))?\s*\)\s*)+$/)

    @data = new Object
    @data.startTime = 0
    @data.endTime = 10
    @data.timeStep = 0.01
    @data.bitDepth = 5
    @data.levelCount = Adc.getLevelCount @data.bitDepth
    @data.discretePeriod = 0.5
    @data.maxVoltage = 5


  checkExpression: (expr) =>
    @expressionChecked.notify @reg.test(expr.toLowerCase())
#    @expressionChecked.notify true

  calculateSignals: (@data) =>
    @data.values = @getValues @data.expr
#    @data.values = @data.expr
    @data.analog = @calculateAnalogSignal @data.values, @data.startTime, @data.endTime, @data.timeStep
    @data.discrete = @calculateDiscreteSignal @data.analog, @data.startTime, @data.endTime, @data.discretePeriod
    @data.quantized = @calculateQuantizedSignal @data.analog, @data.discrete, @data.levelCount, @data.discretePeriod
    @data.digitalOutput = @formDigitalOutput @data.analog, @data.discrete, @data.bitDepth
    @data.restored = @calculateRestoredSignal @data.digitalOutput, @data.maxVoltage
    do @signalsCalculated.notify


  getValues: (expr) ->
    expr = expr.toLowerCase()
    res = expr.replace ")", "),"
    for e in res.split ",", res.match(/\)/g).length
      matches = e.match @reg
      value           = new Object
      value.k         = if matches[1] then parseFloat matches[1] else 1
      value.pi        = if matches[4] then Math.PI else 1
      value.freq      = if matches[3] then matches[3] * value.pi else value.pi
      value.freqShift = if matches[5] then parseFloat matches[5] else 0
      value.func = switch matches[2]
        when "cos" then Math.cos
        when "sin" then Math.sin
      value


  calculateAnalogSignal: (values, startTime, endTime, timeStep) ->
    formula = (t) =>
      res = 1
      res *= v.k * v.func(v.freq * t + v.freqShift) for v in values
      res
#    formula = (t) => eval(values)

    analogCoords = (x: time, y: formula(time) for time in [startTime...endTime] by timeStep)

    max = Math.max.apply Math, analogCoords.map (c) -> c.y
    min = Math.min.apply Math, analogCoords.map (c) -> c.y

    return coords: analogCoords, maxValue: max, minValue: min


  calculateDiscreteSignal: (analog, startTime, endTime, period) ->
    index = 0
    discreteCoords = for time in [startTime...endTime] by period
      index = breakFilter analog.coords, ((c) -> parseFloat(c.x.toFixed(2)) == parseFloat(time.toFixed(2))), index
      $.extend true, {}, analog.coords[index]
    return coords: discreteCoords


  calculateQuantizedSignal: (analog, discrete, levelCount, period) ->
    max = analog.maxValue
    min = analog.minValue
    delta = (max - min) / (levelCount - 1)

    quantizedCoords = []
    for discreteCoord in discrete.coords
      coord = $.extend true, {}, discreteCoord
      coord.y = min + Math.round((coord.y - min) / delta) * delta
      quantizedCoords.push coord
      quantizedCoords.push x: coord.x + period, y: coord.y
    return coords: quantizedCoords, step: delta


  formDigitalOutput: (analog, discrete, bitDepth) ->
    max = analog.maxValue
    min = analog.minValue

    for coord in discrete.coords
      digit = new Object
      digit.time = coord.x
      digit.input = coord.y
      digit.decimalOutput = (max + min) / 2
      digit.binaryOutput = new String

      for i in [0...bitDepth]
        delta = (max - min) / Math.pow 2, (i + 2)
        if digit.input < digit.decimalOutput
          digit.binaryOutput += "0"
          digit.decimalOutput -= delta
        else
          digit.binaryOutput += "1"
          digit.decimalOutput += delta
      digit


  calculateRestoredSignal: (digital, maxVoltage) ->
    console.log maxVoltage
    restoredCoords = for digit in digital
      outVoltage = 0
      for i in [0...digit.binaryOutput.length]
        outVoltage += maxVoltage * parseInt(digit.binaryOutput[i]) / Math.pow(2, i)
      console.log 't = ' + digit.time + ' v = ' + outVoltage
      x: digit.time, y: outVoltage
    coords: restoredCoords
    

#endregion

#region jCanvas helper

class jCanvasHelper
  @newLine: (coords, strokeStyle,  strokeWidth = 1) ->
    line = strokeStyle: strokeStyle, strokeWidth: strokeWidth
    for coord, i in coords
      line["x#{i + 1}"] = coord.x
      line["y#{i + 1}"] = coord.y
    return line

#endregion

#region Event

class Event
  constructor: (@sender) -> @listeners = []
  attach: (listener) -> @listeners.push listener
  detach: (listener) -> @listeners.remove listener
  notify: (args) ->
    for listener in @listeners then listener @sender, args
    return

#endregion

#region Ready

$ ->
  adc = new Adc
  view = new View adc,
    $body: $ "body"
    $time: $ "#time"
    $timeRange: $ "#time-range"
    $timeStep: $ "#time-step"
    $discretePeriod: $ "#quantized-step"
    $analogStep: $ "#analog-step"
    $levelRange: $ "#level-range"
    $numberOfDecimals: $ "#number-of-decimals"
    $numberOfDecimalsRange: $ "#number-of-decimals-range"
    $levelRange: $ "#level-range"
    $level: $ "#level"
    $voltageRange: $ "#voltage-range"
    $voltage: $ "#voltage"
    $bitDepth: $ "#bit-depth"
    $exprInput: $ "#expression"
    $canvas: $ "#canvas"
    $go: $ "#go"
    $drawGrid: $ "#draw-grid"
    $drawAnalogSignal: $ "#draw-analog"
    $drawLevels: $ "#draw-levels"
    $drawQuantizedSignal: $ "#draw-quantized"
    $drawRestoredSignal: $ "#draw-restored"
    $digitalSignalInfo: $ "#digital-signal-info"
    $quantizedSignalInfo: $ "#quantized-signal-info"
    $restoredSignalInfo: $ "#restored-signal-info"
    $zoomIn: $ "#zoom-in"
    $zoomOut: $ "#zoom-out"
    $centered: $ "#centered"
#    $error: $ "#error"
  new Controller view, adc

#endregion