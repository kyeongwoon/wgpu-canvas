#![allow(unused_variables)]
#![allow(unused_mut)]
#![allow(dead_code)]
#![allow(unused_imports)]
use core::ops::Range;
use css_color::Rgba;
use neon::prelude::*;
use neon::result::Throw;
use std::cmp;
use std::f32::consts::PI;
use vello::kurbo::{Affine as Matrix, BezPath as Path, Cap, Join, Point, Rect, Stroke};
use vello::peniko::Color;
use vello::peniko::*;

use crate::context::PathEffect;

//
// meta-helpers
//

fn arg_num(o: usize) -> String {
    // let n = (o + 1) as i32; // we're working with zero-bounded idxs
    let n = o; // arg 0 is always self, so no need to increment the idx
    let ords = ["st", "nd", "rd"];
    let slot = ((n + 90) % 100 - 10) % 10 - 1;
    let suffix = if (0..=2).contains(&slot) {
        ords[slot as usize]
    } else {
        "th"
    };
    format!("{}{}", n, suffix)
}

pub fn almost_equal(a: f32, b: f32) -> bool {
    (a - b).abs() < 0.00001
}

pub fn to_degrees(radians: f32) -> f32 {
    radians / PI * 180.0
}

pub fn to_radians(degrees: f32) -> f32 {
    degrees / 180.0 * PI
}

pub fn check_argc(cx: &mut FunctionContext, argc: usize) -> NeonResult<()> {
    match cx.len() >= argc {
        true => Ok(()),
        false => cx.throw_type_error("Not enough arguments"),
    }
}


//
// strings
//

pub fn strings_in(cx: &mut FunctionContext, vals: &[Handle<JsValue>]) -> Vec<String> {
    let mut strs: Vec<String> = Vec::new();
    for (i, val) in vals.iter().enumerate() {
        if let Ok(txt) = val.downcast::<JsString, _>(cx) {
            let val = txt.value(cx);
            strs.push(val);
        }
    }
    strs
}

pub fn strings_at_key(
    cx: &mut FunctionContext,
    obj: &Handle<JsObject>,
    attr: &str,
) -> NeonResult<Vec<String>> {
    let array: Handle<JsArray> = obj.get(cx, attr)?;
    let list = array.to_vec(cx)?;
    Ok(strings_in(cx, &list))
}

pub fn string_for_key(
    cx: &mut FunctionContext,
    obj: &Handle<JsObject>,
    attr: &str,
) -> NeonResult<String> {
    let key = cx.string(attr);
    let val: Handle<JsValue> = obj.get(cx, key)?;
    match val.downcast::<JsString, _>(cx) {
        Ok(s) => Ok(s.value(cx)),
        Err(_e) => cx.throw_type_error(format!("Exptected a string for \"{}\"", attr)),
    }
}

pub fn opt_string_arg(cx: &mut FunctionContext, idx: usize) -> Option<String> {
    match cx.argument_opt(idx) {
        Some(arg) => match arg.downcast::<JsString, _>(cx) {
            Ok(v) => Some(v.value(cx)),
            Err(_e) => None,
        },
        None => None,
    }
}

pub fn string_arg_or(cx: &mut FunctionContext, idx: usize, default: &str) -> String {
    match opt_string_arg(cx, idx) {
        Some(v) => v,
        None => String::from(default),
    }
}

pub fn string_arg<'a>(cx: &mut FunctionContext<'a>, idx: usize, attr: &str) -> NeonResult<String> {
    let exists = cx.len() > idx;
    match opt_string_arg(cx, idx) {
        Some(v) => Ok(v),
        None => cx.throw_type_error(if exists {
            format!("{} must be a string", attr)
        } else {
            format!(
                "Missing argument: expected a string for {} ({} arg)",
                attr,
                arg_num(idx)
            )
        }),
    }
}

pub fn strings_to_array<'a>(
    cx: &mut FunctionContext<'a>,
    strings: &[String],
) -> JsResult<'a, JsArray> {
    let array = JsArray::new(cx, strings.len());
    for (i, val) in strings.iter().enumerate() {
        let num = cx.string(val.as_str());
        array.set(cx, i as u32, num)?;
    }
    Ok(array)
}

/// Convert from byte-indices to char-indices for a given UTF-8 string
pub fn string_idx_range(text: &str, start_idx: usize, end_idx: usize) -> Range<usize> {
    let mut indices = text.char_indices();
    let obtain_index = |(index, _char)| index;
    let str_len = text.len();

    Range {
        start: indices.nth(start_idx).map_or(str_len, &obtain_index),
        end: indices
            .nth((end_idx - start_idx).max(1) - 1)
            .map_or(str_len, &obtain_index),
    }
}

//
// bools
//

pub fn opt_bool_arg(cx: &mut FunctionContext, idx: usize) -> Option<bool> {
    match cx.argument_opt(idx) {
        Some(arg) => match arg.downcast::<JsBoolean, _>(cx) {
            Ok(v) => Some(v.value(cx)),
            Err(_e) => None,
        },
        None => None,
    }
}

pub fn bool_arg_or(cx: &mut FunctionContext, idx: usize, default: bool) -> bool {
    match opt_bool_arg(cx, idx) {
        Some(v) => v,
        None => default,
    }
}

pub fn bool_arg(cx: &mut FunctionContext, idx: usize, attr: &str) -> NeonResult<bool> {
    let exists = cx.len() > idx;
    match opt_bool_arg(cx, idx) {
        Some(v) => Ok(v),
        None => cx.throw_type_error(if exists {
            format!("{} must be a boolean", attr)
        } else {
            format!(
                "Missing argument: expected a boolean for {} (as {} arg)",
                attr,
                arg_num(idx)
            )
        }),
    }
}

//
// floats
//

pub fn float_for_key(
    cx: &mut FunctionContext,
    obj: &Handle<JsObject>,
    attr: &str,
) -> NeonResult<f32> {
    let key = cx.string(attr);
    let val: Handle<JsValue> = obj.get(cx, key)?;
    match val.downcast::<JsNumber, _>(cx) {
        Ok(num) => Ok(num.value(cx) as f32),
        Err(_e) => cx.throw_type_error(format!("Exptected a numerical value for \"{}\"", attr)),
    }
}

pub fn floats_in(cx: &mut FunctionContext, vals: &[Handle<JsValue>]) -> Vec<f32> {
    let mut nums: Vec<f32> = Vec::new();
    for (i, val) in vals.iter().enumerate() {
        if let Ok(num) = val.downcast::<JsNumber, _>(cx) {
            let val = num.value(cx) as f32;
            if val.is_finite() {
                nums.push(val);
            }
        }
    }
    nums
}

pub fn opt_float_arg(cx: &mut FunctionContext, idx: usize) -> Option<f32> {
    if let Some(arg) = cx.argument_opt(idx) {
        if let Ok(num) = arg.downcast::<JsNumber, _>(cx) {
            if num.value(cx).is_finite() {
                return Some(num.value(cx) as f32);
            }
        }
    }
    None
}

pub fn float_arg_or(cx: &mut FunctionContext, idx: usize, default: f64) -> f32 {
    match opt_float_arg(cx, idx) {
        Some(v) => v,
        None => default as f32,
    }
}

pub fn float_arg(cx: &mut FunctionContext, idx: usize, attr: &str) -> NeonResult<f32> {
    let exists = cx.len() > idx;
    match opt_float_arg(cx, idx) {
        Some(v) => Ok(v),
        None => cx.throw_type_error(if exists {
            format!("{} must be a number", attr)
        } else {
            format!(
                "Missing argument: expected a number for {} as {} arg",
                attr,
                arg_num(idx)
            )
        }),
    }
}

pub fn floats_to_array<'a>(cx: &mut FunctionContext<'a>, nums: &[f32]) -> JsResult<'a, JsValue> {
    let array = JsArray::new(cx, nums.len());
    for (i, val) in nums.iter().enumerate() {
        let num = cx.number(*val);
        array.set(cx, i as u32, num)?;
    }
    Ok(array.upcast())
}

pub fn f64_to_array<'a>(cx: &mut FunctionContext<'a>, nums: &[f64]) -> JsResult<'a, JsValue> {
    let array = JsArray::new(cx, nums.len());
    for (i, val) in nums.iter().enumerate() {
        let num = cx.number(*val);
        array.set(cx, i as u32, num)?;
    }
    Ok(array.upcast())
}

//
// float spreads
//

pub fn opt_float_args(cx: &mut FunctionContext, rng: Range<usize>) -> Vec<f32> {
    let end = cmp::min(rng.end, cx.len() as usize);
    let rng = rng.start..end;

    let mut args: Vec<f32> = Vec::new();
    for i in rng.start..end {
        if let Some(arg) = cx.argument_opt(i) {
            if let Ok(num) = arg.downcast::<JsNumber, _>(cx) {
                let val = num.value(cx) as f32;
                if val.is_finite() {
                    args.push(val);
                }
            }
        }
    }
    args
}

pub fn float_args(cx: &mut FunctionContext, rng: Range<usize>) -> NeonResult<Vec<f32>> {
    let need = rng.end - rng.start;
    let list = opt_float_args(cx, rng);
    let got = list.len();
    match got == need {
        true => Ok(list),
        false => cx.throw_type_error(format!(
            "Not enough arguments: expected {} numbers (got {})",
            need, got
        )),
    }
}

//
// Colors
//

pub fn css_to_color<'a>(css: &str) -> Option<Color> {
    css.parse::<Rgba>().ok().map(
        |Rgba {
             red,
             green,
             blue,
             alpha,
         }| Color::rgba(red as f64, green as f64, blue as f64, alpha as f64),
    )
}

pub fn color_in<'a>(cx: &mut FunctionContext<'a>, val: Handle<'a, JsValue>) -> Option<Color> {
    if val.is_a::<JsString, _>(cx) {
        let css = val.downcast::<JsString, _>(cx).unwrap().value(cx);
        return css_to_color(&css);
    }

    if let Ok(obj) = val.downcast::<JsObject, _>(cx) {
        if let Ok(attr) = obj.get::<JsValue, _, _>(cx, "toString") {
            if let Ok(to_string) = attr.downcast::<JsFunction, _>(cx) {
                let args: Vec<Handle<JsValue>> = vec![];
                if let Ok(result) = to_string.call(cx, obj, args) {
                    if let Ok(clr) = result.downcast::<JsString, _>(cx) {
                        let css = &clr.value(cx);
                        return css_to_color(css);
                    }
                }
            }
        }
    }

    None
}

pub fn color_arg(cx: &mut FunctionContext, idx: usize) -> Option<Color> {
    match cx.argument_opt(idx) {
        Some(arg) => color_in(cx, arg),
        _ => None,
    }
}

pub fn color_to_css<'a>(cx: &mut FunctionContext<'a>, color: &Color) -> JsResult<'a, JsValue> {
    let Color { r, g, b, a } = *color;
    let css = match color.a {
        255 => format!("#{:02x}{:02x}{:02x}", r, g, b),
        _ => {
            let alpha = format!("{:.3}", color.a as f32 / 255.0);
            let alpha = alpha.trim_end_matches('0');
            format!(
                "rgba({}, {}, {}, {})",
                r,
                g,
                b,
                if alpha == "0." { "0" } else { alpha }
            )
        }
    };
    Ok(cx.string(css).upcast())
}

//
// Matrices
//

// pub fn matrix_in(cx: &mut FunctionContext, vals:&[Handle<JsValue>]) -> NeonResult<Matrix>{
//   // for converting single js-array args
//   let terms = floats_in(vals);
//   match to_matrix(&terms){
//     Some(matrix) => Ok(matrix),
//     None => cx.throw_error(format!("expected 6 or 9 matrix values (got {})", terms.len()))
//   }
// }

pub fn to_matrix(t: &[f32]) -> Option<Matrix> {
    match t.len() {
        6 => Some(Matrix::new([
            t[0] as f64,
            t[1] as f64,
            t[2] as f64,
            t[3] as f64,
            t[4] as f64,
            t[5] as f64,
        ])),
        _ => None,
    }
}

// pub fn matrix_args(cx: &mut FunctionContext, rng: Range<usize>) -> NeonResult<Matrix>{
//   // for converting inline args (e.g., in Path.transform())
//   let terms = opt_float_args(cx, rng);
//   match to_matrix(&terms){
//     Some(matrix) => Ok(matrix),
//     None => cx.throw_error(format!("expected 6 or 9 matrix values (got {})", terms.len()))
//   }
// }

pub fn opt_matrix_arg(cx: &mut FunctionContext, idx: usize) -> Option<Matrix> {
    if let Some(arg) = cx.argument_opt(idx) {
        if let Ok(array) = arg.downcast::<JsArray, _>(cx) {
            if let Ok(vals) = array.to_vec(cx) {
                let terms = floats_in(cx, &vals);
                return to_matrix(&terms);
            }
        }
    }
    None
}

pub fn matrix_arg(cx: &mut FunctionContext, idx: usize) -> NeonResult<Matrix> {
    match opt_matrix_arg(cx, idx) {
        Some(v) => Ok(v),
        None => cx.throw_type_error("expected a DOMMatrix"),
    }
}

//
// Points
//

pub fn points_arg(cx: &mut FunctionContext, idx: usize) -> NeonResult<Vec<Point>> {
    let mut nums: Vec<f32> = vec![];
    if let Some(arg) = cx.argument_opt(idx) {
        if let Ok(array) = arg.downcast::<JsArray, _>(cx) {
            if let Ok(vals) = array.to_vec(cx) {
                nums = floats_in(cx, &vals);
            }
        }
    }

    if nums.len() % 2 == 1 {
        let which = if idx == 1 {
            "first"
        } else if idx == 2 {
            "second"
        } else {
            "an"
        };
        cx.throw_type_error(format!(
            "Lists of x/y points must have an even number of values (got {} in {} argument)",
            nums.len(),
            which
        ))
    } else {
        let points = nums
            .as_slice()
            .chunks_exact(2)
            .map(|pair| Point::new(pair[0] as f64, pair[1] as f64))
            .collect();
        Ok(points)
    }
}

//
// Path2D
//

use crate::path::BoxedPath2D;

pub fn opt_path2d_arg(cx: &mut FunctionContext, idx: usize) -> Option<Path> {
    if let Some(arg) = cx.argument_opt(idx) {
        if let Ok(arg) = arg.downcast::<BoxedPath2D, _>(cx) {
            let arg = arg.borrow();
            return Some(arg.path.clone());
        }
    }
    None
}

pub fn to_stroke_cap(mode_name: &str) -> Option<Cap> {
    let mode = match mode_name.to_lowercase().as_str() {
        "butt" => Cap::Butt,
        "round" => Cap::Round,
        "square" => Cap::Square,
        _ => return None,
    };
    Some(mode)
}

pub fn from_stroke_cap(mode: Cap) -> String {
    match mode {
        Cap::Butt => "butt",
        Cap::Round => "round",
        Cap::Square => "square",
    }
    .to_string()
}

//use skia_safe::PaintJoin;
pub fn to_stroke_join(mode_name: &str) -> Option<Join> {
    let mode = match mode_name.to_lowercase().as_str() {
        "miter" => Join::Miter,
        "round" => Join::Round,
        "bevel" => Join::Bevel,
        _ => return None,
    };
    Some(mode)
}

pub fn from_stroke_join(mode: Join) -> String {
    match mode {
        Join::Miter => "miter",
        Join::Round => "round",
        Join::Bevel => "bevel",
    }
    .to_string()
}

/*
use skia_safe::BlendMode;
pub fn to_blend_mode(mode_name: &str) -> Option<BlendMode> {
    let mode = match mode_name.to_lowercase().as_str() {
        "source-over" => BlendMode::SrcOver,
        "destination-over" => BlendMode::DstOver,
        "copy" => BlendMode::Src,
        "destination" => BlendMode::Dst,
        "clear" => BlendMode::Clear,
        "source-in" => BlendMode::SrcIn,
        "destination-in" => BlendMode::DstIn,
        "source-out" => BlendMode::SrcOut,
        "destination-out" => BlendMode::DstOut,
        "source-atop" => BlendMode::SrcATop,
        "destination-atop" => BlendMode::DstATop,
        "xor" => BlendMode::Xor,
        "lighter" => BlendMode::Plus,
        "multiply" => BlendMode::Multiply,
        "screen" => BlendMode::Screen,
        "overlay" => BlendMode::Overlay,
        "darken" => BlendMode::Darken,
        "lighten" => BlendMode::Lighten,
        "color-dodge" => BlendMode::ColorDodge,
        "color-burn" => BlendMode::ColorBurn,
        "hard-light" => BlendMode::HardLight,
        "soft-light" => BlendMode::SoftLight,
        "difference" => BlendMode::Difference,
        "exclusion" => BlendMode::Exclusion,
        "hue" => BlendMode::Hue,
        "saturation" => BlendMode::Saturation,
        "color" => BlendMode::Color,
        "luminosity" => BlendMode::Luminosity,
        _ => return None,
    };
    Some(mode)
}

pub fn from_blend_mode(mode: BlendMode) -> String {
    match mode {
        BlendMode::SrcOver => "source-over",
        BlendMode::DstOver => "destination-over",
        BlendMode::Src => "copy",
        BlendMode::Dst => "destination",
        BlendMode::Clear => "clear",
        BlendMode::SrcIn => "source-in",
        BlendMode::DstIn => "destination-in",
        BlendMode::SrcOut => "source-out",
        BlendMode::DstOut => "destination-out",
        BlendMode::SrcATop => "source-atop",
        BlendMode::DstATop => "destination-atop",
        BlendMode::Xor => "xor",
        BlendMode::Plus => "lighter",
        BlendMode::Multiply => "multiply",
        BlendMode::Screen => "screen",
        BlendMode::Overlay => "overlay",
        BlendMode::Darken => "darken",
        BlendMode::Lighten => "lighten",
        BlendMode::ColorDodge => "color-dodge",
        BlendMode::ColorBurn => "color-burn",
        BlendMode::HardLight => "hard-light",
        BlendMode::SoftLight => "soft-light",
        BlendMode::Difference => "difference",
        BlendMode::Exclusion => "exclusion",
        BlendMode::Hue => "hue",
        BlendMode::Saturation => "saturation",
        BlendMode::Color => "color",
        BlendMode::Luminosity => "luminosity",
        _ => "source-over",
    }
    .to_string()
}

use skia_safe::PathOp;
pub fn to_path_op(op_name: &str) -> Option<PathOp> {
    let op = match op_name.to_lowercase().as_str() {
        "difference" => PathOp::Difference,
        "intersect" => PathOp::Intersect,
        "union" => PathOp::Union,
        "xor" => PathOp::XOR,
        "reversedifference" | "complement" => PathOp::ReverseDifference,
        _ => return None,
    };
    Some(op)
}
*/

//use skia_safe::path_1d_path_effect;
pub fn to_1d_style(mode_name: &str) -> Option<PathEffect> {
    let mode = match mode_name.to_lowercase().as_str() {
        "move" => PathEffect::Translate,
        "turn" => PathEffect::Rotate,
        "follow" => PathEffect::Morph,
        _ => return None,
    };
    Some(mode)
}

pub fn from_1d_style(mode: PathEffect) -> String {
    match mode {
        PathEffect::Translate => "move",
        PathEffect::Rotate => "turn",
        PathEffect::Morph => "follow",
    }
    .to_string()
}

//use skia_safe::path::FillType;

pub fn fill_rule_arg_or(cx: &mut FunctionContext, idx: usize, default: &str) -> NeonResult<Fill> {
    let rule = match string_arg_or(cx, idx, default).as_str() {
        "nonzero" => Fill::NonZero,
        "evenodd" => Fill::EvenOdd,
        _ => {
            let err_msg = format!(
                "Argument {} ('fillRule') must be one of: \"nonzero\", \"evenodd\"",
                idx
            );
            return cx.throw_type_error(err_msg);
        }
    };
    Ok(rule)
}

// pub fn blend_mode_arg(cx: &mut FunctionContext, idx: usize, attr: &str) -> NeonResult<BlendMode>{
//   let mode_name = string_arg(cx, idx, attr)?;
//   match to_blend_mode(&mode_name){
//     Some(blend_mode) => Ok(blend_mode),
//     None => cx.throw_error("blendMode must be SrcOver, DstOver, Src, Dst, Clear, SrcIn, DstIn, \
//                             SrcOut, DstOut, SrcATop, DstATop, Xor, Plus, Multiply, Screen, Overlay, \
//                             Darken, Lighten, ColorDodge, ColorBurn, HardLight, SoftLight, Difference, \
//                             Exclusion, Hue, Saturation, Color, Luminosity, or Modulate")
//   }
// }

//
// Image Rects
//

pub fn fit_bounds(width: f32, height: f32, src: Rect, dst: Rect) -> (Rect, Rect) {
    let mut src = src;
    let mut dst = dst;
    let scale_x = dst.width() / src.width();
    let scale_y = dst.height() / src.height();

    if src.x0 < 0.0 {
        dst.x0 += -src.x0 * scale_x;
        src.x0 = 0.0;
    }

    if src.y0 < 0.0 {
        dst.y0 += -src.y0 * scale_y;
        src.y0 = 0.0;
    }

    if src.x1 > width as f64 {
        dst.x1 -= (src.x1 - width as f64) * scale_x;
        src.x1 = width as f64;
    }

    if src.y1 > height as f64 {
        dst.y1 -= (src.y1 - height as f64) * scale_y;
        src.y1 = height as f64;
    }

    (src, dst)
}
