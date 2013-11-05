var fi = require('./fi.js');

(function() {
  var closetag = "(</[a-zA-Z][^s>/]*[^>]*>)";
  var singletag = "(<[a-zA-Z][^s>/]*(?:[^/>]|/[^>])*/>)";
  var tag = "(<[a-zA-Z][^s>/]+[^>]*>)";
  var notag = "([^<]+)";
  var comment = "(<!--[^>]*-->)";
  var other = "(.)";
  var reHtml = new RegExp(closetag + "|" + singletag + "|" + tag + "|" +
    notag + "|" + comment + "|" + other, "mi");
  var reTagName = /<([^\s>\/]+)/mi;
  var reCloseTagName = /<\/([^\s>\/]+)/mi;
  var reTagId = /\sid=(("[^"]*")|('[^']*')|[^\s>]+)/mi;
  var reTagCls = /\sclass=(("[^"]*")|('[^']*')|[^\s>]+)/mi;

  var TypeNode = {
    'tag': 1,
    'singletag': 2,
    'closetag': 3,
    'notag': 4,
    'other': 5
  };

  TypeNode = {
    'tag': 'tag',
    'singletag': 'singletag',
    'closetag': 'closetag',
    'notag': 'notag',
    'other': 'other'
  };

  var singletags = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

  var nextIterOccurrence = function(data, regexp) {
    var arr = regexp.exec(data);
    if (arr) {
      delete arr.input;
    }
    return arr;
  };

  var iterOccurrences = function(data, regexp) {
    var _data = data;
    var inner = function() {
      var arr;
      if (_data.length !== 0) {
        arr = nextIterOccurrence(_data, regexp);
        _data = _data.substring(arr.index + arr[0].length);
      }
      return arr;
    };
    return inner;
  };

  var Node = function(type, content, name, id, cls) {
    this.type = type;
    this.content = content;
    this.name = name && name.toLowerCase();
    this.id = id;
    this.cls = cls;
  };

  Node.prototype.toString = function() {
    return this.type + ": " + this.content;
  };

  Node.prototype.isTag = function() {
    return this.type == TypeNode.tag || this.type == TypeNode.singletag;
  };

  Node.prototype.isCloseTag = function() {
    return this.type == TypeNode.closetag || this.type == TypeNode.singletag;
  };

  Node.prototype.check = function(properties) {
    var result = true;
    for (var property in properties) {
      result = result && (properties[property] === undefined || this[property] === properties[property]);
    }
    return result;
  };

  var translateOccurrence = function(all, closetag, singletag, tag, notag, comment, other) {
    if (all === null)
      return null;
    tag = tag || singletag;
    if (tag) {
      var tagName = reTagName.exec(tag)[1];
      var id = trimQuotes(reTagId.exec(tag));
      var cls = splitClass(trimQuotes(reTagCls.exec(tag)));
      var type = (singletags[tagName] || !! singletag) ? "singletag" : "tag";
      return new Node(TypeNode[type], tag, tagName, id, cls);
    } else if (closetag) {
      return new Node(TypeNode.closetag, closetag, reCloseTagName.exec(closetag)[1]);
    } else if (notag || comment || other) {
      return new Node(TypeNode.notag, notag || comment || other);
    }
  };

  var occurrences = this.occurrences = function(data) {
    var iter = iterOccurrences(data, reHtml);
    var inner = function() {
      return translateOccurrence.apply(null, iter());
    };
    return inner;
  };

  var FoxyHtmlParser = this.FoxyHtmlParser = function() {};

  FoxyHtmlParser.prototype.parse = function(data) {
    return new FoxyHtml(occurrences(data));
  };


  var FoxyHtml = this.FoxyHtml = function(data) {
    this.data = fi.willClone(data);
  };

  FoxyHtml.prototype.toString = function() {
    var r = "";
    var iter = this.data.getClone();
    while (it = iter()) {
      r += it.content;
    }
    return r;

  };


  FoxyHtml.prototype.search = function(tagname, id, cls, fun) {
    var _this = this;
    var iter = this.data.getClone();

    tagname = tagname && tagname.toLowerCase();

    var inner = function() {
      var depth = 0;
      var result = [];
      var closeTagName;
      while (node = iter()) {
        var result;
        if (!depth && node.isTag() && (!fun || fun(node)) && node.check({
          name: tagname,
          id: id,
          cls: cls
        })) {
          closeTagName = node.name;
          depth++;
        } else if (depth && node.isTag() && node.name == closeTagName) {
          depth++;
        }

        if (depth > 0) {
          result.push(node)
        }

        if (depth > 0 && node.isCloseTag() && node.name == closeTagName) {
          --depth;
        }

        if (result.length && !depth) {
          break
        }
      }

      if (result.length) {
        return new FoxyHtml(fi.iterify(result));
      } else {
        return void 0;
      }


    };

    return inner;
  };

  // Utils

  function trimQuotes(s) {
    return s && s.replace(/^'+|'+$|^"+|"+$/g, '');
  }

  function splitClass(cls) {
    return cls ? cls.split(/\s+/) : [];
  }

  function makeMap(str) {
    var obj = {}, items = str.split(",");
    for (var i = 0; i < items.length; i++)
      obj[items[i]] = true;
    return obj;
  }


})();

var fs = require('fs');

fs.readFile('example.txt', 'utf8', function(err, data) {
  if (err) {
    return console.log(err);
  }

  parser = new FoxyHtmlParser(); //.search(cls = "nib-inner");

  p = parser.parse(data);

  iter = p.search('nowplaying-info');


  while (obj = iter()) {
    console.warn(obj.toString());
    console.log('------')
  }


});
