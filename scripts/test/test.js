var Class = easejs.Class;

var Coordinate2d = Class("Coordinate2d", {
    "protected _x": 0,
    "protected _y": 0,
    "public virtual __construct": function(x, y) {
        this.initCoordinate2d(x, y);
    },
    "protected initCoordinate2d": function(x, y) {
        this._x = x;
        this._y = y;
    },
    "public setX": function(value) {
        this._x = value;
    },
    "public getX": function() {
        return this._x;
    },
    "public setY": function(value) {
        this._y = value;
    },
    "public getY": function() {
        return this._y;
    }
});

var Coordinate3d = Class("Coordinate3d").extend(Coordinate2d, {
    "private _z": 0,
    "public override __construct": function(x, y, z) {
        this.__super(x, y);
        this._z = z;
    },
    "public setZ": function(value) {
        this._z = value;
    },
    "public getZ": function() {
        return this._z;
    }
});

var c = new Coordinate3d(1, 2, 3);
console.log("x = " + c.getX());
console.log("y = " + c.getY());
console.log("z = " + c.getZ());