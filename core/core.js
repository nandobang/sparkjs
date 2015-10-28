window.AtomicCanvas = window.AtomicCanvas || {};

/*
 * Color used for fills, strokes, gradients, etc.
 *
 * value (String): hexadecimal representation of the color. Default: #000000.
 */
window.AtomicCanvas.Color = function (params) {
  this.value = params.value || '#000000';
  this.toString = function () { return this.value; }
};

/*
 * Color stops used on gradients.
 *
 * position (Number): the position of this ColorStop when used on a gradient, ranging from 0 to 1. If omitted, it is calculated automatically.
 * color (Color): the color used for this ColorStop.
 */
window.AtomicCanvas.ColorStop = function (params) {
  this.position = params.position;
  this.color = params.color || new AtomicCanvas.Color();
};

/*
  params: {
    type (GradientType): the type of the gradient.
    colorStops (ColorStop[]): array of ColorStops.
    startX (Number): horizontal starting point relative to the top-left transform point.
    startY (Number): vertical starting point relative to the top-left transform point.
    endX (Number): horizontal ending point relative to the top-left transform point.
    endY (Number): vertical ending point relative to the top-left transform point.
    innerRadius (Number): inner radius where the color ramp starts (only for radial gradients).
    outerRadius (Number): outer radius where the color ramp stops (only for radial gradients).
  }
 */
window.AtomicCanvas.Gradient = function (params) {
  this.type = params.type || AtomicCanvas.GradientType.LINEAR;
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
window.AtomicCanvas.GradientType = {
  LINEAR: 'linear',
  RADIAL: 'radial'
};

/*
 * Transform with translation, rotation and scale.
 */
window.AtomicCanvas.Transform = function (params) {
  this.positionX = params.positionX || 0;
  this.positionY = params.positionY || 0;
  this.rotation = params.rotation || 0;
  this.scaleX = params.scaleX || 1;
  this.scaleY = params.scaleY || 1;
};

window.AtomicCanvas.Core = function () {
  var self = this;

  this.canvas;
  this.context;
  this.deltaTime;

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
      self.clearContext();
      $mainLoop();
      self.deltaTime = Date.now() - self.deltaTime;
    })();
  };

  /*
   * Clears the canvas.
   */
  this.clearContext = function () {
    this.canvas.width = this.canvas.width;
  };

  /*
   * Ensures 'window.requestAnimationFrame' exists.
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
   */
  this.drawText = function ($x, $y, $text, $fontFamily, $fontSize, $fontStyle, $color, $alignment) {
    this.context.fillStyle = $color || '#000000';
    this.context.font = [$fontStyle || '', $fontSize || '12pt', $fontFamily || 'Courier'].join(' ');
    this.context.textAlign = $alignment || 'start';
    this.context.fillText($text, $x, $y);
  };

  /*
   * Draws a hollowed text.
   */
  this.drawHollowText = function ($x, $y, $text, $fontFamily, $fontSize, $fontStyle, $color, $lineWidth, $alignment) {
    this.context.strokeStyle = $color || '#000000';
    this.context.lineWidth = $lineWidth || 1;
    this.context.font = [$fontStyle || '', $fontSize || '12pt', $fontFamily || 'Courier'].join(' ');
    this.context.textAlign = $alignment || 'start';
    this.context.strokeText($text, $x, $y);
  };

  /*
   * Generic rect drawing function.
   */
  this.drawRect = function ($transform, $w, $h, $color) {
    var $x = $transform.positionX;
    var $y = $transform.positionY;
    var fill;

    if ($color instanceof AtomicCanvas.Gradient) {
      if ($color.type == AtomicCanvas.GradientType.RADIAL) {
        fill = this.context.createRadialGradient($color.startX, $color.startY, $color.innerRadius, $color.endX, $color.endY, $color.outerRadius);
      } else {
        fill = this.context.createLinearGradient($color.startX, $color.startY, $color.endX, $color.endY);
      }

      for (var i = 0; i < $color.colorStops.length; i++) {
        var currentColorStop = $color.colorStops[i];

        fill.addColorStop(currentColorStop.position || ((1 / ($color.colorStops.length - 1)) * i), currentColorStop.color.value);
      }
    } else if ($color instanceof AtomicCanvas.Color) {
      fill = $color.value;
    } else {
      fill = $color;
    }

    // this.context.translate($x + 20, $y + 20); // PIVOT POINT
    this.context.translate($x, $y);
    this.context.rotate(Math.degToRad($transform.rotation));
    // this.context.translate(-20, -20); // PIVOT POINT
    this.context.scale($transform.scaleX, $transform.scaleY);

    this.context.fillStyle = fill;
    this.context.fillRect(0, 0, $w, $h);

    this.context.setTransform(1, 0, 0, 1, 0, 0);
  };

  this.drawEllipse = function ($x, $y, $w, $h, $fill, $stroke, $strokeWidth) {
    this.context.fillStyle = $fill;
    this.context.strokeStyle = $stroke;
    this.context.lineWidth = $strokeWidth || 0;
    this.context.beginPath();

    var o = 0.551915024494;
    var a = o * ($w / 2);
    var b = $h / 2;
    var c = $w / 2;
    var d = -o * b;
    var e = o * b;

    this.context.translate($x, $y);

    this.context.moveTo(0 + c, 0);
    this.context.bezierCurveTo(a + c, -b + b, c + c, d + b, c + c, 0 + b);
    this.context.bezierCurveTo(c + c, e + b, a + c, b + b, 0 + c, b + b);
    this.context.bezierCurveTo(-a + c, b + b, -c + c, e + b, -c + c, 0 + b);
    this.context.bezierCurveTo(-c + c, d + b, -a + c, -b + b, 0 + c, -b + b);

    if ($fill) {
      this.context.fill();
    }

    if ($stroke) {
      this.context.stroke();
    }

    this.context.closePath();

    this.context.setTransform(1, 0, 0, 1, 0, 0);
  };

  this.drawCircle = function ($x, $y, $radius, $fill, $stroke, $strokeWidth) {
    this.drawEllipse($x, $y, $radius * 2, $radius * 2, $fill, $stroke, $strokeWidth);
  };

  this.drawLine = function ($startX, $startY, $endX, $endY, $color, $width) {
    this.context.strokeStyle = $color;
    this.context.lineWidth = $width;
    this.context.beginPath();
    this.context.moveTo($startX, $startY);
    this.context.lineTo($endX, $endY);
    this.context.stroke();
    this.context.closePath();
  };

  this.drawArc = function ($startX, $startY, $anchorX, $anchorY, $endX, $endY, $fill, $stroke, $strokeWidth) {
  };

  this.drawBezierCurve = function ($startX, $startY, $anchor1X, $anchor1Y, $anchor2X, $anchor2Y, $endX, $endY, $fill, $stroke, $strokeWidth) {
    this.context.fillStyle = $fill;
    this.context.strokeStyle = $stroke;
    this.context.lineWidth = $strokeWidth || 0;
    this.context.beginPath();

    this.context.moveTo($startX, $startY);
    this.context.bezierCurveTo($anchor1X, $anchor1Y, $anchor2X, $anchor2Y, $endX, $endY);

    if ($fill) {
      this.context.fill();
    }

    if ($stroke) {
      this.context.stroke();
    }

    this.context.closePath();
  };

  this.drawQuadraticCurve = function ($startX, $startY, $anchorX, $anchorY, $endX, $endY, $fill, $stroke, $strokeWidth) {
    this.context.fillStyle = $fill;
    this.context.strokeStyle = $stroke;
    this.context.lineWidth = $strokeWidth || 0;
    this.context.beginPath();

    this.context.moveTo($startX, $startY);
    this.context.quadraticCurveTo($anchorX, $anchorY, $endX, $endY);

    if ($fill) {
      this.context.fill();
    }

    if ($stroke) {
      this.context.stroke();
    }

    this.context.closePath();
  };

  /*
   * Draws an image
   */
  this.drawImage = function (params) {
    this.context.save();

    this.context.translate(params.transform.positionX, params.transform.positionY);
    this.context.rotate(Math.degToRad(params.transform.rotation));
    this.context.scale(params.transform.scaleX, params.transform.scaleY);

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

    this.context.restore();
  };

  this.drawPath = function() {};
};
