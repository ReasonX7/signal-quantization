class Coordinate2d
  _x = 0
  _y = 0

  _private = -> "private"

  constructor: (x, y) ->
    _x = x
    _y = y
  getX: -> _x
  setX: (value) -> _x = value
  getY: -> _y
  setY: (value) -> _y = value

class Coordinate3d extends Coordinate2d
  _z = 0
  constructor: (x, y, z) ->
    super(x, y)
    _z = z
  getX: -> _z
  setX: (value) -> _z = value
  getPrivate: -> return super._private().call()

c = new Coordinate3d(2, 3, 4)
console.log c.getPrivate()