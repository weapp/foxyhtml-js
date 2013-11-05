(function() {

  var root = this;

  var fi = {};

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = fi;
    }
    exports.fi = fi;
  } else {
    root.fi = fi;
  }

  var iterify = fi.iterify = function(array) {
    var index = 0;
    var length = array.length;

    var iter = function() {
      return (index < length) ? array[index++] : void 0;
    }
    return iter
  }

  var willClone = fi.willClone = function(itrable) {
    if (itrable instanceof willClone) return itrable;
    if (!(this instanceof willClone)) return new willClone(itrable);
    this.iterable = itrable;
    this.clone = [];
  };

  willClone.prototype.getClone = function() {
    var _this = this;
    var index = 0;
    var iter = function() {
      var result;
      if (index < _this.clone.length) {
        result = _this.clone[index];
      } else {
        result = _this.iterable()
        if (result !== undefined) {
          _this.clone[index] = result;
        }
      }
      ++index;
      return result;
    }
    return iter
  };


  // arr = [1, 2, 3]
  // iter = iterify(arr)
  // cloneStation = willClone(iter)
  // clone = cloneStation.getClone()

  // while (obj = clone()) {
  //   console.log(obj)
  // }
  // clone = cloneStation.getClone()

  // while (obj = clone()) {
  //   console.log(obj)
  // }
  // clone = cloneStation.getClone()

  // while (obj = clone()) {
  //   console.log(obj)
  // }


}).call(this);
