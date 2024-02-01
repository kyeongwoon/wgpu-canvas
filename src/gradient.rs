#![allow(dead_code)]
#![allow(non_snake_case)]
use neon::prelude::*;
use std::cell::RefCell;
use std::sync::{Arc, Mutex};
use vello::kurbo::{
    Affine as Matrix, BezPath as Path, Circle, Ellipse, Line, PathEl, Point, Rect, Shape, Size,
    Vec2,Stroke, 
};
use vello::peniko::*;
use vello::peniko::{
    Blob, Brush, BrushRef, Color, Extend, Font, Format, Gradient, Image, StyleRef,
};

use crate::utils::*;

pub type BoxedCanvasGradient = JsBox<RefCell<CanvasGradient>>;
impl Finalize for CanvasGradient {}

#[derive(Clone)]
pub struct CanvasGradient {
    pub gradient: Arc<Mutex<Gradient>>,
}

//
// -- Javascript Methods --------------------------------------------------------------------------
//

pub fn linear(mut cx: FunctionContext) -> JsResult<BoxedCanvasGradient> {
    if let [x1, y1, x2, y2] = opt_float_args(&mut cx, 1..5).as_slice() {
        let start = Point::new(*x1 as f64, *y1 as f64);
        let end = Point::new(*x2 as f64, *y2 as f64);
        let ramp = Gradient::new_linear(start, end);
        let canvas_gradient = CanvasGradient {
            gradient: Arc::new(Mutex::new(ramp)),
        };
        let this = RefCell::new(canvas_gradient);
        Ok(cx.boxed(this))
    } else {
        let msg = format!(
            "Expected 4 arguments (x1, y1, x2, y2), received {}",
            cx.len() - 1
        );
        cx.throw_type_error(msg)
    }
}

pub fn radial(mut cx: FunctionContext) -> JsResult<BoxedCanvasGradient> {
    if let [x1, y1, r1, x2, y2, r2] = opt_float_args(&mut cx, 1..7).as_slice() {
        let start_point = Point::new(*x1 as f64, *y1 as f64);
        let end_point = Point::new(*x2 as f64, *y2 as f64);
        let bloom = Gradient::new_two_point_radial(start_point, *r1, end_point, *r2);
        let canvas_gradient = CanvasGradient {
            gradient: Arc::new(Mutex::new(bloom)),
        };
        let this = RefCell::new(canvas_gradient);
        Ok(cx.boxed(this))
    } else {
        let msg = format!(
            "Expected 6 arguments (x1, y1, r1, x2, y2, r2), received {}",
            cx.len() - 1
        );
        cx.throw_type_error(msg)
    }
}

pub fn conic(mut cx: FunctionContext) -> JsResult<BoxedCanvasGradient> {
    if let [theta, x, y] = opt_float_args(&mut cx, 1..4).as_slice() {
        let center = Point::new(*x as f64, *y as f64);
        let angle = to_degrees(*theta) - 90.0;
        let sweep = Gradient::new_sweep(center, angle, angle);
        let canvas_gradient = CanvasGradient {
            gradient: Arc::new(Mutex::new(sweep)),
        };
        let this = RefCell::new(canvas_gradient);
        Ok(cx.boxed(this))
    } else {
        let msg = format!(
            "Expected 3 arguments (startAngle, x, y), received {}",
            cx.len() - 1
        );
        cx.throw_type_error(msg)
    }
}

pub fn addColorStop(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedCanvasGradient>(0)?;
    let offset = float_arg(&mut cx, 1, "offset")?;
    let color = color_arg(&mut cx, 2);

    let this = this.borrow_mut();
    if let Some(color) = color {
        //this.add_color_stop(offset, color);
        let stop = ColorStop::from((offset, color));

        let gradient = Arc::clone(&this.gradient);
        let mut gradient = gradient.lock().unwrap();
        gradient.stops.push(stop.into());
        //gradient.collect_stops(stop);
    }

    Ok(cx.undefined())
}

pub fn repr(mut cx: FunctionContext) -> JsResult<JsString> {
    let this = cx.argument::<BoxedCanvasGradient>(0)?;
    let this = this.borrow();
    let gradient = Arc::clone(&this.gradient);
    let gradient = gradient.lock().unwrap();

    let style = match &*&gradient.kind {
        GradientKind::Linear { .. } => "Linear",
        GradientKind::Radial { .. } => "Radial",
        GradientKind::Sweep { .. } => "Conic",
    };

    Ok(cx.string(style))
}
