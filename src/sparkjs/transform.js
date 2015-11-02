/*
 * Transform with translation, rotation and scale.
 *
 * positionX (Number):
 * positionY (Number):
 * rotation (Number):
 * scaleX (Number):
 * scaleY (Number):
 * offsetX (Number):
 * offsetY (Number):
 */
window.Spark.Transform = function (params) {
  this.positionX = params.positionX || 0;
  this.positionY = params.positionY || 0;
  this.rotation = params.rotation || 0;
  this.scaleX = params.scaleX || 1;
  this.scaleY = params.scaleY || 1;
  this.offsetX = params.offsetX || 0;
  this.offsetY = params.offsetY || 0;
};
