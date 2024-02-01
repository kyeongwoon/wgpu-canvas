#![allow(non_snake_case)]
use neon::{prelude::*, types::buffer::TypedArray};
use std::cell::RefCell;

use crate::utils::*;

pub type BoxedCanvas = JsBox<RefCell<Canvas>>;
impl Finalize for Canvas {}

pub struct Canvas {
    pub width: f32,
    pub height: f32,
}

impl Canvas {
    pub fn new() -> Self {
        Canvas {
            width: 500.0,
            height: 500.0,
        }
    }
}

//
// -- Javascript Methods --------------------------------------------------------------------------
//

pub fn new(mut cx: FunctionContext) -> JsResult<BoxedCanvas> {
    let this = RefCell::new(Canvas::new());
    Ok(cx.boxed(this))
}

pub fn get_width(mut cx: FunctionContext) -> JsResult<JsNumber> {
    let this = cx.argument::<BoxedCanvas>(0)?;
    let width = this.borrow().width;
    Ok(cx.number(width as f64))
}

pub fn get_height(mut cx: FunctionContext) -> JsResult<JsNumber> {
    let this = cx.argument::<BoxedCanvas>(0)?;
    let height = this.borrow().height;
    Ok(cx.number(height as f64))
}

pub fn set_width(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedCanvas>(0)?;
    let width = float_arg(&mut cx, 1, "size")?;
    this.borrow_mut().width = width;
    Ok(cx.undefined())
}

pub fn set_height(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedCanvas>(0)?;
    let height = float_arg(&mut cx, 1, "size")?;
    this.borrow_mut().height = height;
    Ok(cx.undefined())
}

