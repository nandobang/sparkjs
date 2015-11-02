/*
 * Color used for fills, strokes, gradients, etc.
 *
 * value (String): hexadecimal representation of the color. Default: #000000.
 */
window.Spark.Color = function (params) {
  this.value = params.value || '#000000';
  this.toString = function () { return this.value; };
};
