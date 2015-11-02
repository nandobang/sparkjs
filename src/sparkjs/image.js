/*
 * Base class for images used on rendering.
 *
 * TODO: load LZMA compressed string.
 */
window.Spark.Image = function (params) {
  var image = new Image();

  this.get = function () {
    return image;
  };

  this.loadFromUrl = function (url) {
    image.src = url;
  };

  this.loadFromBase64 = function (type, content) {
    image.src = 'data:image/' + type + ';base64,' + content;
  };

  if (params.url) {
    image.src = params.url;
  } else if (params.type && params.content) {
    image.src = 'data:image/' + params.type + ';base64,' + params.content;
  }
};
