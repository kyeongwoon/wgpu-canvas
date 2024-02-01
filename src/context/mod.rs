#![allow(unused_mut)]
#![allow(unused_imports)]
#![allow(unused_variables)]
#![allow(dead_code)]
use neon::prelude::*;
use vello::kurbo::{
    Affine as Matrix, BezPath as Path, Circle, Ellipse, Line, PathEl, Point, Rect, Shape, Size,
    Vec2, Stroke, Join, Cap, Dashes,
};
use vello::peniko::*;
use vello::peniko::{
    Blob, Brush, BrushRef, Color, Extend, Font, Format, Gradient, Image, StyleRef,
};

pub use vello::util::RenderSurface;
pub use vello::{
    util::RenderContext, Renderer, RendererOptions, Scene, SceneBuilder, SceneFragment,
};

use PathEl::*;

use std::cell::RefCell;
use std::sync::{Arc, Mutex, MutexGuard};
pub mod api;
use crate::gradient::{BoxedCanvasGradient, CanvasGradient};

use crate::utils::*;
use std::rc::Rc;
const BLACK: Color = Color::BLACK;
const TRANSPARENT: Color = Color::TRANSPARENT;
use vello::fello::meta::metrics;
use vello::fello::meta::MetadataProvider;
use vello::fello::raw::FontRef;
use vello::glyph::{Glyph, GlyphContext};

use smallvec::{smallvec, SmallVec};

#[derive(Clone, Copy)]
pub enum PathEffect {
    Translate,
    Rotate,
    Morph,
}

#[derive(Clone)]
pub struct State {
    clip: Option<Path>,
    matrix: Matrix,
    join: Join,
    cap: Cap,
    stroke_miter: f32,

    pub fill_style: Brush,
    stroke_style: Brush,
    stroke_width: f32,
    line_dash_offset: f32,
    line_dash_list: Dashes,
    line_dash_marker: Option<Path>,
    line_dash_fit: PathEffect,

    font: String,
    font_variant: String,
    font_features: Vec<String>,
    font_size: f32,
    font_weight: i32,
    font_ref: Font,
}

impl Default for State {
    fn default() -> Self {
        Self {
            clip: None,
            matrix: Matrix::IDENTITY,
            join: Join::Miter,
            cap: Cap::Butt,
            stroke_miter: 10.0,
            stroke_style: Brush::Solid(Color::BLACK),
            fill_style: Brush::Solid(Color::BLACK),
            stroke_width: 1.0,
            line_dash_offset: 0.0,
            line_dash_list: smallvec![],
            line_dash_marker: None,
            line_dash_fit: PathEffect::Rotate,

            font: "10px sans-serif".to_string(),
            font_variant: "normal".to_string(),
            font_features: vec![],
            font_size: 14.,
            font_weight: 100,
            font_ref: Font::new(Blob::new(Arc::new(ROBOTO_FONT)), 0),
        }
    }
}

//#[derive(Clone)]
pub struct Page {
    pub frags: Vec<SceneFragment>,
    pub bounds: Rect,
}

pub type BoxedContext2D = JsBox<RefCell<Context2D>>;
impl Finalize for Context2D {}
unsafe impl Send for Context2D {
    // PictureRecorder is non-threadsafe
}

pub struct Context2D {
    pub bounds: Rect,
    pub state: State,
    stack: Vec<State>,
    pub path: Path,
    //pub frags: Vec<SceneFragment>,
    pub page: Arc<Mutex<Page>>,
    pub gcx: MyGlyphContext,
    pub def_font: Font,
}

impl std::fmt::Debug for Context2D {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Context2D {{ bounds: {} }}", self.bounds)
    }
}

impl Context2D {
    pub fn new() -> Self {
        let bounds = Rect::new(0., 0., 500.0, 500.0);
        let frags = vec![];
        let page = Arc::new(Mutex::new(Page { bounds, frags }));

        Context2D {
            bounds,
            path: Path::new(),
            stack: vec![],
            state: State::default(),
            page,
            gcx: MyGlyphContext::new(),
            def_font: Font::new(Blob::new(Arc::new(ROBOTO_FONT)), 0),
        }
    }
    pub fn reset_size(&mut self, width: u32, height: u32) {
        self.bounds = Rect::new(0., 0., width as f64, height as f64);
    }
    pub fn resize(&mut self, width: u32, height: u32) {
        self.bounds = Rect::new(0., 0., width as f64, height as f64);
    }
    pub fn push(&mut self) {
        let new_state = self.state.clone();
        self.stack.push(new_state);
    }
    pub fn pop(&mut self) {
        // don't do anything if we're already back at the initial stack frame
        if let Some(old_state) = self.stack.pop() {
            self.state = old_state;
        }
    }
    pub fn map_points(&self, coords: &[f32]) -> Vec<Point> {
        coords
            .chunks_exact(2)
            .map(|pair| self.state.matrix * Point::new(pair[0] as f64, pair[1] as f64))
            .collect()
    }

    pub fn draw_path(&mut self, path: Option<Path>) -> SceneFragment {
        let mut path = path.unwrap_or_else(|| {
            // the current path has already incorporated its transform state
            let inverse = self.state.matrix.inverse();
            let mut path = self.path.clone();
            path.apply_affine(inverse);
            path
        });


        let mut fragment = SceneFragment::new();
        let mut builder = SceneBuilder::for_fragment(&mut fragment);

        builder.fill(
            Fill::NonZero, // NonZero
            self.state.matrix,
            &self.state.fill_style,
            None,
            &path,
        );
        fragment
    }

    pub fn draw_stroke(&mut self, path: Option<Path>) -> SceneFragment {
        let mut path = path.unwrap_or_else(|| {
            // the current path has already incorporated its transform state
            let inverse = self.state.matrix.inverse();
            let mut path = self.path.clone();
            path.apply_affine(inverse);
            path
        });
        let mut fragment = SceneFragment::new();
        let mut builder = SceneBuilder::for_fragment(&mut fragment);

        let st = Stroke::new(self.state.stroke_width as f64);
        let st = st.with_dashes(
            self.state.line_dash_offset as f64,
            self.state.line_dash_list.clone(),
        );

        builder.stroke(
            &st, // NonZero
            self.state.matrix,
            &self.state.stroke_style,
            None,
            &path,
        );

        fragment
    }

    pub fn draw_image(&mut self, image: &Image, src: &Rect, dst: &Rect) -> SceneFragment {
        let mut fragment = SceneFragment::new();
        let mut builder = SceneBuilder::for_fragment(&mut fragment);

        let (width, height) = (dst.width(), dst.height());
        let scale_x = width / image.width as f64;
        let scale_y = height / image.height as f64;

        builder.draw_image(
            image,
            Matrix::translate((dst.x0, dst.y0)) * Matrix::scale_non_uniform(scale_x, scale_y),
        );

        fragment
    }

    pub fn blit_pixels(
        &mut self,
        buffer: &[u8],
        width: u32,
        height: u32,
        src: &Rect,
        dst: &Rect,
    ) -> SceneFragment {
        let mut fragment = SceneFragment::new();
        let mut builder = SceneBuilder::for_fragment(&mut fragment);

        let data = Arc::new(buffer.to_vec());
        let blob = Blob::new(data);

        let scale_x = dst.width() / width as f64;
        let scale_y = dst.height() / height as f64;

        let img = Image::new(blob, Format::Rgba8, width, height);

        builder.draw_image(
            &img,
            Matrix::translate((dst.x0, dst.y0)) * Matrix::scale_non_uniform(scale_x, scale_y),
        );
        fragment
    }

    fn set_font(&mut self, size: f32, weight: i32, path: &str) -> std::io::Result<()> {
        use std::fs::File;
        use std::io::{self, Read};

        self.state.font_size = size;
        self.state.font_weight = weight;

        // read font from file
        let mut file = File::open(path)?;
        let mut buffer = Vec::new();
        file.read_to_end(&mut buffer)?;

        self.state.font_ref = Font::new(Blob::new(Arc::new(buffer)), 0);

        Ok(())
    }

    pub fn draw_text(
        &mut self,
        text: &str,
        x: f32,
        y: f32,
        width: Option<f32>,
        flag: bool,
    ) -> SceneFragment {
        let mut fragment = SceneFragment::new();
        let mut builder = SceneBuilder::for_fragment(&mut fragment);

        let text_size = self.state.font_size;
        let def_font_ref = to_font_ref(&self.def_font).unwrap();
        let font_ref = to_font_ref(&self.state.font_ref).unwrap();

        let fello_size = vello::fello::Size::new(text_size);

        let charmap = font_ref.charmap();
        let def_charmap = def_font_ref.charmap();

        let metrics = font_ref.metrics(fello_size, Default::default());
        let def_font_metrics = def_font_ref.metrics(fello_size, Default::default());

        let line_height = metrics.ascent - metrics.descent + metrics.leading;
        let glyph_metrics = font_ref.glyph_metrics(fello_size, Default::default());
        let def_glyph_metrics = def_font_ref.glyph_metrics(fello_size, Default::default());
        let mut pen_x = 0f64;
        let mut pen_y = 0f64;
        let vars: [(&str, f32); 0] = [];
        let mut gcx = MyGlyphContext::new();
        let mut def_provider = gcx.new_provider(&def_font_ref, None, text_size, false, vars);
        let mut provider = self.gcx.new_provider(&font_ref, None, text_size, false, vars);
        for ch in text.chars() {
            if ch == '\n' {
                pen_y += line_height as f64;
                pen_x = 0.0;
                continue;
            }
            let mut gid = charmap.map(ch).unwrap_or_default();
            if gid.to_u16() == 0 {
                let mut gid = def_charmap.map(ch).unwrap_or_default();
                let advance = def_glyph_metrics.advance_width(gid).unwrap_or_default() as f64;
                if let Some(glyph) = def_provider.get(gid.to_u16(), Some(&self.state.fill_style), flag) {
                    let xform = Matrix::translate((x as f64, y as f64))
                        * Matrix::translate((pen_x, pen_y))
                        * Matrix::scale_non_uniform(1.0, -1.0);
                    builder.append(&glyph, Some(xform));
                }
                pen_x += advance;
            } else {
                let advance = glyph_metrics.advance_width(gid).unwrap_or_default() as f64;
                if let Some(glyph) = provider.get(gid.to_u16(), Some(&self.state.fill_style), flag) {
                    let xform = Matrix::translate((x as f64, y as f64))
                        * Matrix::translate((pen_x, pen_y))
                        * Matrix::scale_non_uniform(1.0, -1.0);
                    builder.append(&glyph, Some(xform));
                }
                pen_x += advance;
            }
        }
        fragment
    }

    fn measure_text(&self, text: &str, width: Option<f32>) -> (metrics::Metrics, f64) {
        let v = vec![vec![0. as f32]];

        let size = self.state.font_size;
        let font = &self.state.font_ref;
        let font_ref = to_font_ref(font).unwrap();
        let def_font_ref = to_font_ref(&self.def_font).unwrap();

        let fello_size = vello::fello::Size::new(size);
        let charmap = font_ref.charmap();
        let metrics = font_ref.metrics(fello_size, Default::default());

        let def_charmap = def_font_ref.charmap();
        let def_font_metrics = def_font_ref.metrics(fello_size, Default::default());
        let def_glyph_metrics = def_font_ref.glyph_metrics(fello_size, Default::default());

        let line_height = metrics.ascent - metrics.descent + metrics.leading;
        let glyph_metrics = font_ref.glyph_metrics(fello_size, Default::default());
        let mut pen_x = 0f64;
        //let mut pen_y = 0f64;
        let vars: [(&str, f32); 0] = [];

        for ch in text.chars() {
            let gid = charmap.map(ch).unwrap_or_default();
            if gid.to_u16() == 0 {
                let mut gid = def_charmap.map(ch).unwrap_or_default();
                let advance = def_glyph_metrics.advance_width(gid).unwrap_or_default() as f64;
                pen_x += advance;

            } else {
                let advance = glyph_metrics.advance_width(gid).unwrap_or_default() as f64;
                pen_x += advance;
            }
        }
        (metrics, pen_x)
    }


    pub fn get_page(&self) -> Arc<Mutex<Page>> {
        let page = Arc::clone(&self.page);
        page
    }
}

const ROBOTO_FONT: &[u8] = include_bytes!("../../assets/roboto/main.ttf");

fn to_font_ref(font: &Font) -> Option<FontRef<'_>> {
    use vello::fello::raw::FileRef;
    let file_ref = FileRef::new(font.data.as_ref()).ok()?;
    match file_ref {
        FileRef::Font(font) => Some(font),
        FileRef::Collection(collection) => collection.get(font.index).ok(),
    }
}

////
///
use vello::fello::{
    raw::types::GlyphId,
    scale::{Context, Pen, Scaler},
    FontKey, Setting, Size as VSize,
};
//use vello::Encoding;

///
/// General context for creating scene fragments for glyph outlines.
pub struct MyGlyphContext {
    ctx: Context,
}

impl Default for MyGlyphContext {
    fn default() -> Self {
        Self::new()
    }
}

impl MyGlyphContext {
    /// Creates a new context.
    pub fn new() -> Self {
        Self {
            ctx: Context::new(),
        }
    }

    /// Creates a new provider for generating scene fragments for glyphs from
    /// the specified font and settings.
    pub fn new_provider<'a, V>(
        &'a mut self,
        font: &FontRef<'a>,
        font_id: Option<FontKey>,
        ppem: f32,
        hint: bool,
        variations: V,
    ) -> GlyphProvider<'a>
    where
        V: IntoIterator,
        V::Item: Into<Setting<f32>>,
    {
        let scaler = self
            .ctx
            .new_scaler()
            .size(VSize::new(ppem))
            .hint(hint.then_some(vello::fello::scale::Hinting::VerticalSubpixel))
            .key(font_id)
            .variations(variations)
            .build(font);
        GlyphProvider { scaler }
    }
}

/// Generator for scene fragments containing glyph outlines for a specific
/// font.
pub struct GlyphProvider<'a> {
    scaler: Scaler<'a>,
}

impl<'a> GlyphProvider<'a> {
    /// Returns a scene fragment containing the commands to render the
    /// specified glyph.
    pub fn get(&mut self, gid: u16, brush: Option<&Brush>, flag: bool) -> Option<SceneFragment> {
        let mut fragment = SceneFragment::default();
        let mut builder = SceneBuilder::for_fragment(&mut fragment);
        let mut path = BezPathPen::default();
        self.scaler.outline(GlyphId::new(gid), &mut path).ok()?;

        if flag {
            builder.fill(
                Fill::NonZero,
                Matrix::IDENTITY,
                brush.unwrap_or(&Brush::Solid(Color::rgb8(255, 255, 255))),
                None,
                &path.0,
            );
     
        } else {
            let st = Stroke::new(1.0);
            builder.stroke(
                &st, // NonZero
                Matrix::IDENTITY,
                brush.unwrap_or(&Brush::Solid(Color::rgb8(255, 255, 255))),
                None,
                &path.0,
            );    
        }
        Some(fragment)
    }

}

#[derive(Default)]
struct BezPathPen(vello::peniko::kurbo::BezPath);

impl Pen for BezPathPen {
    fn move_to(&mut self, x: f32, y: f32) {
        self.0.move_to((x as f64, y as f64))
    }

    fn line_to(&mut self, x: f32, y: f32) {
        self.0.line_to((x as f64, y as f64))
    }

    fn quad_to(&mut self, cx0: f32, cy0: f32, x: f32, y: f32) {
        self.0
            .quad_to((cx0 as f64, cy0 as f64), (x as f64, y as f64))
    }

    fn curve_to(&mut self, cx0: f32, cy0: f32, cx1: f32, cy1: f32, x: f32, y: f32) {
        self.0.curve_to(
            (cx0 as f64, cy0 as f64),
            (cx1 as f64, cy1 as f64),
            (x as f64, y as f64),
        )
    }

    fn close(&mut self) {
        self.0.close_path()
    }
}
