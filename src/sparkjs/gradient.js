/*
 * Gradients used for fill/stroke.
 *
 * type (GradientType): the type of the gradient.
 * colorStops (ColorStop[]): array of ColorStops.
 * startX (Number): horizontal starting point relative to the top-left transform point.
 * startY (Number): vertical starting point relative to the top-left transform point.
 * endX (Number): horizontal ending point relative to the top-left transform point.
 * endY (Number): vertical ending point relative to the top-left transform point.
 * innerRadius (Number): inner radius where the color ramp starts (only for radial gradients).
 * outerRadius (Number): outer radius where the color ramp stops (only for radial gradients).
 */
window.Spark.Gradient = function (params) {
  this.type = params.type || Spark.GradientType.LINEAR;
  this.colorStops = params.colorStops || [];
  this.startX = params.startX || 0;
  this.startY = params.startY || 0;
  this.endX = params.endX || 0;
  this.endY = params.endY || 0;
  this.innerRadius = params.innerRadius || 0;
  this.outerRadius = params.outerRadius || 1;
};
