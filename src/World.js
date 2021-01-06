// Animal.js
// Vertex Shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'attribute vec4 a_Normal;\n' +
  'varying vec2 v_TexCoord;\n' +
  'varying vec4 v_NormalVis;\n' +
  'varying vec4 v_color;\n' +
  'varying vec3 v_LightDirection;\n' +
  'varying vec3 v_VertexPosition3;\n' +
  'varying vec3 v_Normal;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform vec4 u_color;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;\n' + // Coordinates
  '  v_TexCoord = a_TexCoord;\n' +
  '  v_NormalVis = a_Normal;\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  // Calculate world coordinate of vertex
  '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
  '  v_VertexPosition3 = vec3(vertexPosition) / vertexPosition.w;\n' +
  // Calculate the light direction and make it 1.0 in length
  //'  v_LightDirection = normalize(u_LightPosition - v_VertexPosition3);\n' +
  '  v_color = u_color;\n' +
  '}\n';

// Fragment Shader Program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_SamplerSky;\n' +
  'uniform sampler2D u_SamplerGround;\n' +
  'uniform sampler2D u_SamplerBlock;\n' +
  'uniform vec3 u_LightColor;\n' +
  'uniform float u_Ka;\n' +
  'uniform float u_Kd;\n' +
  'uniform float u_Ks;\n' +
  'uniform vec3 u_AmbientLight;\n' +
  'uniform float u_lightMode;\n' +
  'uniform float u_shininess;\n' +
  'uniform vec3 u_LightPosition;\n' +
  'uniform vec3 u_ViewPosition;\n' +
  'uniform vec3 u_SpecularLight;\n' +
  'varying vec2 v_TexCoord;\n' +
  'varying vec4 v_NormalVis;\n' +
  'varying vec4 v_color;\n' +
  'varying vec3 v_LightDirection;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_VertexPosition3;\n' +
  'uniform float u_texture;\n' +
  'uniform float u_NormalVal;\n' +
  'void main() {\n' +
  '  float texture = u_texture;\n' +
  '  float val = u_NormalVal;\n' +
  '  float lightMode = u_lightMode;\n' +
  '  if (val == 1.0)\n' +
  '     gl_FragColor = vec4(v_NormalVis*0.5 + 0.5);\n' +
  '  else {\n' +
  // The dot product of the light direction and the normal
  '    vec3 lightDirection = normalize(u_LightPosition - v_VertexPosition3);\n' +
  '    float nDotL = max(dot(v_Normal, lightDirection), 0.0);\n' +
  '    float specular = 0.0;\n' +
  '    if (nDotL > 0.0){\n' +
  '      vec3 R = reflect(-lightDirection, v_Normal);\n' +
  '      vec3 V = normalize(u_ViewPosition - v_VertexPosition3);\n' +
  '      float specAngle = max(dot(V, R), 0.0);\n' +
  '      specular = pow(specAngle, u_shininess);\n' +
  '    }\n' +
  '    float diffuse = nDotL;\n' +
  '    if (texture == 0.0){\n' +
  '      highp vec4 texelColor = texture2D(u_SamplerSky, v_TexCoord);\n' +
  '      gl_FragColor = vec4(u_Ka * u_AmbientLight + u_Kd * diffuse * texelColor.rgb * u_LightColor + u_Ks * specular * u_SpecularLight, texelColor.a );\n' +
  '      if (lightMode == 1.0) gl_FragColor = texelColor;\n' +
  '    }\n' +
  '    if (texture == 1.0){\n' +
  '      highp vec4 texelColor = texture2D(u_SamplerGround, v_TexCoord);\n' +
  '      gl_FragColor = vec4(u_Ka * u_AmbientLight + u_Kd * diffuse * texelColor.rgb * u_LightColor + u_Ks * specular* u_SpecularLight, texelColor.a );\n' +
  '      if (lightMode == 1.0) gl_FragColor = texelColor;\n' +
  '    }\n' +
  '    if (texture == 2.0){\n' +
  '      highp vec4 texelColor = texture2D(u_SamplerBlock, v_TexCoord);\n' +
  '      gl_FragColor = vec4(u_Ka * u_AmbientLight + u_Kd * diffuse * texelColor.rgb * u_LightColor + u_Ks * specular* u_SpecularLight, texelColor.a );\n' +
  '      if (lightMode == 1.0) gl_FragColor = texelColor;\n' +
  '    }\n' +
  '    if (texture == 3.0){\n' +
  '      gl_FragColor = vec4(u_Ka * u_AmbientLight + u_Kd * diffuse * v_color.rgb * u_LightColor + u_Ks * specular* u_SpecularLight, v_color.a );\n' +
  '      if (lightMode == 1.0) gl_FragColor = v_color;\n' +
  '    }\n' +
  '    if (texture == 4.0){\n' +
  '      gl_FragColor = v_color;\n' +
  '    }\n' +
  '  }\n' +
  '}\n';

var cameraX = 5 ;
var cameraY = 2;
var cameraZ = 15;
var directionX = 0;
var directionY = 0;
var directionZ = 0;
var rotationX = 0;
var rotationY = -90;
var rotationZ = 0;
var normalVal = -1;
var lightMode = -1;
var currentAngle = 0.0;
var kaValue = 0.5;
var kdValue = 1.0;
var ksValue = 1.0;
var ambientLightValue = [0.2, 0.2, 0.2];
var diffuseLightValue = [0.44, 0.44, 0.42];
var specularLightValue = [1.0, 1.0, 1.0];
var shininessValue = 8;
var lightZ = -9;
var sun = true;
var WORLDSIZE = 18;
const CUBESIZE = 1;
const WORLDBLOCKS = [
  [4, 3, 2, 1, 3, 2, 6, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 1, 2, 4, 3, 3, 0, 1, 3, 4, 0, 0, 4, 2, 4, 2, 2, 0, 4, 1, 4, 0, 0, 1, 2, 1, 3, 2, 1, 3, 2],
  [4, 0, 0, 0, 0, 3, 0, 2, 1, 3, 0, 4, 0, 1, 0, 3, 2, 1, 0, 2, 0, 0, 3, 2, 0, 1, 0, 1, 0, 4, 0, 1],
  [4, 0, 0, 4, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 4, 0, 0, 3, 0, 0, 4, 0, 0, 0, 4, 2, 1, 1, 0, 3, 0, 1, 2, 3, 0, 0, 0, 1, 0, 1, 1, 2, 2],
  [4, 0, 0, 3, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 1, 0, 2, 0, 0, 3, 1, 0, 2, 1, 0, 0, 0, 4, 4, 3, 0, 2, 1, 0, 1, 2, 1, 0, 1, 0, 3, 0, 2],
  [4, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 2, 1, 4, 1, 2, 2, 1, 0, 0, 3, 0, 0, 0, 4, 1, 3, 0, 1, 3, 0],
  [4, 0, 0, 0, 0, 4, 0, 2, 0, 1, 0, 2, 0, 0, 3, 0, 1, 1, 1, 3, 2, 0, 1, 0, 0, 2, 3, 4, 1, 0, 4, 0],
  [4, 0, 0, 3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 3, 2, 0, 0, 1, 0, 2, 3, 3, 1, 0, 0, 2, 0, 1, 1, 0, 4, 3, 0, 0, 0, 1, 0, 0, 0, 2, 2, 1],
  [4, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 2, 0, 0, 0, 1, 0, 2, 3, 3, 1, 0, 0, 2, 0, 1, 1, 0, 4, 3, 0, 0, 0, 1, 0, 0, 0, 2, 2, 1],
  [4, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 0, 0, 1, 0, 0, 0, 1, 0, 2, 3, 3, 1, 0, 0, 2, 0, 1, 1, 0, 4, 3, 0, 0, 0, 1, 0, 0, 0, 2, 2, 1],
  [4, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, 0, 2, 0, 4, 0, 0, 1, 0, 3, 0, 0, 3, 4, 2, 2, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
  [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
var numVertices;

function main() {
  // Retrieves <canvas element>
  var canvas = document.getElementById('webgl');
  canvas.getContext('webgl', {
    preserveDrawingBuffer: false
  });

  // Get the rendering context
  var gl = getWebGLContext(canvas, false);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize Shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  // Button Controls
  var normalVisButton = document.getElementById('normalVis');
  normalVisButton.addEventListener("click", () => {
    normalVal *= -1;
    // pass the uniform normal Visualization to the shader Program
    var u_NormalVal = gl.getUniformLocation(gl.program, 'u_NormalVal');
    gl.uniform1f(u_NormalVal, normalVal);
  })

  var lightModeButton = document.getElementById('lightMode');
  lightModeButton.addEventListener("click", () => {
    lightMode *= -1;
    var u_lightMode = gl.getUniformLocation(gl.program, 'u_lightMode');
    gl.uniform1f(u_lightMode, lightMode);
  })

  var sunButton = document.getElementById('sun');
  sunButton.addEventListener("click", () => {
    sun = !sun;
  })

  // Movement Controls
  document.addEventListener('keydown', (e) => {
    var toRadian = Math.PI / 180;
    directionX = Math.cos(rotationY * toRadian) * Math.cos(rotationX * toRadian);
    directionY = Math.sin(rotationX * toRadian);
    directionZ = Math.sin(rotationY * toRadian) * Math.cos(rotationX * toRadian);
    var key = e.key;
    if (key == 'w') {
      cameraZ += CUBESIZE / 3 * directionZ;
      cameraY += CUBESIZE / 3 * directionY;
      cameraX += CUBESIZE / 3 * directionX;
    } else if (key == 'a') {
      var crossX = -(directionZ);
      var crossY = 0;
      var crossZ = (directionX);
      var magnitude = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
      var finalX = crossX / magnitude;
      var finalY = crossY / magnitude;
      var finalZ = crossZ / magnitude;
      cameraZ -= CUBESIZE / 3 * finalZ;
      cameraY -= CUBESIZE / 3 * finalY;
      cameraX -= CUBESIZE / 3 * finalX;
    } else if (key == 's') {
      cameraZ -= CUBESIZE / 3 * directionZ;
      cameraY -= CUBESIZE / 3 * directionY;
      cameraX -= CUBESIZE / 3 * directionX;
    } else if (key == 'd') {
      var crossX = -(directionZ);
      var crossY = 0;
      var crossZ = (directionX);
      var magnitude = Math.sqrt(crossX * crossX + crossY * crossY + crossZ * crossZ);
      var finalX = crossX / magnitude;
      var finalY = crossY / magnitude;
      var finalZ = crossZ / magnitude;
      cameraZ += CUBESIZE / 3 * finalZ;
      cameraY += CUBESIZE / 3 * finalY;
      cameraX += CUBESIZE / 3 * finalX;
    } else if (key == 'e') {
      rotationY += 10;
    } else if (key == 'q') {
      rotationY -= 10;
    } else
      return;
  })

  var mousedown = false;
  document.addEventListener("mousedown", function() {
    mousedown = true;
  });
  document.addEventListener("mouseup", function() {
    mousedown = false;
  });

  // Camera controls
  document.addEventListener("mousemove", (e) => {
    if (mousedown && e.clientX < canvas.width && e.clientY < canvas.height) {
      var shiftX = e.movementX / 4;
      var shiftY = e.movementY / 4;
      rotationY += shiftX;
      rotationX -= shiftY;
    }
  });

  // World and lighting controls
  var worldSizeSlider = document.getElementById("worldSizeSlider");
  worldSizeSlider.addEventListener('input', e => {
    var size = worldSizeSlider.value;
    var text = "World Size: " + size;
    document.getElementById("worldSizeLabel").innerHTML = text;
    WORLDSIZE = size;
  });

  var lightSlider = document.getElementById("lightSlider");
  lightSlider.addEventListener('input', e => {
    lightZ = lightSlider.value;
    var text = "light Z position: " + lightZ;
    document.getElementById("lightPositionLabel").innerHTML = text;
  });

  var kaSlider = document.getElementById("kaSlider");
  kaSlider.addEventListener('input', e => {
    kaValue = kaSlider.value;
    var text = "Ambient Relection (ka): " + kaValue;
    document.getElementById("kaLabel").innerHTML = text;
  });

  var ambientColor = document.getElementById("ambientColor");
  ambientColor.addEventListener('input', e => {
    var ambientHex = ambientColor.value;
    ambientLightValue[0] = hexToRgb(ambientHex).r/255;
    ambientLightValue[1] = hexToRgb(ambientHex).g/255;
    ambientLightValue[2] = hexToRgb(ambientHex).b/255;
  });

  var kdSlider = document.getElementById("kdSlider");
  kdSlider.addEventListener('input', e => {
    kdValue = kdSlider.value;
    var text = "Diffuse reflection (kd): " + kdValue;
    document.getElementById("kdLabel").innerHTML = text;
  });

  var diffuseColor = document.getElementById("diffuseColor");
  diffuseColor.addEventListener('input', e => {
    var diffuseHex = diffuseColor.value;
    diffuseLightValue[0] = hexToRgb(diffuseHex).r/255;
    diffuseLightValue[1] = hexToRgb(diffuseHex).g/255;
    diffuseLightValue[2] = hexToRgb(diffuseHex).b/255;
  });

  var ksSlider = document.getElementById("ksSlider");
  ksSlider.addEventListener('input', e => {
    ksValue = ksSlider.value;
    var text = "Specular reflection (ks): " + ksValue;
    document.getElementById("ksLabel").innerHTML = text;
  });

  var specularColor = document.getElementById("specularColor");
  specularColor.addEventListener('input', e => {
    var specularHex = specularColor.value;
    specularLightValue[0] = hexToRgb(specularHex).r/255;
    specularLightValue[1] = hexToRgb(specularHex).g/255;
    specularLightValue[2] = hexToRgb(specularHex).b/255;
  });

  var shininessSlider = document.getElementById("shininessSlider");
  shininessSlider.addEventListener('input', e => {
    shininessValue = shininessSlider.value;
    var text = "shininess: " + shininessValue;
    document.getElementById("shininessLabel").innerHTML = text;
  });

  // Set up the texture
  var textureSky = gl.createTexture();
  var textureGround = gl.createTexture();
  var textureBlock = gl.createTexture();

  // Get the storage location of u_Sampler
  var u_SamplerSky = gl.getUniformLocation(gl.program, 'u_SamplerSky');
  var u_SamplerGround = gl.getUniformLocation(gl.program, 'u_SamplerGround');
  var u_SamplerBlock = gl.getUniformLocation(gl.program, 'u_SamplerBlock');

  var image1 = new Image(); // Create the image object
  var image2 = new Image();
  var image3 = new Image();
  // Tell the browser to load an image

  image1.src = 'resources/sky.png';
  image2.src = 'resources/purpur_block.png';
  image3.src = 'resources/quartz_block_side.png';

  // Register the event handler to be called on loading an image
  image1.onload = function() {
    gl.activeTexture(gl.TEXTURE0);
    loadTexture(gl, textureSky, u_SamplerSky, image1, 0 );
  };

  image2.onload = function() {
    gl.activeTexture(gl.TEXTURE1);
    loadTexture(gl, textureGround, u_SamplerGround, image2, 1);
  };

  image3.onload = function() {
    gl.activeTexture(gl.TEXTURE2);
    loadTexture(gl, textureBlock, u_SamplerBlock, image3, 2);
    // Start Drawing
    var tick = function () {
      renderScene(gl, canvas);
      requestAnimationFrame(tick, canvas);
    };
    tick();
  };

}

function renderScene(gl, canvas) {
  gl.clearColor(173 / 255, 216 / 255, 230 / 255, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Set up the camera
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  var u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  var u_SpecularLight = gl.getUniformLocation(gl.program, 'u_SpecularLight');
  var u_Ka = gl.getUniformLocation(gl.program, 'u_Ka');
  var u_Kd = gl.getUniformLocation(gl.program, 'u_Kd');
  var u_Ks = gl.getUniformLocation(gl.program, 'u_Ks');
  var u_shininess = gl.getUniformLocation(gl.program, 'u_shininess');

  var toRadian = Math.PI / 180;

  currentAngle = animate(currentAngle, 20);
  var lightX = WORLDSIZE/2 + WORLDSIZE * Math.cos(currentAngle * toRadian);
  var lightY = WORLDSIZE * Math.sin(currentAngle * toRadian);

  gl.uniform3f(u_LightPosition, lightX, lightY, lightZ);
  gl.uniform3f(u_LightColor, diffuseLightValue[0], diffuseLightValue[1], diffuseLightValue[2]);
  gl.uniform3f(u_AmbientLight, ambientLightValue[0], ambientLightValue[1], ambientLightValue[2]);
  gl.uniform3f(u_SpecularLight, specularLightValue[0], specularLightValue[1], specularLightValue[2]);
  gl.uniform1f(u_Ka, kaValue);
  gl.uniform1f(u_Kd, kdValue);
  gl.uniform1f(u_Ks, ksValue);
  gl.uniform1f(u_shininess, shininessValue);

  var viewMatrix = new Matrix4();
  var projMatrix = new Matrix4();

  directionX = Math.cos(rotationY * toRadian) * Math.cos(rotationX * toRadian);
  directionY = Math.sin(rotationX * toRadian);
  directionZ = Math.sin(rotationY * toRadian) * Math.cos(rotationX * toRadian);

  cameraY = Math.max(Math.min(cameraY, 4), 0);

  viewMatrix.lookAt(cameraX, cameraY, cameraZ, cameraX + directionX, cameraY + directionY, cameraZ + directionZ, 0, 1, 0);
  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 200);

  var u_ViewPosition = gl.getUniformLocation(gl.program, 'u_ViewPosition');
  gl.uniform3f(u_ViewPosition, cameraX, cameraY, cameraZ);

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  // u_Texture will hold a number corresponding to the texture we want to draw
  var u_Texture = gl.getUniformLocation(gl.program, 'u_texture');

  setCubeGeometry(gl);
  // Draw the ground
  gl.uniform1f(u_Texture, 1.0);
  var groundM = new Matrix4();
  for (var i = 0; i < WORLDSIZE; i++) {
    for (var j = 0; j < WORLDSIZE; j++) {
      groundM.setTranslate(i * 2 * CUBESIZE, -2 * CUBESIZE, -j * 2 * CUBESIZE)
      drawCube(gl, groundM);
    }
  }

  // Draw the blocks
  gl.uniform1f(u_Texture, 2.0)
  var blockM = new Matrix4();
  for (var i = WORLDSIZE - 1, i2 = 0; i >= 0; i--, i2++) {
    for (var j = WORLDSIZE - 1, j2 = 0; j >= 0; j--, j2++) {
      for (var h = 0; h < WORLDBLOCKS[i2][j2]; h++) {
        blockM.setTranslate(j2 * 2 * CUBESIZE, h * 2 * CUBESIZE, -i * 2 * CUBESIZE);
        drawCube(gl, blockM);
      }
    }
  }

 var n = setSphereGeometry(gl);
 var u_Texture = gl.getUniformLocation(gl.program, 'u_texture');
 gl.uniform1f(u_Texture, 3.0);
 sphere1M = new Matrix4();
 sphere1M.setTranslate(3, 5, 5);
 drawSphere(gl, n, sphere1M, 1, 0, 1);
 sphere2M = new Matrix4();
 sphere2M.setTranslate(3, 3, 2);
 drawSphere(gl, n, sphere2M, 0, 1, 0);

 //Visualization of the sun
 if (sun){
   gl.uniform1f(u_Texture, 4.0);
   sunM = new Matrix4();
   sunM.setTranslate(lightX, lightY, lightZ);
   drawSphere(gl, n, sunM, 1, 1, 0);
 }
}

function setCubeGeometry(gl) {
  // Create a buffer to hold the cube's vertices
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Create a new array to hold all the vertices for the cube
  var vertices = new Float32Array([
    // X, Y, Z                         U, V
    // Front face
    -CUBESIZE, -CUBESIZE, -CUBESIZE, 0, 0,
    -CUBESIZE, CUBESIZE, -CUBESIZE, 0, 1,
    CUBESIZE, CUBESIZE, -CUBESIZE, 1, 1,
    CUBESIZE, -CUBESIZE, -CUBESIZE, 1, 0,
    // Back face
    -CUBESIZE, -CUBESIZE, CUBESIZE, 1, 0,
    CUBESIZE, -CUBESIZE, CUBESIZE, 0, 0,
    CUBESIZE, CUBESIZE, CUBESIZE, 0, 1,
    -CUBESIZE, CUBESIZE, CUBESIZE, 1, 1,
    // Top face
    -CUBESIZE, CUBESIZE, -CUBESIZE, 0, 0,
    -CUBESIZE, CUBESIZE, CUBESIZE, 0, 1,
    CUBESIZE, CUBESIZE, CUBESIZE, 1, 1,
    CUBESIZE, CUBESIZE, -CUBESIZE, 1, 0,
    // Bottom face
    -CUBESIZE, -CUBESIZE, -CUBESIZE, 1, 1,
    CUBESIZE, -CUBESIZE, -CUBESIZE, 0, 1,
    CUBESIZE, -CUBESIZE, CUBESIZE, 0, 0,
    -CUBESIZE, -CUBESIZE, CUBESIZE, 1, 0,
    // Right face
    CUBESIZE, -CUBESIZE, -CUBESIZE, 0, 0,
    CUBESIZE, CUBESIZE, -CUBESIZE, 0, 1,
    CUBESIZE, CUBESIZE, CUBESIZE, 1, 1,
    CUBESIZE, -CUBESIZE, CUBESIZE, 1, 0,
    // Left face
    -CUBESIZE, -CUBESIZE, -CUBESIZE, 1, 0,
    -CUBESIZE, -CUBESIZE, CUBESIZE, 0, 0,
    -CUBESIZE, CUBESIZE, CUBESIZE, 0, 1,
    -CUBESIZE, CUBESIZE, -CUBESIZE, 1, 1
  ]);
  // Pass the list of vertices into WebGL
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  var normals = new Float32Array([
  0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
  0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   // v4-v7-v6-v5 back
  0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 top
  0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 bottom
  1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
 -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  // Each face is composed of two triangles
  var indices = [
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // back
    8, 9, 10, 8, 10, 11, // top
    12, 13, 14, 12, 14, 15, // bottom
    16, 17, 18, 16, 18, 19, // right
    20, 21, 22, 20, 22, 23, // left
  ];

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // Define the attribute variables to pass to the shaders
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  var a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord");
  var a_Normal = gl.getAttribLocation(gl.program, "a_Normal");

  numVertices = indices.length;

  var FSIZE = vertices.BYTES_PER_ELEMENT;

  // Tell WebGL where to get the vertices from
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 5 * FSIZE, 0);
  gl.enableVertexAttribArray(a_Position);

  // Tell WebGL how to use the vertices to create triangles
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 5 * FSIZE, 3 * FSIZE);
  gl.enableVertexAttribArray(a_TexCoord);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Normal);

  // Bind the indexBuffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
}

function drawCube(gl, M) {
  // Apply the transformation matrix to the cube
  var u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');

  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

  var normalMatrix = new Matrix4();
  normalMatrix.setInverseOf(M);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.drawElements(gl.TRIANGLES, numVertices, gl.UNSIGNED_SHORT, 0);
}

function setSphereGeometry(gl) {
  var SPHERE_DIV = 50;
  var i, ai, si, ci;
  var j, aj, sj, cj;
  var p1, p2;

  var positions = [];
  var sphereIndices = [];

  // Generate coordinates
  for (j = 0; j <= SPHERE_DIV; j++) {
    aj = j * Math.PI / SPHERE_DIV;
    sj = Math.sin(aj);
    cj = Math.cos(aj);
    for (i = 0; i <= SPHERE_DIV; i++) {
      ai = i * 2 * Math.PI / SPHERE_DIV;
      si = Math.sin(ai);
      ci = Math.cos(ai);

      positions.push(si * sj);  // X
      positions.push(cj);       // Y
      positions.push(ci * sj);  // Z
    }
  }
  // Generate indices
  for (j = 0; j < SPHERE_DIV; j++) {
    for (i = 0; i < SPHERE_DIV; i++) {
      p1 = j * (SPHERE_DIV+1) + i;
      p2 = p1 + (SPHERE_DIV+1);

      sphereIndices.push(p1);
      sphereIndices.push(p2);
      sphereIndices.push(p1 + 1);

      sphereIndices.push(p1 + 1);
      sphereIndices.push(p2);
      sphereIndices.push(p2 + 1);
    }
  }

  // Send the sphere positions to the shader program
  var spherePositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, spherePositionBuffer);
  var positionsArr = new Float32Array(positions);
  gl.bufferData(gl.ARRAY_BUFFER, positionsArr, gl.STATIC_DRAW);
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // Send the sphere normals to the shader program
  var sphereNormalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sphereNormalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positionsArr, gl.STATIC_DRAW);
  var a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Normal);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  var sphereIndicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereIndicesBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphereIndices), gl.STATIC_DRAW);

  return sphereIndices.length;
}

function drawSphere(gl, length, M, r, g, b) {
  // set the uniform label to draw a colored sphere
  var a_TexCoord = gl.getAttribLocation(gl.program, "a_TexCoord");
  var u_Color = gl.getUniformLocation(gl.program, 'u_color');

  gl.disableVertexAttribArray(a_TexCoord);
  gl.uniform4f(u_Color, r, g, b, 1.0);

  var u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  // Draw the spehere
  gl.drawElements(gl.TRIANGLES, length, gl.UNSIGNED_SHORT, 0);
}

function loadTexture(gl, texture, u_Sampler, image, i) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0

  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  // Set the texture unit 0 to the sampler

  gl.uniform1i(u_Sampler, i);
}

// animation function
var g_last = Date.now();
function animate(angle, speed) {
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    var newAngle = angle + (speed * elapsed) / 1000.0;
    return newAngle % 360;
}

// Helper function for converting hex to RGB
// Author: Tim Down
// Website: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
