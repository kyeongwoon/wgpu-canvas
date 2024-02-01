#![allow(unused_mut)]
#![allow(unused_imports)]
#![allow(unused_variables)]
#![allow(non_snake_case)]
#![allow(dead_code)]
use std::cell::RefCell;
use std::f32::consts::PI;
use neon::prelude::*;
use vello::kurbo::{
    Affine as Matrix, BezPath as Path, Circle, Ellipse, Line, PathEl, Point, Rect, Shape, Size,
    Vec2,
};

use crate::utils::*;

pub type BoxedPath2D = JsBox<RefCell<Path2D>>;
impl Finalize for Path2D {}

pub struct Path2D{
  pub path:Path
}

impl Path2D{
    pub fn new() -> Self{
      Self{ path:Path::new() }
    }
}  