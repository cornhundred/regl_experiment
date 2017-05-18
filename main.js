const regl = require('regl')()
const mouse = require('mouse-change')()

const drawTriangle = regl({

  frag: `
    void main () {
      gl_FragColor = vec4(1, 1, 1, 1);
    }
  `,

  vert: `
    precision highp float;
    attribute vec2 position;
    uniform vec2 translate;
    void main() {
      gl_Position = vec4(position + translate, 0, 1);
    }
  `,


  attributes: {
    position: [
      [1, 0],
      [0, 1],
      [-1, -1]
    ]
  },

  uniforms: {
    // translate: ({tick}) => [ Math.cos(0.1 * tick) ,0]
    translate: regl.prop('translate')
  },

  count: 3
})



regl.frame(() => {
  regl.clear({
    color: [0, 0, 0, 1],
    depth: 1
  })

  drawTriangle( {
    translate: [mouse.x/1000, -mouse.y/1000]
  } )
})
