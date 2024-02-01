#![allow(unused_mut)]
#![allow(unused_imports)]
#![allow(unused_variables)]
#![allow(dead_code)]
use neon::{prelude::*, types::buffer::TypedArray};
use std::cell::RefCell;
use vello::peniko::{Blob, Format, Image as PenImage};

use crate::utils::*;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use lazy_static::lazy_static;

pub type BoxedImage = JsBox<RefCell<Image>>;
impl Finalize for Image {}

pub struct Image {
    src: String,
    pub image: Option<PenImage>,
}

fn decode_image(data: &[u8]) -> anyhow::Result<PenImage> {
    let image = image::io::Reader::new(std::io::Cursor::new(data))
        .with_guessed_format()?
        .decode()?;
    let width = image.width();
    let height = image.height();
    let data = Arc::new(image.into_rgba8().into_vec());
    let blob = Blob::new(data);
    Ok(PenImage::new(blob, Format::Rgba8, width, height))
}

//
// -- Javascript Methods --------------------------------------------------------------------------
//

pub fn new(mut cx: FunctionContext) -> JsResult<BoxedImage> {
    let this = RefCell::new(Image {
        src: "".to_string(),
        image: None,
    });
    Ok(cx.boxed(this))
}

pub fn get_src(mut cx: FunctionContext) -> JsResult<JsString> {
    let this = cx.argument::<BoxedImage>(0)?;
    let this = this.borrow();

    Ok(cx.string(&this.src))
}

pub fn set_src(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let this = cx.argument::<BoxedImage>(0)?;
    let mut this = this.borrow_mut();

    let src = cx.argument::<JsString>(1)?.value(&mut cx);
    this.src = src;
    Ok(cx.undefined())
}

pub fn set_data(mut cx: FunctionContext) -> JsResult<JsBoolean> {
    let this = cx.argument::<BoxedImage>(0)?;
    let mut this = this.borrow_mut();

    let buffer = cx.argument::<JsBuffer>(1)?;
    
    //let data = Data::new_copy(buffer.as_slice(&mut cx));
    //this.image = SkImage::from_encoded(data);
    //this.image = GLOBAL_MAP.get(this.src);

    this.image = decode_image(buffer.as_slice(&mut cx)).ok();
    //println!("image set data");
    Ok(cx.boolean(this.image.is_some()))
}

pub fn get_width(mut cx: FunctionContext) -> JsResult<JsValue> {
    let this = cx.argument::<BoxedImage>(0)?;
    let this = this.borrow();

    match &this.image {
        Some(image) => Ok(cx.number(image.width as f64).upcast()),
        None => Ok(cx.undefined().upcast()),
    }
}

pub fn get_height(mut cx: FunctionContext) -> JsResult<JsValue> {
    let this = cx.argument::<BoxedImage>(0)?;
    let this = this.borrow();

    match &this.image {
        Some(image) => Ok(cx.number(image.height as f64).upcast()),
        None => Ok(cx.undefined().upcast()),
    }
}

pub fn get_complete(mut cx: FunctionContext) -> JsResult<JsBoolean> {
    let this = cx.argument::<BoxedImage>(0)?;
    let this = this.borrow();
    Ok(cx.boolean(this.image.is_some()))
}
