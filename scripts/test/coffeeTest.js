// Generated by CoffeeScript 1.9.1
(function() {
  var Coordinate2d, Coordinate3d, c,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Coordinate2d = (function() {
    var _private, _x, _y;

    _x = 0;

    _y = 0;

    _private = function() {
      return "private";
    };

    function Coordinate2d(x, y) {
      _x = x;
      _y = y;
    }

    Coordinate2d.prototype.getX = function() {
      return _x;
    };

    Coordinate2d.prototype.setX = function(value) {
      return _x = value;
    };

    Coordinate2d.prototype.getY = function() {
      return _y;
    };

    Coordinate2d.prototype.setY = function(value) {
      return _y = value;
    };

    return Coordinate2d;

  })();

  Coordinate3d = (function(superClass) {
    var _z;

    extend(Coordinate3d, superClass);

    _z = 0;

    function Coordinate3d(x, y, z) {
      Coordinate3d.__super__.constructor.call(this, x, y);
      _z = z;
    }

    Coordinate3d.prototype.getX = function() {
      return _z;
    };

    Coordinate3d.prototype.setX = function(value) {
      return _z = value;
    };

    Coordinate3d.prototype.getPrivate = function() {
      return Coordinate3d.__super__.getPrivate.apply(this, arguments)._private().call();
    };

    return Coordinate3d;

  })(Coordinate2d);

  c = new Coordinate3d(2, 3, 4);

  console.log(c.getPrivate());

}).call(this);

//# sourceMappingURL=coffeeTest.js.map
