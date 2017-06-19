/*
  tags: basic
  This example shows how to implement a movable camera with regl.
 */

const regl = require('regl')()

const vectorizeText = require('vectorize-text')

text_vect = vectorizeText('Something!', {
  textAlign: 'center',
  textBaseline: 'middle',
  triangles:true
});

const draw_text = regl({
  vert: `
    precision highp float;
    attribute vec2 position;

    void main () {
      gl_Position = vec4(position, 0.0, 1.0);
    }`,
  frag: `
    precision highp float;
    void main () {
      gl_FragColor = vec4(1, 0, 0, 1.0);
    }`,
  attributes: {
    position: text_vect.positions,
  },
  elements: text_vect.cells
})

regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1]
  })
  draw_text()
})