// This example needs to be run from the console
var filename = 'data/num_points.txt'


//////////////////////////////////////////////////
// smoothly animate points
//////////////////////////////////////////////////
const glsl = require('glslify')
const linspace = require('ndarray-linspace')
const vectorFill = require('ndarray-vector-fill')
const ndarray = require('ndarray')
const ease = require('eases/cubic-in-out')
const regl = require('regl')()


require('resl')({
  manifest:{
    'num_points':{
      type: 'text',
      src: filename
    }
  },
  onDone: (assets) => {
    run_viz(regl, assets);
  }
})


function run_viz(regl, assets) {

  var n = parseInt(assets.num_points);
  var datasets = [];
  var colorBasis;
  var datasetPtr = 0;

  var pointRadius = 10;
  var opacity = 0.2;

  var lastSwitchTime = 0;
  var switchInterval = 5;
  let switchDuration = 3;

  const createDatasets = function() {
    datasets = [phyllotaxis, grid]
      .map(
        function(func, i){
          return (datasets[i] || regl.buffer)(vectorFill(ndarray([], [n, 2]), func(n)));
        }
      )
  }

  // Initialize:
  createDatasets()

  const drawPoints = regl({
    vert: `
      precision mediump float;
      attribute vec2 xy0, xy1;
      attribute float;
      varying float t;
      uniform float aspect, interp, radius;
      void main () {

        // Interpolate between the two positions:
        vec2 pos = mix(xy0, xy1, interp);
        gl_Position = vec4(pos.x, pos.y * aspect, 0, 1);
        gl_PointSize = radius;

      }
    `,
    frag: glsl(`
      precision mediump float;
      varying float t;
      varying vec3 fragColor;
      void main () {
        gl_FragColor = vec4(0, 0, 0, 0.2);
      }
    `),
    depth: {enable: false},

    attributes: {
      // Pass two buffers between which we ease in the vertex shader:
      xy0: () => datasets[datasetPtr % datasets.length],
      xy1: () => datasets[(datasetPtr + 1) % datasets.length],
    },

    uniforms: {
      radius: () => pointRadius,
      aspect: ctx => ctx.viewportWidth / ctx.viewportHeight,

      // The current interpolation position, from 0 to 1:
      interp: (ctx, props) => Math.max(0, Math.min(1, props.interp))
    },

    primitive: 'point',

    count: () => n,

    // necessary for opacity control
    blend: {
      enable: true,
      func: {
        srcRGB: 'src alpha',
        srcAlpha: 'src color',
        dstRGB: 'one',
        dstAlpha: 'one',
        // src: 'one',
        // dst: 'one'
      },
      equation: 'add',
      color: [0, 0, 0, 0]
    }

  })


  regl.frame(({time}) => {

    // Check how long it's been since the last switch, and cycle the buffers
    // and reset the timer if it's time for a switch:
    if ((time - lastSwitchTime) > switchInterval) {
      lastSwitchTime = time
      datasetPtr++
    }

    drawPoints({interp: ease((time - lastSwitchTime) / switchDuration)})
  })
}


function phyllotaxis (n) {
  const theta = Math.PI * (3 - Math.sqrt(5))
  return function (i) {
    let r = Math.sqrt(i / n)
    let th = i * theta
    return [
      r * Math.cos(th),
      r * Math.sin(th)
    ]
  }
}

function grid (n) {
  const rowlen = Math.round(Math.sqrt(n))
  return (i) => [
    -0.8 + 1.6 / rowlen * (i % rowlen),
    -0.8 + 1.6 / rowlen * Math.floor(i / rowlen)
  ]
}