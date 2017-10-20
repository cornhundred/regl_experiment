/*
  Making an interactive matrix using instancing.

 */

const regl = require('regl')({extensions: ['angle_instanced_arrays']})

console.log('multi-camera-zooming, passing in opacity')

var num_row = 5000;
var num_col = 100;

var draw_mat_rows = require('./draw_mat_labels')(regl, num_row, 'row');
var draw_mat_cols = require('./draw_mat_labels')(regl, num_col, 'col');

mat_data = []
for (var i=0; i < num_col; i++){
  mat_data[i] = []
  for (var j=0; j < num_row; j++){
    mat_data[i][j] = Math.random();
  }
}

flat_mat = [].concat.apply([], mat_data);
console.log(mat_data.length, mat_data[0].length)
console.log(flat_mat.length)

var draw_cells = require('./draw_cells')(regl, mat_data);

var ini_scale = 0.75;
const camera_1 = require('./camera_vert_zoom')(regl, {
  xrange: [-ini_scale, ini_scale],
  yrange: [-ini_scale, ini_scale]
});

const camera_2 = require('./camera_2')(regl, {
  xrange: [-ini_scale, ini_scale],
  yrange: [-ini_scale, ini_scale]
});

const camera_3 = require('./camera_3')(regl, {
  xrange: [-ini_scale, ini_scale],
  yrange: [-ini_scale, ini_scale]
});

window.addEventListener('resize', camera_1.resize);
window.addEventListener('resize', camera_2.resize);
window.addEventListener('resize', camera_3.resize);

regl.frame(function () {

  // draw command 1
  camera_1.draw(() => {

    regl.clear({ color: [0, 0, 0, 0] });

    // draw two parts of the matrix cell
    draw_cells.top();
    draw_cells.bot();

  });

  // draw command 2
  camera_2.draw(() => {
    draw_mat_rows();
  });

  // camera_3.draw(() => {
  //   draw_mat_cols();
  // });

})