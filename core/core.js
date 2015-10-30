window.Spark = window.Spark || {};

/*
 * Color used for fills, strokes, gradients, etc.
 *
 * value (String): hexadecimal representation of the color. Default: #000000.
 */
window.Spark.Color = function (params) {
  this.value = params.value || '#000000';
  this.toString = function () { return this.value; }
};

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

/*
 * Constants for defining gradient types.
 */
window.Spark.GradientType = {
  LINEAR: 'linear',
  RADIAL: 'radial'
};

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

window.Spark.Core = function () {
  /* PRIVATE */
  var self = this;
  var framesRendered = 0;
  var fpsLastTime = 0;

  var transform = function (transform) {
    self.context.save();

    self.context.translate(transform.positionX, transform.positionY);
    self.context.rotate(Math.degToRad(transform.rotation));
    self.context.scale(transform.scaleX, transform.scaleY);
    self.context.translate(transform.offsetX, transform.offsetY);
  };

  var reset = function () {
    self.context.restore();
  };

  var prepareColor = function ($color) {
    var result;

    if ($color instanceof Spark.Gradient) {
      if ($color.type == Spark.GradientType.RADIAL) {
        result = self.context.createRadialGradient($color.startX, $color.startY, $color.innerRadius, $color.endX, $color.endY, $color.outerRadius);
      } else {
        result = self.context.createLinearGradient($color.startX, $color.startY, $color.endX, $color.endY);
      }

      for (var i = 0; i < $color.colorStops.length; i++) {
        var currentColorStop = $color.colorStops[i];

        result.addColorStop(currentColorStop.position || ((1 / ($color.colorStops.length - 1)) * i), currentColorStop.color.value);
      }
    } else if ($color instanceof Spark.Color) {
      result = $color.value;
    } else {
      result = $color;
    }

    return result || 'transparent';
  };

  var fillAndStroke = function ($fillColor, $strokeColor, $strokeWidth) {
    self.context.fillStyle = prepareColor($fillColor);
    self.context.strokeStyle = prepareColor($strokeColor);
    self.context.lineWidth = $strokeWidth;

    if ($fillColor) {
      self.context.fill();
    }

    if ($strokeColor) {
      self.context.stroke();
    }
  };

  var fillAndStrokeText = function ($text, $fillColor, $strokeColor, $strokeWidth) {
    self.context.fillStyle = prepareColor($fillColor);
    self.context.strokeStyle = prepareColor($strokeColor);
    self.context.lineWidth = $strokeWidth;

    if ($fillColor) {
      self.context.fillText($text, 0, 0);
    }

    if ($strokeColor) {
      self.context.strokeText($text, 0, 0);
    }
  };

  /* PUBLIC */

  this.canvas;
  this.context;
  this.deltaTime;
  this.fps;
  this.showFps = false;

  /*
   * Receives a DOM element and setups a canvas inside it.
   */
  this.setup = function ($elementId, $width, $height) {
    if (typeof($elementId) === 'undefined') {
      return;
    }

    var canvasId = 'canvasIdeCanvas';

    document.getElementById($elementId).innerHTML = '<canvas id="' + canvasId + '"></canvas>';

    this.canvas = document.getElementById(canvasId);
    this.canvas.setAttribute('width', $width);
    this.canvas.setAttribute('height', $height);
    this.canvas.setAttribute('style', 'border: 1px solid #dddddd;');
    this.context = this.canvas.getContext('2d');
    this.setupRequestAnimationFrame();
  };

  /*
   * Sets a constant loop for refreshing the canvas.
   */
  this.setMainLoop = function ($mainLoop) {
    (function magicLoop() {
      window.requestAnimationFrame(magicLoop);
      self.deltaTime = Date.now();

      if ((Date.now() - fpsLastTime) > 1000) {
        fpsLastTime = Date.now();
        self.fps = framesRendered;
        framesRendered = 0;
      }

      self.clear();

      $mainLoop();

      if (self.showFps == true) {
        self.drawText({
          transform: {
            positionX: 630,
            positionY: 20
          },
          text: 'FPS: ' + cc.fps,
          alignment: 'end',
          fill: '#f00'
        });
      }

      self.deltaTime = Date.now() - self.deltaTime;

      framesRendered++;
    })();
  };

  /*
   * Clears the canvas.
   */
  this.clear = function () {
    this.canvas.width = this.canvas.width;
  };

  /*
   * Ensures `window.requestAnimationFrame` exists.
   */
  this.setupRequestAnimationFrame = function () {
    var raf = window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.msRequestAnimationFrame ||
              function (callback) {
                window.setTimeout(callback, 1000 / 60);
              };

    window.requestAnimationFrame = raf;
  };

  /*
   * Generic text drawing function.
   *
   * text (String): 
   * fontFamily (String): 
   * fontSize (Number): 
   * fontStyle (String): 
   * alignment (String): 
   * fill (Spark.Color): 
   * stroke (Spark.Color):
   * strokeWidth (Number):
   */
  this.drawText = function (params) {
    transform(params.transform);

    this.context.font = [params.fontStyle || '', (params.fontSize || 12) + 'pt', params.fontFamily || 'Courier'].join(' ');
    this.context.textAlign = params.alignment || 'start';

    fillAndStrokeText(params.text, params.fill || '#000', params.stroke, params.strokeWidth);
    reset();
  };

  /*
   * Generic rect drawing function.
   *
   * transform (Spark.Transform):
   * width (Number):
   * height (Number):
   * fill (Spark.Color):
   * stroke (Spark.Color):
   * strokeWidth (Number):
   */
  this.drawRect = function (params) {
    transform(params.transform);

    this.context.beginPath();
    this.context.rect(0, 0, params.width, params.height);
    this.context.closePath();

    fillAndStroke(params.fill, params.stroke, params.strokeWidth);
    reset();
  };

  /*
   * Draws an ellipsoid.
   *
   * transform (Spark.Transform):
   * width (Number):
   * height (Number):
   * fill (Spark.Color):
   * stroke (Spark.Color):
   * strokeWidth (Number):
   */
  this.drawEllipse = function (params) {
    transform(params.transform);
    
    this.context.beginPath();

    var o = 0.551915024494;
    var a = o * (params.width / 2);
    var b = params.height / 2;
    var c = params.width / 2;
    var d = -o * b;
    var e = o * b;

    this.context.moveTo(0 + c, 0);
    this.context.bezierCurveTo(a + c, -b + b, c + c, d + b, c + c, 0 + b);
    this.context.bezierCurveTo(c + c, e + b, a + c, b + b, 0 + c, b + b);
    this.context.bezierCurveTo(-a + c, b + b, -c + c, e + b, -c + c, 0 + b);
    this.context.bezierCurveTo(-c + c, d + b, -a + c, -b + b, 0 + c, -b + b);

    this.context.closePath();

    fillAndStroke(params.fill, params.stroke, params.strokeWidth);
    reset();
  };

  /*
   * Draws a circle using the `drawEllipse` function.
   *
   * transform (Spark.Transform):
   * radius (Number):
   * fill (Spark.Color):
   * stroke (Spark.Color):
   * strokeWidth (Number):
   */
  this.drawCircle = function (params) {
    this.drawEllipse({
      transform: params.transform,
      width: params.radius * 2,
      height: params.radius * 2,
      fill: params.fill,
      stroke: params.stroke,
      strokeWidth: params.strokeWidth
    });
  };

  /*
   * Draws a single line.
   *
   * transform (Spark.Transform):
   * endX (Number):
   * endY (Number):
   * fill (Spark.Color):
   * stroke (Spark.Color):
   * strokeWidth (Number):
   */
  this.drawLine = function (params) {
    transform(params.transform);

    this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.lineTo(params.endX, params.endY);

    fillAndStroke(params.fill, params.stroke, params.strokeWidth);
    reset();
  };

  /*
   * Draws a perfectly spherical arc.
   *
   * transform (Spark.Transform):
   * radius (Number):
   * startAngle (Number):
   * endAngle (Number):
   * fill (Spark.Color):
   * stroke (Spark.Color):
   * strokeWidth (Number):
   */
  this.drawArc = function (params) {
    transform(params.transform);

    this.context.beginPath();
    this.context.arc(0, 0, params.radius, Math.degToRad(params.startAngle), Math.degToRad(params.endAngle));

    fillAndStroke(params.fill, params.stroke, params.strokeWidth);
    reset();
  };

  /*
   * Draws a bezier curve.
   *
   * transform (Spark.Transform):
   * anchor1X (Number):
   * anchor1Y (Number):
   * anchor2X (Number):
   * anchor2Y (Number):
   * endX (Number):
   * endY (Number):
   * fill (Spark.Color):
   * stroke (Spark.Color):
   * strokeWidth (Number):
   */
  this.drawBezierCurve = function (params) {
    transform(params.transform);

    this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.bezierCurveTo(params.anchor1X, params.anchor1Y, params.anchor2X, params.anchor2Y, params.endX, params.endY);

    fillAndStroke(params.fill, params.stroke, params.strokeWidth);
    reset();
  };

  /*
   * Draws a quadratic curve.
   *
   * transform (Spark.Transform):
   * anchorX (Number):
   * anchorY (Number):
   * endX (Number):
   * endY (Number):
   * fill (Spark.Color):
   * stroke (Spark.Color):
   * strokeWidth (Number):
   */
  this.drawQuadraticCurve = function (params) {
    transform(params.transform);
    
    this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.quadraticCurveTo(params.anchorX, params.anchorY, params.endX, params.endY);

    fillAndStroke(params.fill, params.stroke, params.strokeWidth);
    reset();
  };

  /*
   * Draws an image
   *
   * transform (Spark.Transform):
   * image (Spark.Image):
   * clip (Object):
   */
  this.drawImage = function (params) {
    transform(params.transform);

    if (params.clip) {
      this.context.beginPath();
      this.context.rect(params.clip.x, params.clip.y, params.clip.width, params.clip.height);
      this.context.clip();
    }

    this.context.drawImage(params.image.get(), 0, 0);

    reset();
  };

  /*
   * Draws a sprite from a spritesheet.
   */
  this.drawSprite = function (params) {
    transform(params.transform);

    if (params.clip) {
      this.context.beginPath();
      this.context.rect(params.clip.x, params.clip.y, params.clip.width, params.clip.height);
      this.context.clip();
    }

    if (params.offset) {
      this.context.drawImage(params.image, 0 - (params.offset.x || 0), 0 - (params.offset.y || 0));
    } else {
      this.context.drawImage(params.image, 0, 0);
    }

    reset();
  };

  /*
   * Draws a closed path.
   * TODO: receive and array of classes (Line, Curve, BezierCurve and QuadraticCurve) instead of objects.
   *
   * transform (Spark.Transform):
   * segments (????):
   * startingPoint (????):
   * fill (Spark.Color):
   * stroke (Spark.Color):
   * strokeWidth (Number):
   */
  this.drawPath = function (params) {
    transform(params.transform);

    var currentSegment;

    this.context.beginPath();
    this.context.moveTo(params.startingPoint.x, params.startingPoint.y);

    for (var i = 0; i < params.segments.length; i++) {
      currentSegment = params.segments[i];

      this.context.lineTo(currentSegment.x, currentSegment.y);
    }

    this.context.closePath();

    fillAndStroke(params.fill, params.stroke, params.strokeWidth);
    reset();
  };
};
