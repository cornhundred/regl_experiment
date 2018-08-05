// reorganized version of animate 100k points
const glsl = require('glslify')
const linspace = require('ndarray-linspace')
const vectorFill = require('ndarray-vector-fill')
const ndarray = require('ndarray')
const ease = require('eases/cubic-in-out')
const regl = require('regl')()


last_switch_time = 0;
var switch_interval = 5;
let switchDuration = 3;
inst_state = 1;
var point_radius = 10;
var datasets = [];

num_points = 1 * 1000
regl.frame( run_draw );
run_switch = false;


function run_draw({time}){

  // Check how long it's been since the last switch, and cycle the buffers
  // and reset the timer if it's time for a switch:
  var time_since_switch = time - last_switch_time

  // if ( time_since_switch > switch_interval) {
  if (run_switch){
    run_switch = false;
    last_switch_time = time
    inst_state++
    console.log(time, inst_state, last_switch_time)
  };

  // // variable radius
  // point_radius = 10 * time % 30 + 10;
  // fixed radius
  point_radius = 10;

  // pass in interpolation function as property, interp_prop
  regl(draw_points_args)({
    interp_prop: interp_fun(time),
    point_radius: point_radius
  });

}

var num_points = parseInt(num_points);

var blend_info = {
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
  };

var datasets = create_datasets();

var vert_string = `
    precision mediump float;
    attribute vec2 pos_ini, pos_fin;
    uniform float interp_uni, radius;
    void main () {

      // Interpolate between the two positions using the interpolate uniform
      vec2 pos = mix(pos_ini, pos_fin, interp_uni);

      // gl_Position = vec4(pos[0] + radius/100.0, pos[1], 0, 1);
      gl_Position = vec4(pos[0], pos[1], 0, 1);

      gl_PointSize = radius;

    }`;

var frag_string = glsl(`
    precision mediump float;

    uniform float radius;

    void main () {
      gl_FragColor = vec4(0, 0, 0, 0.5);
    }
  `);

// // ES5 version is
// function interpolate_uniform(ctx, props) {
//   return Math.max(0, Math.min(1, props.interp_prop));
// }


var draw_points_args =   {

  frag: frag_string,

  vert: vert_string,

  attributes: {
    // Pass two buffers between which we ease in the vertex shader:
    // passs dataset info as attributes
    pos_ini: datasets[inst_state % datasets.length],
    pos_fin: datasets[(inst_state + 1) % datasets.length],
  },

  uniforms: {
    radius: regl.prop('point_radius'),
    // radius: point_radius,
    // The current interpolation position, from 0 to 1:
    interp_uni: (ctx, props) => Math.max(0, Math.min(1, props.interp_prop))
    // interp_uni: interpolate_uniform
  },
  primitive: 'point',
  count: num_points,
  // necessary for opacity control
  blend: blend_info

};


function create_datasets() {
  var datasets;
  datasets = [phyllotaxis, grid]
    .map(
      function(func, i){
        var inst_array = ndarray([], [num_points, 2]);
        return vectorFill(inst_array, func(num_points));
      }
    );

  return datasets;
}



function interp_fun(time){
  inst_ease = ease((time - last_switch_time) / switchDuration);
  // console.log(inst_ease);
  return inst_ease;
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
