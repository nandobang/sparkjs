/*
 * Color stops used on gradients.
 *
 * position (Number): the position of this ColorStop when used on a gradient, ranging from 0 to 1. If omitted, it is calculated automatically.
 * color (Color): the color used for this ColorStop.
 */
window.Spark.ColorStop = function (params) {
  this.position = params.position;
  this.color = params.color || new Spark.Color();
};
