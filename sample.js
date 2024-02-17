'use strict'
import { App, Window,} from './lib/index.js'


const app = new App();
app.run();

const win = Window.open(null, 'test', 'resizable,width=200,height=200');

win.addEventListener('resize', e => {
    console.log("listner resize")
    console.log([win.innerWidth, win.innerHeight])
})

win.addEventListener('mouse', e => {
    //console.log("mouse")
})

win.addEventListener('focus', e => {
    console.log("listner focus")
})

win.addEventListener('blur', e => {
    console.log("listner blur")
})

win.addEventListener('fullscreen', e => {
    console.log("fullscreen")
})

win.addEventListener('keydown', e => {
    console.log("listner keydown")
})

function draw(win) {
    const ctx = win.canvas.getContext("2d")

    ctx.lineWidth = 2;

    ctx.fillStyle = "lime";
    ctx.strokeStyle = "blue";
    ctx.beginPath()
    ctx.moveTo(10, 10)
    ctx.lineTo(100, 100)
    ctx.lineTo(50, 150)
    ctx.closePath();
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = "blue";
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(100, 100)
    ctx.lineTo(150, 100)
    ctx.lineTo(150, 150)
    ctx.lineTo(100, 150)
    ctx.closePath()
    ctx.fill();
    ctx.stroke(); 

    ctx.fillStyle = "orange";
    ctx.font = "italic 24px Arial";
    ctx.fillText("Hello WGPU", 50, 90);
}

win.requestAnimationFrame(draw);

