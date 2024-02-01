#![allow(unused_variables)]
#![allow(unused_mut)]
#![allow(unused_imports)]
#![allow(dead_code)]
#![allow(non_snake_case)]

use neon::{prelude::*, types::buffer::TypedArray};
use std::cell::RefCell;
use std::f32::consts::PI;

use vello::kurbo::{
    Affine as Matrix, Arc, BezPath as Path, Circle, Ellipse, Line, PathEl, Point, Rect,
    RoundedRect as RRect, RoundedRectRadii as Radii, Shape, Size, Vec2,
};
use vello::peniko::{Brush, Color, Gradient};

use super::{BoxedContext2D, Context2D};
use crate::canvas::BoxedCanvas;
use crate::gradient::{BoxedCanvasGradient, CanvasGradient};
use crate::image::BoxedImage;
use crate::path::{BoxedPath2D, Path2D};
use crate::utils::*;
use smallvec::{smallvec, SmallVec};
use std::process;
//
// The js interface for the Context2D struct
//

pub fn new(mut cx: FunctionContext) -> JsResult<BoxedContext2D> {
    let this = RefCell::new(Context2D::new());
    let parent = cx.argument::<BoxedCanvas>(1)?;
    let parent = parent.borrow();

    this.borrow_mut()
        .reset_size(parent.width as u32, parent.height as u32);
    Ok(cx.boxed(this))
}

pub fn resetSize(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let parent = cx.argument::<BoxedCanvas>(1)?;
    let parent = parent.borrow();

    this.borrow_mut()
        .reset_size(parent.width as u32, parent.height as u32);
    Ok(cx.undefined())
}

pub fn get_size(mut cx: FunctionContext) -> JsResult<JsArray> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let bounds = this.borrow().bounds;

    let array = JsArray::new(&mut cx, 2);
    let width = cx.number(bounds.size().width);
    let height = cx.number(bounds.size().height);
    array.set(&mut cx, 0, width)?;
    array.set(&mut cx, 1, height)?;
    Ok(array)
}

pub fn set_size(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let xy = opt_float_args(&mut cx, 1..3);

    if let [width, height] = xy.as_slice() {
        this.borrow_mut().resize(*width as u32, *height as u32);
    }
    Ok(cx.undefined())
}

pub fn reset(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    let size = this.bounds.size();

    this.reset_size(size.width as u32, size.height as u32);
    Ok(cx.undefined())
}

//
// Grid State
//

pub fn save(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    this.push();
    Ok(cx.undefined())
}

pub fn restore(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    this.pop();
    Ok(cx.undefined())
}

pub fn transform(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    check_argc(&mut cx, 7)?;

    let nums = opt_float_args(&mut cx, 1..7);
    if let [m11, m12, m21, m22, dx, dy] = nums.as_slice() {
        //let matrix = Matrix::new_all(*m11, *m21, *dx, *m12, *m22, *dy, 0.0, 0.0, 1.0);
        let matrix = Matrix::new([
            *m11 as f64,
            *m12 as f64,
            *m21 as f64,
            *m22 as f64,
            *dx as f64,
            *dy as f64,
        ]);

        this.state.matrix = this.state.matrix * matrix;
    }
    Ok(cx.undefined())
}

pub fn translate(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    check_argc(&mut cx, 3)?;

    let xy = opt_float_args(&mut cx, 1..3);
    if let [dx, dy] = xy.as_slice() {
        this.state.matrix = this
            .state
            .matrix
            .pre_translate(Vec2::new(*dx as f64, *dy as f64))
    }
    Ok(cx.undefined())
}

pub fn scale(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    check_argc(&mut cx, 3)?;

    let xy = opt_float_args(&mut cx, 1..3);
    if let [m11, m22] = xy.as_slice() {
        this.state.matrix = this
            .state
            .matrix
            .pre_scale_non_uniform(*m11 as f64, *m22 as f64);
    }
    Ok(cx.undefined())
}

pub fn rotate(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    check_argc(&mut cx, 2)?;

    if let Some(radians) = opt_float_arg(&mut cx, 1) {
        let degrees = radians / PI * 180.0;
        this.state.matrix = this.state.matrix.pre_rotate(degrees as f64);
    }
    Ok(cx.undefined())
}

pub fn resetTransform(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();

    this.state.matrix = Matrix::IDENTITY;
    Ok(cx.undefined())
}
// -- ctm property ----------------------------------------------------------------------

pub fn get_currentTransform(mut cx: FunctionContext) -> JsResult<JsArray> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let this = this.borrow();

    let array = JsArray::new(&mut cx, 9);
    for i in 0..6 {
        let num = cx.number(this.state.matrix.as_coeffs()[i as usize]);
        array.set(&mut cx, i as u32, num)?;
    }
    Ok(array)
}

pub fn set_currentTransform(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();

    println!("set_currentTransform");

    if let Some(matrix) = opt_matrix_arg(&mut cx, 1) {
        this.state.matrix = Matrix::IDENTITY * matrix;
    }
    Ok(cx.undefined())
}

//
// Bézier Paths
//

pub fn beginPath(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();

    this.path = Path::new();
    Ok(cx.undefined())
}

// -- primitives ------------------------------------------------------------------------

pub fn rect(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    check_argc(&mut cx, 5)?;

    let nums = opt_float_args(&mut cx, 1..5);
    if let [x, y, w, h] = nums.as_slice() {
        let rect = Rect::new(*x as f64, *y as f64, *w as f64, *h as f64);
        this.path = Path::new();
        let path = rect.to_path(1.0);
        for el in path {
            this.path.push(el);
        }
        this.path.close_path();
    }
    Ok(cx.undefined())
}

pub fn roundRect(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    check_argc(&mut cx, 13)?;

    let nums = opt_float_args(&mut cx, 1..13);
    if let [x, y, w, h] = &nums[..4] {
        let rect = Rect::new(*x as f64, *y as f64, (*x + *w) as f64, (*y + *h) as f64);
        let rad: Vec<f32> = nums[4..].chunks(2).map(|xy| xy[0]).collect();

        this.path = Path::new();
        let radii = Radii::new(rad[0] as f64, rad[1] as f64, rad[2] as f64, rad[3] as f64);
        let rrect = RRect::new(rect.x0, rect.y0, rect.x1, rect.y1, radii);
        let tpath = rrect.to_path(1.0);
        for el in tpath {
            this.path.push(el)
        }
        this.path.close_path();
    }

    Ok(cx.undefined())
}

pub fn arc(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    check_argc(&mut cx, 6)?;

    let nums = opt_float_args(&mut cx, 1..6);
    let ccw = bool_arg_or(&mut cx, 6, false);
    if let [x, y, radius, start_angle, end_angle] = nums.as_slice() {
        let matrix = this.state.matrix;
        let mut arc = Arc::new(
            Point::new(*x as f64, *y as f64),
            Vec2::new(*radius as f64, *radius as f64),
            *start_angle as f64,
            *end_angle as f64 - *start_angle as f64,
            0.,
        );
        let tpath = arc.to_path(1.0);
        for el in tpath {
            this.path.push(el)
        }
    }
    Ok(cx.undefined())
}

pub fn ellipse(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    check_argc(&mut cx, 8)?;

    let nums = opt_float_args(&mut cx, 1..8);
    let ccw = bool_arg_or(&mut cx, 8, false);
    if let [x, y, x_radius, y_radius, rotation, start_angle, end_angle] = nums.as_slice() {
        if *x_radius < 0.0 || *y_radius < 0.0 {
            return cx.throw_error("radii cannot be negative");
        }
        let matrix = this.state.matrix;
        let elipse = Ellipse::new(
            Point::new(*x as f64, *y as f64),
            Vec2::new(*x_radius as f64, *y_radius as f64),
            *rotation as f64,
        );
        let tpath = elipse.to_path(1.0);
        for el in tpath {
            this.path.push(el)
        }
    }
    Ok(cx.undefined())
}

// contour drawing ----------------------------------------------------------------------

pub fn moveTo(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    check_argc(&mut cx, 3)?;

    let xy = opt_float_args(&mut cx, 1..3);
    if let Some(dst) = this.map_points(&xy).first() {
        this.path.move_to(*dst);
    }
    Ok(cx.undefined())
}

pub fn lineTo(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    check_argc(&mut cx, 3)?;

    let xy = opt_float_args(&mut cx, 1..3);
    if let Some(dst) = this.map_points(&xy).first() {
        if this.path.elements().len() == 0 {
            this.path.move_to(*dst);
        }
        this.path.line_to(*dst);
    }
    Ok(cx.undefined())
}

pub fn arcTo(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    check_argc(&mut cx, 6)?;

    let coords = opt_float_args(&mut cx, 1..5);
    let radius = opt_float_arg(&mut cx, 5);
    if let Some(radius) = radius {
        let radius = radius as f64;
        if let [p1, p2] = this.map_points(&coords).as_slice() {
            //if this.path.is_empty() {
            if this.path.elements().len() == 0 {
                this.path.move_to(*p1);
            }
            //let els = this.path.elements();
            let len = this.path.elements().len();
            let last_path = this.path.elements()[len - 1];
            let mut p0 = Point::new(0., 0.);
            match last_path {
                PathEl::MoveTo(p) => p0 = p,
                PathEl::LineTo(p) => p0 = p,
                PathEl::QuadTo(_, p) => p0 = p,
                PathEl::CurveTo(_, _, p) => p0 = p,
                _ => (),
            }

            // https://github.com/Automattic/node-canvas/blob/master/src/CanvasRenderingContext2d.cc#L3217

            if (p1.x == p0.x && p1.y == p0.y) || (p1.x == p2.x && p1.y == p2.y) || radius == 0. {
                this.path.line_to(*p1);
                return Ok(cx.undefined());
            }
            let p1p0 = Point::new(p0.x - p1.x, p0.y - p1.y);
            let p1p2 = Point::new(p2.x - p1.x, p2.y - p1.y);
            let p1p0_length = (p1p0.x * p1p0.x + p1p0.y * p1p0.y).sqrt();
            let p1p2_length = (p1p2.x * p1p2.x + p1p2.y * p1p2.y).sqrt();

            let cos_phi = (p1p0.x * p1p2.x + p1p0.y * p1p2.y) / (p1p0_length * p1p2_length);
            // all points on a line logic
            if -1. == cos_phi {
                this.path.line_to(Point::new(p1.x, p1.y));
                return Ok(cx.undefined());
            }

            if 1. == cos_phi {
                // add infinite far away point
                let max_length = 65535;
                let factor_max = max_length as f64 / p1p0_length;
                this.path.line_to(Point::new(
                    p0.x + factor_max * p1p0.x,
                    p0.y + factor_max * p1p0.y,
                ));
                return Ok(cx.undefined());
            }

            let tangent = radius / (cos_phi.acos() / 2.).tan();
            let factor_p1p0 = tangent / p1p0_length;
            let t_p1p0 = Point::new(p1.x + factor_p1p0 * p1p0.x, p1.y + factor_p1p0 * p1p0.y);

            let mut orth_p1p0 = Point::new(p1p0.y, -p1p0.x);
            let orth_p1p0_length = (orth_p1p0.x * orth_p1p0.x + orth_p1p0.y * orth_p1p0.y).sqrt();
            let factor_ra = radius / orth_p1p0_length;

            let cos_alpha =
                (orth_p1p0.x * p1p2.x + orth_p1p0.y * p1p2.y) / (orth_p1p0_length * p1p2_length);
            if cos_alpha < 0. {
                orth_p1p0 = Point::new(-orth_p1p0.x, -orth_p1p0.y);
            }

            let p = Point::new(
                t_p1p0.x + factor_ra * orth_p1p0.x,
                t_p1p0.y + factor_ra * orth_p1p0.y,
            );

            orth_p1p0 = Point::new(-orth_p1p0.x, -orth_p1p0.y);
            let mut sa = (orth_p1p0.x / orth_p1p0_length).acos();
            if orth_p1p0.y < 0. {
                sa = 2. * std::f64::consts::PI - sa;
            }

            let mut anticlockwise = false;

            let factor_p1p2 = tangent / p1p2_length;
            let t_p1p2 = Point::new(p1.x + factor_p1p2 * p1p2.x, p1.y + factor_p1p2 * p1p2.y);
            let orth_p1p2 = Point::new(t_p1p2.x - p.x, t_p1p2.y - p.y);
            let orth_p1p2_length = (orth_p1p2.x * orth_p1p2.x + orth_p1p2.y * orth_p1p2.y).sqrt();
            let mut ea = (orth_p1p2.x / orth_p1p2_length).acos();

            if orth_p1p2.y < 0. {
                ea = 2. * std::f64::consts::PI - ea;
            }
            if (sa > ea) && ((sa - ea) < std::f64::consts::PI) {
                anticlockwise = true;
            }
            if (sa < ea) && ((ea - sa) > std::f64::consts::PI) {
                anticlockwise = true;
            }

            this.path.line_to(t_p1p0);
            if anticlockwise && std::f64::consts::PI * 2. != radius {
                let mut arc = Arc::new(p, Vec2::new(radius, radius), sa, ea - sa, 0.);
                let tpath = arc.to_path(1.0);
                for el in tpath {
                    this.path.push(el)
                }
            } else {
                let mut arc = Arc::new(p, Vec2::new(radius, radius), sa, ea - sa, 0.);
                let tpath = arc.to_path(1.0);
                for el in tpath {
                    this.path.push(el)
                }
            }
        }
    }
    Ok(cx.undefined())
}

pub fn bezierCurveTo(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    check_argc(&mut cx, 7)?;

    let coords = opt_float_args(&mut cx, 1..7);
    if let [cp1, cp2, dst] = this.map_points(&coords).as_slice() {
        if this.path.elements().len() == 0 {
            this.path.move_to(*cp1);
        }
        this.path.curve_to(*cp1, *cp2, *dst);
    }
    Ok(cx.undefined())
}

pub fn quadraticCurveTo(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    check_argc(&mut cx, 5)?;

    let coords = opt_float_args(&mut cx, 1..5);
    if let [cp, dst] = this.map_points(&coords).as_slice() {
        if this.path.elements().len() == 0 {
            this.path.move_to(*cp);
        }
        this.path.quad_to(*cp, *dst);
    }
    Ok(cx.undefined())
}


pub fn closePath(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();

    this.path.close_path();
    Ok(cx.undefined())
}

//
// Fill & Stroke
//

pub fn fill(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let path = opt_path2d_arg(&mut cx, 1);
    let rule_idx = if path.is_some() { 2 } else { 1 };
    let rule = fill_rule_arg_or(&mut cx, rule_idx, "nonzero")?;
    let frag = this
        .borrow_mut()
        .draw_path(path);
    this.borrow_mut().page.lock().unwrap().frags.push(frag);
    Ok(cx.undefined())
}

pub fn stroke(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let path = opt_path2d_arg(&mut cx, 1);
    let frag = this.borrow_mut().draw_stroke(path);
    this.borrow_mut().page.lock().unwrap().frags.push(frag);

    Ok(cx.undefined())
}

pub fn fillRect(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let nums = float_args(&mut cx, 1..5)?;
    if let [x, y, w, h] = nums.as_slice() {
        let rect = Rect::new(*x as f64, *y as f64, (*x + *w) as f64, (*y + *h) as f64);
        let path = Some(rect.to_path(1.0));

        let frag = this.borrow_mut().draw_path(path);
        this.borrow_mut().page.lock().unwrap().frags.push(frag);
    }
    Ok(cx.undefined())
}

pub fn strokeRect(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let nums = float_args(&mut cx, 1..5)?;
    if let [x, y, w, h] = nums.as_slice() {
        let rect = Rect::new(*x as f64, *y as f64, (*x + *w) as f64, (*y + *h) as f64);
        let path = Some(rect.to_path(1.0));

        let frag = this.borrow_mut().draw_stroke(path);
        this.borrow_mut().page.lock().unwrap().frags.push(frag);
    }
    Ok(cx.undefined())
}

pub fn clearRect(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let nums = float_args(&mut cx, 1..5)?;
    if let [x, y, w, h] = nums.as_slice() {
        let rect = Rect::new(*x as f64, *y as f64, (*x + *w) as f64, (*y + *h) as f64);
        let path = Some(rect.to_path(1.0));

        let save = this.borrow_mut().state.fill_style.clone();

        this.borrow_mut().state.fill_style = Brush::Solid(Color::BLACK);
        let frag = this.borrow_mut().draw_path(path);
        this.borrow_mut().page.lock().unwrap().frags.push(frag);

        this.borrow_mut().state.fill_style = save.clone();
    }
    Ok(cx.undefined())
}

// fill & stoke properties --------------------------------------------------------------

pub fn get_fillStyle(mut cx: FunctionContext) -> JsResult<JsValue> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let this = this.borrow();

    let br = this.state.fill_style.clone();
    match br {
        Brush::Solid(color) => color_to_css(&mut cx, &color),
        _ => Ok(cx.null().upcast()),
    }
}

pub fn set_fillStyle(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    let arg = cx.argument::<JsValue>(1)?;

    if let Ok(gradient) = arg.downcast::<BoxedCanvasGradient, _>(&mut cx) {
        this.state.fill_style = Brush::Gradient(gradient.borrow().clone().gradient.lock().unwrap().clone());
    } else {
        this.state.fill_style = color_in(&mut cx, arg).map(Brush::Solid).unwrap();
    }
    Ok(cx.undefined())
}

pub fn get_strokeStyle(mut cx: FunctionContext) -> JsResult<JsValue> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let this = this.borrow();
    let br = this.state.stroke_style.clone();
    match br {
        Brush::Solid(color) => color_to_css(&mut cx, &color),
        _ => Ok(cx.null().upcast()),
    }
}

pub fn set_strokeStyle(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    let arg = cx.argument::<JsValue>(1)?;

    if let Some(br) = color_in(&mut cx, arg).map(Brush::Solid) {
        this.state.stroke_style = br;
    }
    Ok(cx.undefined())
}

//
// Line Style
//

pub fn set_lineDashMarker(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let marker = opt_path2d_arg(&mut cx, 1);

    if marker.is_none() {
        let val = cx.argument::<JsValue>(1)?;
        if !(val.is_a::<JsNull, _>(&mut cx) || val.is_a::<JsNull, _>(&mut cx)) {
            return cx.throw_type_error("Expected a Path2D object (or null)");
        }
    }

    this.borrow_mut().state.line_dash_marker = marker;
    Ok(cx.undefined())
}

pub fn get_lineDashMarker(mut cx: FunctionContext) -> JsResult<JsValue> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let this = this.borrow();

    match &this.state.line_dash_marker {
        Some(marker) => Ok(cx
            .boxed(RefCell::new(Path2D {
                path: marker.clone(),
            }))
            .upcast()),
        None => Ok(cx.null().upcast()),
    }
}

pub fn set_lineDashFit(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let style = string_arg(&mut cx, 1, "fitStyle")?;

    if let Some(fit) = to_1d_style(&style) {
        this.borrow_mut().state.line_dash_fit = fit;
    }
    Ok(cx.undefined())
}

pub fn get_lineDashFit(mut cx: FunctionContext) -> JsResult<JsString> {
    let this = cx.argument::<BoxedContext2D>(0)?;

    let fit = from_1d_style(this.borrow().state.line_dash_fit);
    Ok(cx.string(fit))
}

pub fn getLineDash(mut cx: FunctionContext) -> JsResult<JsValue> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    let dashes = this.state.line_dash_list.clone();
    f64_to_array(&mut cx, &dashes)
    
}

pub fn setLineDash(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    let arg = cx.argument::<JsValue>(1)?;
    if arg.is_a::<JsArray, _>(&mut cx) {
        let list = cx.argument::<JsArray>(1)?.to_vec(&mut cx)?;
        let mut intervals = floats_in(&mut cx, &list)
            .iter()
            .cloned()
            .filter(|n| *n >= 0.0 && n.is_finite())
            .collect::<Vec<f32>>();

        if list.len() == intervals.len() {
            if intervals.len() % 2 == 1 {
                intervals.append(&mut intervals.clone());
            }

            //this.state.line_dash_list = intervals
            this.state.line_dash_list.clear();
            for v in intervals {
                this.state.line_dash_list.push(v as f64);
            }
        }
    }

    Ok(cx.undefined())
}

// line style properties  -----------------------------------------------------------

pub fn get_lineCap(mut cx: FunctionContext) -> JsResult<JsString> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();

    let mode = this.state.cap;
    let name = from_stroke_cap(mode);
    Ok(cx.string(name))
}

pub fn set_lineCap(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    let name = string_arg(&mut cx, 1, "lineCap")?;

    if let Some(mode) = to_stroke_cap(&name) {
        this.state.cap = mode;
    }
    Ok(cx.undefined())
}

pub fn get_lineDashOffset(mut cx: FunctionContext) -> JsResult<JsNumber> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();

    let num = this.state.line_dash_offset;
    Ok(cx.number(num))
}

pub fn set_lineDashOffset(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();

    if let Some(num) = opt_float_arg(&mut cx, 1) {
        this.state.line_dash_offset = num;
    }
    Ok(cx.undefined())
}

pub fn get_lineJoin(mut cx: FunctionContext) -> JsResult<JsString> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();

    let mode = this.state.join;
    let name = from_stroke_join(mode);
    Ok(cx.string(name))
}

pub fn set_lineJoin(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    let name = string_arg(&mut cx, 1, "lineJoin")?;

    if let Some(mode) = to_stroke_join(&name) {
        this.state.join = mode;
    }
    Ok(cx.undefined())
}

pub fn get_lineWidth(mut cx: FunctionContext) -> JsResult<JsNumber> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();

    let num = this.state.stroke_width;
    Ok(cx.number(num))
}

pub fn set_lineWidth(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    if let Some(num) = opt_float_arg(&mut cx, 1) {
        if num > 0.0 {
            this.state.stroke_width = num;
        }
    }
    Ok(cx.undefined())
}

pub fn get_miterLimit(mut cx: FunctionContext) -> JsResult<JsNumber> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();

    let num = this.state.stroke_miter;
    Ok(cx.number(num))
}

pub fn set_miterLimit(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    if let Some(num) = opt_float_arg(&mut cx, 1) {
        if num > 0.0 {
            this.state.stroke_miter = num;
        }
    }
    Ok(cx.undefined())
}

//
// Imagery
//

fn _layout_rects(width: f32, height: f32, nums: &[f32]) -> Option<(Rect, Rect)> {
    let (src, dst) = match nums.len() {
        2 => (
            Rect::new(0.0 as f64, 0.0 as f64, width as f64, height as f64),
            Rect::new(
                nums[0] as f64,
                nums[1] as f64,
                (nums[0] + width) as f64,
                (nums[1] + height) as f64,
            ),
        ),
        4 => (
            Rect::new(0.0 as f64, 0.0 as f64, width as f64, height as f64),
            Rect::new(
                nums[0] as f64,
                nums[1] as f64,
                (nums[0] + nums[2]) as f64,
                (nums[1] + nums[3]) as f64,
            ),
        ),
        8 => (
            Rect::new(
                nums[0] as f64,
                nums[1] as f64,
                (nums[0] + nums[2]) as f64,
                (nums[1] + nums[3]) as f64,
            ),
            Rect::new(
                nums[4] as f64,
                nums[5] as f64,
                (nums[4] + nums[6]) as f64,
                (nums[5] + nums[7]) as f64,
            ),
        ),
        _ => return None,
    };
    Some((src, dst))
}

pub fn drawImage(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let source = cx.argument::<JsValue>(1)?;
    let image = {
        if let Ok(obj) = source.downcast::<BoxedImage, _>(&mut cx) {
            (&obj.borrow().image).clone()
        } else {
            return Ok(cx.undefined());
        }
    };

    let dims = image.as_ref().map(|img| (img.width, img.height));

    let (width, height) = match dims {
        Some((w, h)) => (w as f32, h as f32),
        None => return cx.throw_error("Cannot draw incomplete image (has it finished loading?)"),
    };

    let argc = cx.len() as usize;
    let nums = float_args(&mut cx, 2..argc)?;
    match _layout_rects(width, height, &nums) {
        Some((src, dst)) => {
            // shrink src to lie within the image bounds and adjust dst proportionately
            let (src, dst) = fit_bounds(width, height, src, dst);

            let mut this = this.borrow_mut();
            let frag = this.draw_image(&image.unwrap(), &src, &dst);
            this.page.lock().unwrap().frags.push(frag);

            Ok(cx.undefined())
        }
        None => cx.throw_error(format!(
            "Expected 2, 4, or 8 coordinates (got {})",
            nums.len()
        )),
    }
}

pub fn putImageData(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    let img_data = cx.argument::<JsObject>(1)?;

    // determine geometry
    let width = float_for_key(&mut cx, &img_data, "width")?;
    let height = float_for_key(&mut cx, &img_data, "height")?;
    let x = float_arg(&mut cx, 2, "x")?;
    let y = float_arg(&mut cx, 3, "y")?;
    let mut dirty = opt_float_args(&mut cx, 4..8);
    if !dirty.is_empty() && dirty.len() != 4 {
        return cx.throw_type_error("expected either 2 or 6 numbers");
    }
    let (mut src, mut dst) = match dirty.as_mut_slice() {
        [dx, dy, dw, dh] => {
            if *dw < 0.0 {
                *dw *= -1.0;
                *dx -= *dw;
            }
            if *dh < 0.0 {
                *dh *= -1.0;
                *dy -= *dh;
            }
            (
                Rect::new(
                    *dx as f64,
                    *dy as f64,
                    (*dx + *dw) as f64,
                    (*dy + *dh) as f64,
                ),
                Rect::new(
                    (*dx + x) as f64,
                    (*dy + y) as f64,
                    (*dx + x + *dw) as f64,
                    (*dy + y + *dh) as f64,
                ),
            )
        }
        _ => (
            Rect::new(0.0, 0.0, width as f64, height as f64),
            Rect::new(x as f64, y as f64, (x + width) as f64, (y + height) as f64),
        ),
    };

    let buffer: Handle<JsBuffer> = img_data.get(&mut cx, "data")?;
    let frag = this.blit_pixels(
        buffer.as_slice(&cx),
        width as u32,
        height as u32,
        &src,
        &dst,
    );
    this.page.lock().unwrap().frags.push(frag);

    Ok(cx.undefined())
}

//
// Typography
//

pub fn fillText(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    _draw_text(cx, true)
}

pub fn strokeText(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    _draw_text(cx, false)
}

fn _draw_text(mut cx: FunctionContext, flag: bool) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    let text = string_arg(&mut cx, 1, "text")?;
    let x = float_arg(&mut cx, 2, "x")?;
    let y = float_arg(&mut cx, 3, "y")?;
    let width = opt_float_arg(&mut cx, 4);

    if width.is_none()
        && cx.len() > 4
        && !cx.argument::<JsValue>(4)?.is_a::<JsUndefined, _>(&mut cx)
    {
        // it's fine to include an ignored `undefined` but anything else is invalid
        return Ok(cx.undefined());
    }

    let frag = this.draw_text(&text, x, y, width, flag);
    this.page.lock().unwrap().frags.push(frag);

    Ok(cx.undefined())
}

pub fn measureText(mut cx: FunctionContext) -> JsResult<JsObject> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    let text = string_arg(&mut cx, 1, "text")?;
    let width = opt_float_arg(&mut cx, 2);
    let (metrics, width) = this.measure_text(&text, width);

    let obj: Handle<JsObject> = cx.empty_object();

    let width: Handle<JsNumber> = cx.number(width as f64);
    obj.set(&mut cx, "width", width)?;

    let ascent: Handle<JsNumber> = cx.number(metrics.ascent as f64);
    obj.set(&mut cx, "ascent", ascent)?;

    let ascent: Handle<JsNumber> = cx.number(metrics.ascent as f64);
    obj.set(&mut cx, "fontAscent", ascent)?;

    let ascent: Handle<JsNumber> = cx.number(metrics.ascent as f64);
    obj.set(&mut cx, "emAscent", ascent)?;

    let descent: Handle<JsNumber> = cx.number(metrics.descent as f64);
    obj.set(&mut cx, "descent", descent)?;

    let descent: Handle<JsNumber> = cx.number(metrics.descent as f64);
    obj.set(&mut cx, "fontDescent", descent)?;

    let descent: Handle<JsNumber> = cx.number(metrics.descent as f64);
    obj.set(&mut cx, "emDescent", descent)?;

    Ok(obj)
}

pub fn outlineText(mut cx: FunctionContext) -> JsResult<JsValue> {
    //_draw_text(cx, false);
    Ok(cx.undefined().upcast())
}

// -- type properties ---------------------------------------------------------------

pub fn get_font(mut cx: FunctionContext) -> JsResult<JsString> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();
    Ok(cx.string(this.state.font.clone()))
}

pub fn set_font(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedContext2D>(0)?;
    let mut this = this.borrow_mut();

    let font_desc = cx.argument::<JsObject>(1)?;
    let families = strings_at_key(&mut cx, &font_desc, "family")?;
    let canonical = string_for_key(&mut cx, &font_desc, "canonical")?;
    let variant = string_for_key(&mut cx, &font_desc, "variant")?;
    let size = float_for_key(&mut cx, &font_desc, "size")?;
    let leading = float_for_key(&mut cx, &font_desc, "lineHeight")?;
    let path = string_for_key(&mut cx, &font_desc, "path")?;

    let weight = float_for_key(&mut cx, &font_desc, "weight")? as i32;
    //let slant = to_slant(string_for_key(cx, &font_desc, "style")?.as_str());
    //let width = to_width(string_for_key(cx, &font_desc, "stretch")?.as_str());
    let _ = this.set_font(size, weight, &path);

    Ok(cx.undefined())
}
