#![allow(clippy::unnecessary_wraps)]
#![allow(unused_imports)]
use neon::prelude::*;
use once_cell::sync::Lazy;
use std::sync::Mutex;

pub mod canvas;
pub mod context;
pub mod gui;
pub mod image;
pub mod path;
pub mod utils;
pub mod gradient;
pub use context::api as ctx;

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    // -- Image -------------------------------------------------------------------------------------

    cx.export_function("Image_new", image::new)?;
    cx.export_function("Image_get_src", image::get_src)?;
    cx.export_function("Image_set_src", image::set_src)?;
    cx.export_function("Image_set_data", image::set_data)?;
    cx.export_function("Image_get_width", image::get_width)?;
    cx.export_function("Image_get_height", image::get_height)?;
    cx.export_function("Image_get_complete", image::get_complete)?;

    // -- Canvas ------------------------------------------------------------------------------------

    cx.export_function("Canvas_new", canvas::new)?;
    cx.export_function("Canvas_get_width", canvas::get_width)?;
    cx.export_function("Canvas_set_width", canvas::set_width)?;
    cx.export_function("Canvas_get_height", canvas::get_height)?;
    cx.export_function("Canvas_set_height", canvas::set_height)?;

    // -- Context -----------------------------------------------------------------------------------

    cx.export_function("CanvasRenderingContext2D_new", ctx::new)?;
    cx.export_function("CanvasRenderingContext2D_resetSize", ctx::resetSize)?;
    cx.export_function("CanvasRenderingContext2D_get_size", ctx::get_size)?;
    cx.export_function("CanvasRenderingContext2D_set_size", ctx::set_size)?;
    cx.export_function("CanvasRenderingContext2D_reset", ctx::reset)?;

    // grid state
    cx.export_function("CanvasRenderingContext2D_save", ctx::save)?;
    cx.export_function("CanvasRenderingContext2D_restore", ctx::restore)?;
    cx.export_function("CanvasRenderingContext2D_transform", ctx::transform)?;
    cx.export_function("CanvasRenderingContext2D_translate", ctx::translate)?;
    cx.export_function("CanvasRenderingContext2D_scale", ctx::scale)?;
    cx.export_function("CanvasRenderingContext2D_rotate", ctx::rotate)?;
    cx.export_function("CanvasRenderingContext2D_resetTransform", ctx::resetTransform,)?;
    cx.export_function("CanvasRenderingContext2D_get_currentTransform", ctx::get_currentTransform,)?;
    cx.export_function("CanvasRenderingContext2D_set_currentTransform", ctx::set_currentTransform,)?;
    
    // bézier paths
    cx.export_function("CanvasRenderingContext2D_beginPath", ctx::beginPath)?;
    cx.export_function("CanvasRenderingContext2D_rect", ctx::rect)?;
    cx.export_function("CanvasRenderingContext2D_roundRect", ctx::roundRect)?;
    cx.export_function("CanvasRenderingContext2D_arc", ctx::arc)?;
    cx.export_function("CanvasRenderingContext2D_ellipse", ctx::ellipse)?;
    cx.export_function("CanvasRenderingContext2D_moveTo", ctx::moveTo)?;
    cx.export_function("CanvasRenderingContext2D_lineTo", ctx::lineTo)?;
    cx.export_function("CanvasRenderingContext2D_arcTo", ctx::arcTo)?;
    cx.export_function("CanvasRenderingContext2D_bezierCurveTo", ctx::bezierCurveTo)?;
    cx.export_function("CanvasRenderingContext2D_quadraticCurveTo",ctx::quadraticCurveTo,)?;
    cx.export_function("CanvasRenderingContext2D_closePath", ctx::closePath)?;

    // fill & stroke
    cx.export_function("CanvasRenderingContext2D_fill", ctx::fill)?;
    cx.export_function("CanvasRenderingContext2D_stroke", ctx::stroke)?;
    cx.export_function("CanvasRenderingContext2D_fillRect", ctx::fillRect)?;

    cx.export_function("CanvasRenderingContext2D_strokeRect", ctx::strokeRect)?;
    cx.export_function("CanvasRenderingContext2D_clearRect", ctx::clearRect)?;

    cx.export_function("CanvasRenderingContext2D_get_fillStyle", ctx::get_fillStyle)?;
    cx.export_function("CanvasRenderingContext2D_set_fillStyle", ctx::set_fillStyle)?;

    cx.export_function("CanvasRenderingContext2D_get_strokeStyle",ctx::get_strokeStyle,)?;
    cx.export_function("CanvasRenderingContext2D_set_strokeStyle",ctx::set_strokeStyle,)?;

    // line style
    cx.export_function("CanvasRenderingContext2D_getLineDash", ctx::getLineDash)?;
    cx.export_function("CanvasRenderingContext2D_setLineDash", ctx::setLineDash)?;
    cx.export_function("CanvasRenderingContext2D_get_lineCap", ctx::get_lineCap)?;
    cx.export_function("CanvasRenderingContext2D_set_lineCap", ctx::set_lineCap)?;
    cx.export_function("CanvasRenderingContext2D_get_lineDashFit", ctx::get_lineDashFit)?;
    cx.export_function("CanvasRenderingContext2D_set_lineDashFit", ctx::set_lineDashFit)?;
    cx.export_function("CanvasRenderingContext2D_get_lineDashMarker", ctx::get_lineDashMarker)?;
    cx.export_function("CanvasRenderingContext2D_set_lineDashMarker", ctx::set_lineDashMarker)?;
    cx.export_function("CanvasRenderingContext2D_get_lineDashOffset",ctx::get_lineDashOffset,)?;
    cx.export_function("CanvasRenderingContext2D_set_lineDashOffset",ctx::set_lineDashOffset,)?;
    cx.export_function("CanvasRenderingContext2D_get_lineJoin", ctx::get_lineJoin)?;
    cx.export_function("CanvasRenderingContext2D_set_lineJoin", ctx::set_lineJoin)?;
    cx.export_function("CanvasRenderingContext2D_get_lineWidth", ctx::get_lineWidth)?;
    cx.export_function("CanvasRenderingContext2D_set_lineWidth", ctx::set_lineWidth)?;
    cx.export_function("CanvasRenderingContext2D_get_miterLimit", ctx::get_miterLimit)?;
    cx.export_function("CanvasRenderingContext2D_set_miterLimit", ctx::set_miterLimit)?;

    // imagery
    cx.export_function("CanvasRenderingContext2D_drawImage", ctx::drawImage)?;

    cx.export_function("CanvasRenderingContext2D_putImageData", ctx::putImageData)?;

    // typography
    cx.export_function("CanvasRenderingContext2D_fillText", ctx::fillText)?;
    cx.export_function("CanvasRenderingContext2D_strokeText", ctx::strokeText)?;
    cx.export_function("CanvasRenderingContext2D_measureText", ctx::measureText)?;
    cx.export_function("CanvasRenderingContext2D_outlineText", ctx::outlineText)?;
    cx.export_function("CanvasRenderingContext2D_get_font", ctx::get_font)?;
    cx.export_function("CanvasRenderingContext2D_set_font", ctx::set_font)?;
    // -- Window -----------------------------------------------------------------------------------

    cx.export_function("App_pump", gui::pump)?;
    cx.export_function("App_draw", gui::draw)?;
    cx.export_function("App_quit", gui::quit)?;
    cx.export_function("App_closeWindow", gui::close)?;
    cx.export_function("App_openWindow", gui::open)?;
    cx.export_function("App_setRate", gui::set_rate)?;
    Ok(())
}
